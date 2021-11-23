require('dotenv').config({path : './config.env'})
const mongoose = require('mongoose')
const app = require('./app')


mongoose.connect(process.env.DATABASE_LOCAL,{ 
    useNewUrlParser : true,
    useCreateIndex : true, 
    useFindAndModify : false,
    useUnifiedTopology: true
}).then(con => {    
    console.log("DB connection successful !")
})

const port = process.env.PORT || 8080

const server = app.listen(port, () => {
    console.log(`App runing on port ${port}`)
})

process.on('unhandledRejection', err => { // case trường hợp các promise ko bắt error thì nó on mic
    console.log(err) // log lỗi
    server.close(() => { //close server
        process.exit(1) 
    })
})


process.on('uncaughtException', err => { // case lỗi Exception
    console.log(err.name, err.message) // log lỗi
    server.close(() => { //close server
        process.exit(1) 
    })
})