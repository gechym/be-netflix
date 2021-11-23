//name email password image isAdmin membership 
const mongoose = require('mongoose')

const filmSchema = new mongoose.Schema({
    id : {type : Number, unique:true},
    overview : {type : String},
    poster_path : {type : String},
    release_date : {type : String},
    backdrop_path : {type : String},
    original_title : {type : String},
    link : {type : String , default : 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'},
    sub : {type : String}
},{
    toJSON : {virtuals:true},
    toObject : {virtuals:true}
})


const Film = mongoose.model('Film', filmSchema)
module.exports = Film