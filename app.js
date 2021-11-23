const path = require('path')
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const AppError = require('./utils/AppError')

//import modul router
const userRouter = require('./router/userRouter')
const filmRouter = require('./router/filmRouter')


const globalErrorHandler = require('./controller/ErrorController')

//CẤU HÌNH Express
const app = express()

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000/');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(cors())
app.options('*', cors())
app.use(express.json({limit : '10kb'}))
app.use(express.json())
app.use(express.urlencoded({
    extended: true
})); 
app.use(express.static(`${__dirname}/public`))// khai các file 
app.use(cookieParser())


// MIDDLEWARE
app.use(mongoSanitize())// chặn những mã try vấn đến db từ text của người dùng

app.use(xss())// chặng người dùng chằn những mã html vs <script/> ...

app.use(hpp(
    {
        whitelist:['duration', 'ratingsQuantity', 'ratingsAverage','maxGroupSize','difficulty','price'] 
        // ngoại lệ
    }
))// chặn 2 lần query parama giống nhau vd :  /api/v1/users?sort=price&sort=duration

//1 set security header
app.use(helmet())
app.use( // fix error csp //!https://stackoverflow.com/questions/67601708/axios-cdn-link-refused-to-load
    helmet.contentSecurityPolicy({
        directives: {
        defaultSrc: ["'self'", 'data:', 'blob:'],

        fontSrc: ["'self'", 'https:', 'data:'],

        scriptSrc: ["'self'", 'unsafe-inline'],

        scriptSrc: ["'self'", 'https://*.cloudflare.com'],

        scriptSrcElem: ["'self'",'https:', 'https://*.cloudflare.com'],

        styleSrc: ["'self'", 'https:', 'unsafe-inline'],

        connectSrc: ["'self'", 'data', 'https://*.cloudflare.com']
        },
    })
);


// print log for dev
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// bacsic midleware to test
app.use((req, res, next) => { // basic middleware check all req
    req.requestTime = new Date()
    // console.log("cookie: ",req.cookies)
    next()
})



//! Router
app.use('/api/v1/users', userRouter)
app.use('/api/v1/film', filmRouter)


//!



// xử lý các url ko được định nghĩa trong server
app.all('*', (req, res, next) => {
    
    //*Cách 1: Tạo ra lỗi để middleware bắt
    // const err = new Error(`Can't find ${req.originalUrl} on this server`)
    // err.statusCode = 404
    // err.status = 'fail'
    // next(err)
    
    //*Cách 2 :  
    next(new AppError(`404 : Can't find ${req.originalUrl} on this server`, 404))
})

app.use(globalErrorHandler)


module.exports = app
