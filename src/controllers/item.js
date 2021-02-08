const Item = require('../models/item')
const multer = require('multer')
const sharp = require('sharp')

const add = async (req, res) => {
    const item = new Item(req.body)

    try {
        await item.save()
        res.status(201).send(item)
    } catch (e) {
        res.status(400).send(e)
    }
}

const categories = async (req, res) => {
    try {
        const items = await Item.find()

        if (!items) {
            throw new Error()
        }

        const categories = items.map(item => item.category);

        const uniqueCategories = categories.filter((v, i, s) => s.indexOf(v) === i)
        res.send(uniqueCategories);
    } catch (e) {
        res.status(404).send();
    }
}

const subCategories = async (req, res) => {
    try {
        const items = await Item.find({category: req.params.category});

        if (!items) {
            throw new Error()
        }

        const subCategories = items.map(item => item.subCategory);

        const uniqueSubCategories = subCategories.filter((v, i, s) => s.indexOf(v) === i)
        res.send(uniqueSubCategories);
    } catch (e) {
        res.status(404).send();
    }
}

const items = async (req, res) => {
    const sort = {}
    // const match = {}
    const match = {query: {$and: []}}
    let kWordsPattern = '';

    const pageOptions = {
        page: parseInt(req.query.page, 10) || 0,
        limit: parseInt(req.query.limit, 10) || 10
    }

    if (req.body.kWords) {
        kWordsPattern = req.body.kWords.split(' ').join('|')
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    if (req.query.min && req.query.max) {
        match.query.$and.push({calcPrice: {$gte: Number(req.query.min)}})
        match.query.$and.push({calcPrice: {$lte: Number(req.query.max)}})
    }
    if (req.body.kWords) {
        match.query.$and.push({name: new RegExp(kWordsPattern, 'i')})
    }
    if (req.params.subCategory !== 'undefined') {
        match.query.$and.push({subCategory: req.params.subCategory})
    }
    if (req.body.category) {
        match.query.$and.push({category: req.body.category})
    }


    try {
        const totalItems = await Item.countDocuments(match.query)
        const items = await Item.find(match.query)
            .limit(pageOptions.limit).skip(pageOptions.page * pageOptions.limit).sort(sort)


        if (!items) {
            throw new Error()
        }

        const data = {
            totalItems,
            currentPage: pageOptions.page,
            pageSize: pageOptions.limit,
            items
        }

        res.send(data);
    } catch (e) {
        res.status(404).send()
    }
}

const item = async (req, res) => {
    const _id = req.params.id

    try {
        const item = await Item.findOne({ _id })

        if (!item) {
            return res.status(404).send()
        }

        res.send(item)
    } catch (e) {
        res.status(500).send()
    }
}

const updateItem = async (req, res) => {
    const updates = Object.keys(req.body)
    const isValidOperation = !updates.includes('available')

    if (!isValidOperation) {
        return res.status(400).send({message: 'Not allowed property to update!'})
    }

    try {
        const item = await Item.findOne({ _id: req.params.id })

        if (!item) {
            return res.status(404).send()
        }

        updates.forEach(update => item[update] = req.body[update])
        item.calcPrice = item.price - (item.price * item.discount / 100)

        if (item.reviews.length > 0) {
            let sumEvaluation = 0;
            item.reviews.forEach(el => {
                sumEvaluation += Number(el.evaluation)
            })

            item.totalEvaluation = sumEvaluation / item.reviews.length
        }

        await item.save();
        res.send(item)
    } catch (e) {
        res.status(400).send()
    }
}

const deleteItem = async (req, res) => {
    try {
        const item = await Item.findOneAndDelete({ _id: req.params.id })

        if (!item) {
            return res.status(404).send()
        }

        res.send(item)
    } catch (e) {
        res.status(500).send()
    }
}

const names = async (req, res) => {
    try {
        const items = await Item.find({name: new RegExp(req.body.value.trim(), 'i')});

        const results = items.map(el => el.name)


        res.send(results)
    } catch (e) {
        res.status(500).send()
    }
}

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

const addPicture = async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 200, height: 200 }).png().toBuffer()

    try {
        const item = await Item.findOne({_id: req.params.id})

        if (!item) {
            throw res.status(404).send()
        }

        item.picture = buffer

        await item.save()
        res.send({message: 'Uploaded successfully'})
    } catch (e) {
        res.status(500).send(e)
    }
}

const deletePicture = async (req, res) => {
    try {
        const item = await Item.findOne({_id: req.params.id})

        if (!item) {
            throw res.status(404).send()
        }

        item.picture = undefined

        await item.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
}

const picture = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)

        if (!item || !item.picture) {
            throw new Error('No item or no picture found!')
        }

        res.set('Content-Type', 'image/png')
        res.send(item.picture)

    } catch (e) {
        res.status(404).send(e)
    }
}

module.exports = {
    add,
    categories,
    subCategories,
    items,
    item,
    updateItem,
    deleteItem,
    names,
    addPicture,
    deletePicture,
    picture
}
