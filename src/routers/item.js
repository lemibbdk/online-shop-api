const router = require('express').Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const itemController = require('../controllers/item')

router.post('/items', auth, itemController.add)

router.get('/items/categories', itemController.categories)

router.get('/items/:category/subcategories', itemController.subCategories)

router.post('/items/subcategories/:subCategory/all', itemController.items)

router.get('/items/:id', auth, itemController.item)

router.patch('/items/:id', auth, itemController.updateItem)

router.delete('/items/:id', auth, itemController.deleteItem)


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


router.post('/items/:id/picture', auth, upload.single('picture'), itemController.addPicture, (error, req, res, next) => {
    res.status(400).send({error: error.message})
});


router.delete('/items/:id/picture', auth, itemController.deletePicture);

router.get('/items/:id/picture', itemController.picture);

router.post('/names', itemController.names);

module.exports = router
