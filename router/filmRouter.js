const express = require('express')
const filmController = require('../controller/filmController')
const router = express.Router()


router.route('/')
    .post(filmController.createFilm)
    .get(filmController.getAllFilm)

router.route('/:id')
    .get(filmController.getFilmByidTmdb)
    .patch(filmController.uploadFile,filmController.updateFilm)
    .delete(filmController.deleteFilm)

module.exports = router