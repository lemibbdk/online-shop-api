const User = require('../models/user')
const Cart = require('../models/cart')
const sharp = require('sharp')

const add = async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        const cart = new Cart({items: [], owner: user._id})
        await cart.save()
        user.currentCart = cart._id
        await user.save()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
}

const login = async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        await user.populate({
            path: 'wishList currentCart',
            select: '-picture',
            populate: {
                path: 'items.item',
                model: 'Item',
                select: '-picture'
            }
        }).execPopulate()
        res.send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
}

const logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)

        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
}

const logoutAll = async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
}

const profile = async (req, res) => {
    res.send(req.user)
}

// router.get('/users/me', auth, async (req, res) => {
//     try {
//         // const user = await req.user.populate({
//         //     path: 'currentCart wishList',
//         //     select: '-picture',
//         //     populate: {
//         //         path: 'items.item',
//         //         model: 'Item',
//         //         select: '-picture'
//         //     }
//         // }).execPopulate()
//
//         res.send(req.user)
//     } catch (e) {
//         res.status(500).send(e)
//     }
// })

const wishList = async (req, res) => {
    try {
        const user = await req.user.populate({
            path: 'wishList',
            select: '-picture',
        }).execPopulate()

        res.send(req.user.wishList)
    } catch (e) {
        res.status(500).send(e)
    }
}

const updateProfile = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'phone', 'address', 'place', 'currentCart', 'wishList', 'role']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates'})
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
}

const deleteProfile = async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
}

const avatar = async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    // req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}

const deleteAvatar = async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}

const getAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch (e) {
        res.status(404).send()
    }
}

module.exports = {
    profile,
    add,
    login,
    logout,
    logoutAll,
    wishList,
    updateProfile,
    deleteProfile,
    avatar,
    deleteAvatar,
    getAvatar
}
