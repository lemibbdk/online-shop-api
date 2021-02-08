const router = require('express').Router()
const auth = require('../middleware/auth')
const cartController = require('../controllers/cart')

router.post('/carts', auth, cartController.add)

router.get('/carts', auth, cartController.carts)

router.get('/carts/:id', auth, cartController.cart)

router.patch('/carts/:id', auth, cartController.updateCart)

router.delete('/carts/:id', auth, cartController.deleteCart)

module.exports = router
