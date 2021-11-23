const User = require('../module/userModule')
const Film = require('../module/filmModule')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken')
const stripe = require('stripe')(process.env.STRIPE_SECTRET_KEY)

const signToken = (id) => {
    return jwt.sign({id : id},process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES_IN,
    })
}

const createSendToken = (user, statusCode, res) => {{
    const token = signToken(user._id)

    res.cookie('jwt', token,{// gửi cookie cho clied để mỗi lần req sau clied sẽ tự động gửi về server
        expires: new Date( Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 ),
        // cookie này tồn tại 90n
        // secure:true,
        httpOnly: true
    })

    res.status(statusCode).json({
        status: 'success',
        token : token,
        data: {
            user : user,
        }
    })
}}


const signup = catchAsync( async (req, res, next) => {
    const user = await User.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        // image : req.body.image
    })
    createSendToken(user, 200, res)
})

const login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body

    // 1 check email và passwor có phận không
        if(!email || !password){
            return next(new AppError('Vui lòng cung cấp email và password', 404))
        }
    // 2 check người dùng 
        let user = await User.findOne({email}).select('+password').populate({
            path : 'list',
        })//* .select() để lấy password khi module chặn show

        if(!user){
            return next(new AppError('Mật khẩu hoặc password không đóng', 404))
        }
        
        // check password
            const correct = await user.correctPassword(password, user.password)

            if(!correct){
                return next(new AppError('Mật khẩu hoặc password không đóng', 400))
            }

    // 3 nếu ok gửi token cho máy khách
        createSendToken(user, 201, res)
})


const getUserById = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).populate({
        path : 'list',
    })
    if(!user) {
        return next(new AppError('nguoi dung khong ton tai', 400))
    }

    res.status(200).json({
        user : user
    })
})

const addMyListAndDb = catchAsync(async (req, res, next) => {
    const {idFilm, idUser} = req.body
    const user = await User.findById(idUser)
    user.list = user.list.includes(idFilm) ? user.list : [...user.list, idFilm]
    await user.save({validator : false})

    res.status(200).json({
        message : 'success',
        user : user
    })
})

const addMyList = catchAsync(async (req, res, next) => {
    const {idFilmTmdb, idUser} = req.body
    const film = await Film.findOne({id : idFilmTmdb})
    
    const user = await User.findById(idUser)
    console.log(user)
    console.log(film._id)
    console.log(user.list.includes(film._id))
    user.list = user.list.includes(film._id) ? user.list : [...user.list, film._id]
    await user.save({validator : false})
    res.status(200).json({
        status : 'success',
        user
    })
})




const getCheckOutSession = catchAsync( async (req, res, next) => {

    if(!req.params.idUser){
        return res.status(200).json({
            url : '/'
        })
    }

    const user = await User.findById(req.params.idUser)

    if(!user){
        return res.status(200).json({
            url : '/'
        })
    }


    //TODO Create Checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types : ['card'],
        success_url:`http://localhost:8000/api/v1/users/setMenbership/${user.id}`,//Nếu Người dụng Thanh toán thành công thì chuyển hướng theo đường link, kèm th để lưu vào đb
        cancel_url: `http://localhost:3006/`, // về trang họ định chọn
        customer_email : user.email, //Để Dùng sao này không bắt người dùng nhập lại
        client_reference_id : user.id, //  

        line_items : [
            { // Lưu vào stripe thông tin tour 
                name : user.name,
                description: 'Netflix menbership',
                images : [`https://cdnuploads.aa.com.tr/uploads/Contents/2021/04/21/thumbs_b_c_ca45424907db77263b0b4649818a8707.jpg?v=160308`],
                amount : 200 * 100,
                currency : 'usd',
                quantity : 1
            }
        ]
    })

    res.status(200).json({
        url : session.url
    })
    
})

const setMenbership = catchAsync(async (req, res, next) => {
    const id = req.params.id
    // membership
    const user = await User.findById(id)
    user.membership = true
    await user.save({validateBeforeSave : false})

    res.redirect('http://localhost:3000/')
})


module.exports = {
    signup,
    login,
    getUserById,
    addMyListAndDb,
    addMyList,
    getCheckOutSession,
    setMenbership
}