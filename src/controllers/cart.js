const Cart = require('../models/cart')

const add = async (req, res) => {
    const cart = new Cart({
        ...req.body,
        owner: req.user._id
    })

    try {
        await cart.save()
        res.status(201).send(cart)
    } catch (e) {
        res.status(400).send(e)
    }
}

const carts = async (req, res) => {
    try {
        await req.user.populate({
            path: 'carts',
            populate: 'items.item'
        }).execPopulate()

        res.send(req.user.carts)
    } catch (e) {
        res.status(500).send(e)
    }
}

const cart = async (req, res) => {
    const _id = req.params.id

    try {
        const cart = await Cart.findOne({_id, owner: req.user._id})

        if (!cart) {
            return res.status(404).send()
        }

        await cart.populate('items.item').execPopulate()

        res.send(cart)
    } catch (e) {
        res.status(500).send(e)
    }
}

const updateCart = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['items', 'status']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({message: 'Invalid updates'})
    }

    try {
        const cart = await Cart.findOne({_id: req.params.id, owner: req.user._id})

        if (!cart) {
            return res.status(404).send()
        }

        if (updates.includes('items')) {
            cart.items = req.body.items
            let overAllPrice = 0
            cart.items.forEach((cartItem) => {
                let calculatedPrice
                if (cartItem.currentDiscount !== 0) {
                    calculatedPrice = (cartItem.currentPrice - (cartItem.currentPrice * cartItem.currentDiscount / 100)) * cartItem.quantity;
                } else {
                    calculatedPrice = cartItem.currentPrice * cartItem.quantity
                }
                cartItem.calculatedPrice = calculatedPrice
                overAllPrice += calculatedPrice

                // const item = Item.findById(cartItem.item._id)
                // item.remaining -= cartItem.quantity;
                //
                // item.save()
            })

            cart.overAllPrice = overAllPrice
        }

        if (updates.includes('status')) {
            cart.status = req.body.status;
        }

        await cart.populate({
            path: 'items.item'
        }).execPopulate();

        await cart.save()
        res.send(cart)
    } catch (e) {
        res.status(400).send(e)
    }
}

const deleteCart = async (req, res) => {
    try {
        const cart = await Cart.findOneAndDelete({_id: req.params.id, owner: req.user._id})

        if (!cart) {
            return res.status(404).send()
        }

        res.send(cart)
    } catch (e) {
        res.status(500).send(e)
    }
}

module.exports = {
    add,
    carts,
    cart,
    updateCart,
    deleteCart
}
