const express = require('express')
const userController = require('../controller/userController')
const authController = require('../controller/authController')
const router = express.Router()

router.get('/getCheckOutSession/:idUser', authController.getCheckOutSession)
router.get('/setMenbership/:id', authController.setMenbership)
router.route('/signup').post( authController.signup)
router.route('/login').post(authController.login)
router.route('/:id').get(authController.getUserById)
router.route('/addMyListAndDb').post(authController.addMyListAndDb)
router.route('/addMyList').post(authController.addMyList)



module.exports = router