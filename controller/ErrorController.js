const AppError = require("../utils/AppError")

const sendErrorDev = (err, req ,res) => {
    if(req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status : err.status,
            message : err.message,
            err:err,
            stack:err.stack// Các ngăn xếp
        })
    }else{
        res.status(err.statusCode).render('error',{
            title: 'ERROR',
            msg : err.message
        })
    }
}
const sendErrorProd = (err,req ,res) => {
    if(req.originalUrl.startsWith('/api')){
        if(err.isOperational){ // log lỗi cho co môi trường prod như hạn chế
            res.status(err.statusCode).json({
                status : err.status,
                message : err.message,
            })
        }else{// không log lỗi 
            res.status(500).json({
                status : 'error',
                message : 'Something went very wrong !',
            })
        }
    }else{
        if(err.isOperational){ // log lỗi cho co môi trường prod như hạn chế
            res.status(err.statusCode).render('error',{
                title: 'ERROR',
                msg : err.message
            })
        }else{// không log lỗi 
            console.log("error :", err)
            res.status(err.statusCode).render('error',{
                title : 'error',
                msg : 'Something went very wrong !',
            })
        }
    }

}

const handleCastErrorDB = (err) =>{// xử lý lỗi nhập bừa prama id của post
    const message = `Cast to ObjectId failed for value ${err.value} at path ${err.path}`
    return new AppError(message, 404)// Gọi hàm này để định nghĩa lại lỗi
}

const handleDulicateFieldsDB = (err) => {//Xử lý lỗi khi trùng tên
    let nameErr =err.errmsg.match(/(["'])(\\?.)*?\1/)
    const message = `Dulicate field value : ${nameErr}. please use another value!`
    return new AppError(message, 404)// Gọi hàm này để định nghĩa lại lỗi
}

const handleValidationErrorDB = (err) => {//lỗi validate 
    let errors = Object.values(err.errors).map(el => el.message)
    console.log(errors)
    const message = `Invalid input data : ${errors.join('.  ')}`
    return new AppError(message, 404)// Gọi hàm này để định nghĩa lại lỗi
}

const handleJWTError = (err) => {
    return new AppError('invalida token, please login agin!', 401)
}

const handleTokenExpiredError = (err) => {
    return new AppError('The session has expired, please login again', 401)
}

module.exports = (err, req, res, next) => {
    console.log(process.env.NODE_ENV)//
    
    console.log("\x1b[31m","--------------------------------------------")
    console.log(`log error from ErrorController :`, err)
    console.log("\x1b[31m","--------------------------------------------")
    
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    if(process.env.NODE_ENV === 'development'){// Log lỗi theo dev

        sendErrorDev(err,req ,res)

    }else if(process.env.NODE_ENV === 'production'){//log loi theo prod
        let error = {...err}
            error.message = err.message
        // console.log('---------------------------')
        // console.log("check err",err)
        // console.log("check",error)
        // console.log('---------------------------')
        if(error.name === 'CastError'){
            error = handleCastErrorDB(error) // costomize lai log error
        }
        if(error.code === 11000){
            error = handleDulicateFieldsDB(error)
        }
        if(error.name === "ValidationError"){
            error = handleValidationErrorDB(error)
        }
        if(error.name === "JsonWebTokenError"){
            error = handleJWTError(error)
        }
        if(error.name === "TokenExpiredError"){
            error = handleTokenExpiredError(error)
        }


        sendErrorProd(error,req,res)
    }

}