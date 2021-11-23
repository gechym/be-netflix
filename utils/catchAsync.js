const AsyncCatch = (fn) => {// hàm này sẽ trả lại một hàm chưa được gọi 
    return (req, res, next) => { // Trả lại hàm vs cacis tham số như ban đầu
        fn(req, res, next).catch(err => {
            err.statusCode = 404
            err.status = 'fail'
            next(err) // => ErrorController nó sẽ xử lý
        }) 
        // Gọi hàm đó để thực hiện chứ năng y chang hàm hàm ban đầu vs cái tham số được truyền vào
    }
}

module.exports = AsyncCatch