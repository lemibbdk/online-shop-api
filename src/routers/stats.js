const router = require('express').Router()
const statsController = require('../controllers/stats')

router.get('/stats/bestBuyItems', statsController.bestBuy);

router.get('/stats/mostFavoriteItems', statsController.mostFavorite);

router.get('/stats/bestRatedItems', statsController.bestRated);

module.exports = router
