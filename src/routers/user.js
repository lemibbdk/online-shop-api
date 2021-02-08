const auth = require('../middleware/auth')
const router = require('express').Router()
const multer = require('multer')
const userController = require('../controllers/user')


router.post('/users', userController.add);

router.post('/users/login', userController.login)

router.post('/users/logout', auth, userController.logout)

router.post('/users/logoutAll', auth, userController.logoutAll)

router.get('/users/me', auth, userController.profile);

router.get('/users/wishList', auth, userController.wishList)

router.patch('/users/me', auth, userController.updateProfile)

router.delete('/users/me', auth, userController.deleteProfile)

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

router.post('/users/me/avatar', auth, upload.single('avatar'), userController.avatar, (error, req, res, next) => {
    res.status(400).send({error: error.message})
});

router.delete('/users/me/avatar', auth, userController.deleteAvatar);

router.get('/users/:id/avatar', userController.getAvatar);

module.exports = router
