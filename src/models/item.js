const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        trim: true,
        validate(value) {
            if (value <= 0) {
                throw new Error('Invalid value of price')
            }
        }
    },
    discount: {
        type: Number,
        trim: true,
        validate(value) {
            if (value < 0 || value > 100) {
                throw new Error('Discount is invalid - less then 0 or more then 100!')
            }
        }
    },
    calcPrice: {
        type: Number
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    subCategory: {
        type: String,
        required: true,
        trim: true
    },
    properties: [{
        property: {
            type: String,
            trim: true
        },
        value: {
            type: String,
            trim: true
        }
    }],
    shortDescription: {
        type: String,
        trim: true,
        default: 'No description',
        validate(value) {
            if (value.length > 200) {
                throw new Error('Exceeded length of description!')
            }
        }
    },
    remaining: {
        type: Number,
        required: true,
        trim: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Invalid remaining!')
            }
        }
    },
    available: {
        type: Boolean,
        default: true,
    },
    reviews: [{
        type: new mongoose.Schema({
            review: {
                type: String,
                trim: true,
                validate(value) {
                    if (value.length > 120) {
                        throw new Error('Exceeded length of review!')
                    }
                }
            },
            evaluation: {
                type: Number,
                trim: true,
                validate(value) {
                    const allowedValues = [1, 2, 3, 4, 5]
                    if (!allowedValues.includes(value)) {
                        throw new Error('Evaluation value is incorrect!')
                    }
                }
            },
            user: {
                type: mongoose.Schema.Types.ObjectId
            },
            name: {
                type: String
            }
        }, {timestamps: true})
    }],
    totalEvaluation: {
        type: Number,
        default: 0
    },
    seller: {
        type: String,
        required: true,
        trim: true
    },
    countryOrigin: {
        type: String,
        required: true,
        trim: true
    },
    locatedIn: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            const allowedLocations = ['Belgrade', 'Nis', 'Novi Sad', 'Kragujevac', 'Leskovac', 'Subotica', 'Cacak'];

            if (!allowedLocations.includes(value)) {
                throw new Error('Invalid location')
            }
        }
    },
    picture: {
        type: Buffer
    }
}, {
    timestamps: true
})

itemSchema.methods.toJSON = function () {
    const item = this
    const itemObject = item.toObject();

    delete itemObject.picture

    return itemObject
};

itemSchema.pre('save', async function(next) {
    const item = this

    item.price = item.price.toFixed(2)
    item.available = item.remaining > 0;

    next();
});

const Item = mongoose.model('Item', itemSchema)

module.exports = Item
