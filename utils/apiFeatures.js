class APIFeatures{
    constructor(query,queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter(){
        const queryObj = new Object({...this.queryString});
        const excludedFields = ['page','sort','limit','fields'];
        excludedFields.forEach(el => delete queryObj[el]);
        
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g,(match) => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort(){
        //console.log(this.queryString.sort);
        if(this.queryString.sort){
            let sortBy = this.queryString.sort;
            sortBy = sortBy.split(',').join(' ');
            //console.log(sortBy);
            this.query = this.query.sort(sortBy);
        }else{
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields(){
        if(this.queryString.fields){
            //console.log(req.query.fields);
            let selectBy = this.queryString.fields;
            selectBy = selectBy.split(',').join(' ');//change
            //console.log(selectBy);
            this.query = this.query.select(selectBy);
        }else{
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate(){
        const page = this.queryString.page*1 || 1;
        const limit = this.queryString.limit*1 || 100;
        const skip = (page-1)*limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;