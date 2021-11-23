class APIFeatures {
    constructor(query, queryString){
        this.query = query
        this.queryString = queryString
    }

    filter() {
        const queryObject = {...this.queryString}
        const excludeFields = ['page', 'sort', 'limit', 'fields'] // lọc trang
        // Xóa các item trên ra khỏi queryObject được gán từ queryObject
        excludeFields.forEach(item => delete queryObject[item])
        //LỌC NÂNG CAO 
        let queryStr = JSON.stringify(queryObject)
        console.log(queryStr)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        console.log(JSON.parse(queryStr))
        this.query = this.query.find(JSON.parse(queryStr))//.populate('guides')
        return this
    }

    sort(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ')
            // =>price,ratingAverage    price ratingAverage
            
            this.query = this.query.sort(sortBy)
            // query.sort("sortBy") tăng dần
            // query.sort("-sortBy") giảm dần dần
        }else{
            this.query = this.query.sort('-createAt')
        }

        return this
    }

    limit(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
            // Không nhận query kiểu //// {-name -id}
            //th không muôn lấy 1 fields nào đó thì thêm -
            //vd query = query.select('-__id')
        }

        return this
    }

    paginate() {
        if(this.queryString.page && this.queryString.limit){
            const page = this.queryString.page * 1 || 1 // số trang
            const limit = this.queryString.limit * 1 || 100 // giới hạn các fields trong một trang
            const skip = (page - 1) * limit // lấy các chuck phù hợp vs page
            
            // const numTours = await Tour.countDocuments()
            // if(skip > numTours){// nếu số trangb ko hợp lệ
            //     throw new Error('this is page does exist')
            // }
            
            this.query = this.query.skip(skip).limit(limit)
        }

        return this
    }

}

module.exports = APIFeatures