const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        },
        quantity: {
            type: Number,
            trim: true
        },
        currentPrice: Number,
        currentDiscount: Number,
        calculatedPrice: Number
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    overAllPrice: {
        type: Number
    },
    status: {
        type: String,
        default: 'progress'
    }
}, {
    timestamps: true
})

const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart
