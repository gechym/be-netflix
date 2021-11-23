const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');



const getAllUser = catchAsync(async(req, res, next) => {


    return res.status(200).json({
        message : 'hello các bạn'
    })
})


module.exports = {
    getAllUser
}