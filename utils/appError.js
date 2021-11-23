class AppError extends Error {// tạo một lỗi do mình tự định nghĩa
    constructor(message,statusCode){
        super(message) 
        // Kết thừa phương thức messsage có nghĩa là this.message = message
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError