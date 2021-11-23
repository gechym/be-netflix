//name email password image isAdmin membership 
const mongoose = require('mongoose')
const validator = require('validator') 
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name : {type : String, require : [true, "vui lòng cung cấp tên người dùng"]},
    email : {
        type : String,
        require : [true, "vui lòng cung cấp email"],
        validate : [validator.isEmail, 'Please provide your email'], 
        unique : true,
        lowercase : true
    },
    password: {
        type : String,
        required : [true, 'Vui lòng cung cấp password'],
        minlength : 8,
        select :false //để db không show ra ghi find
    },
    image : {type : String, default : 'default.jpg'},
    isAdmin : {type : Boolean , default : false},
    membership : {type : Boolean , default : false},
    list : [
        {
            type : mongoose.Schema.ObjectId,
            ref: 'Film'
        }
    ]
},{
    toJSON : {virtuals:true},
    toObject : {virtuals:true}
})

// userSchema.pre(/^find/, function(next){
//     this.populate({
//         path : 'list',
//     })
//     next()
// })


userSchema.pre('save',async function(next){// khi tạo tk thì hàm này sẽ băm pass người dùng nhập vào
    if(this.password){
        this.password = await bcrypt.hash(this.password, 12) // Băm password trước khi lưu vào db
        next()// lưu vào db
    }else{
        next()
    }
})



userSchema.methods.correctPassword = async function(password, passwordHash){ 
    return await bcrypt.compare(password, passwordHash) // so sánh pass vs hash pass => true or false
}



const User = mongoose.model('User', userSchema)
module.exports = User