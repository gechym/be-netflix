const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Film = require('../module/filmModule')
const multer = require('multer')

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/sub/');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `film-${req.params.id}.vtt`);
  }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('text')) {
      cb(null, true);
    } else {
      cb(null, true);
        //! bug
    //   cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
  
const uploadFile = upload.single('sub');



const createFilm = catchAsync(async(req, res, next) => {
    const film = await Film.create(req.body)

    return res.status(200).json({
        message : 'success',
        film : film 
    })
})

const getAllFilm = catchAsync(async(req, res, next) => {
    const films = await Film.find()

    return res.status(200).json({
        message : 'success',
        films : films
    })
})

const getFilmByidTmdb = catchAsync(async(req, res, next) => {
    
    const film = await Film.findOne({id : req.params.id})

    return res.status(200).json({
        message : 'success',
        film : film
    })
})

const updateFilm = catchAsync(async(req, res, next) => {
    console.log(req.file)
    let film  
    if(req.file){
        film = await Film.findOneAndUpdate({id : req.params.id}, 
            {...req.body , sub:req.file.filename }, 
            {
                new : true
            }
        )

    }else{
        film = await Film.findOneAndUpdate({id : req.params.id}, 
            {...req.body }, 
            {
                new : true
            }
        )
    }

    return res.status(200).json({
        message : 'success',
        film : film
    })
})

const deleteFilm = catchAsync(async(req, res, next) => {
    
    await Film.findByIdAndDelete( req.params.id)

    return res.status(200).json({
        message : 'success',
    })
})

module.exports = {
    createFilm,
    getAllFilm,
    getFilmByidTmdb,
    updateFilm,
    deleteFilm,
    uploadFile
}