const User = require('../models/user')
const Cart = require('../models/cart')
const Item = require('../models/item')

const bestBuy = async (req, res) => {
    try {
        const carts = await Cart.find()
        const items = carts
            .filter(el => el.status !== 'progress')
            .reduce((acc, cart) => acc.concat(cart.items), [])
            .reduce((acc, item) => {
                if (!acc[item.item]) {
                    acc[item.item] = 0
                }
                acc[item.item] += item.quantity

                return acc
            } ,{})

        const itemsIdArr = Object.getOwnPropertyNames(items)

        const toSortArr = [];
        for (let item of itemsIdArr) {
            toSortArr.push({item, count: items[item]})
        }

        toSortArr.sort((a, b) => a.count < b.count ? 1 : -1)

        const top3 = toSortArr.slice(0, 3)

        for (let el of top3) {
            el.item = await Item.findById(el.item);
        }

        res.send(top3)
    } catch (e) {
        res.status(500).send()
    }
}

const mostFavorite = async (req, res) => {
    try {
        const users = await User.find()

        const items = users
            .reduce((acc, user) => acc.concat(user.wishList),[])
            .reduce((acc, item) => {
                if (!acc[item]) {
                    acc[item] = 0;
                }
                acc[item]++

                return acc
            }, {})

        const itemIdArr = Object.getOwnPropertyNames(items);

        const toSortArr = []

        for (let item of itemIdArr) {
            toSortArr.push({item, count: items[item]})
        }

        toSortArr.sort((a, b) => a < b ? 1 : -1);

        const top3 = toSortArr.slice(0, 3)

        for (let item of top3) {
            item.item = await Item.findById(item.item)
        }

        res.send(top3)
    } catch (e) {
        res.status(500).send(e)
    }
}

const bestRated = async (req, res) => {
    try {
        const items = await Item.find();

        const top3 = items.sort((a, b) => a.totalEvaluation < b.totalEvaluation ? 1 : -1).slice(0, 3)

        res.send(top3);
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
}

module.exports = {
    bestBuy,
    mostFavorite,
    bestRated
}
