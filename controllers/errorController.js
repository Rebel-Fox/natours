const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path} : ${err.value}.`
    return new AppError(message,400);
}

const handleDuplicateFieldsDB = err =>{
    const message = `Duplicate field value : ${err.keyValue.name }. Please use another value`;
    //bad request
    return new AppError(message,400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(it => it.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message,400);
}


const handleJsonWebTokenError = err => new AppError('Invalid token . Please log in again',401);

const handleTokenExpiredError = err => new AppError('Token expired . Please login again',401);

const sendErrorDev = (err,req,res) => {
    console.log(err);
    // A) API
    if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
            status : err.status,
            error : err,
            message:err.message,
            stack : err.stack
        });
    }

    // B) RENDERED WEBSITE
    console.error('Error',err);
    return res.status(err.statusCode).render('error',{
        title : 'Something went wrong !',
        msg:err.message,
    })
}

const sendErrorProd = (err,req,res) => {
    //A)
    if(req.originalUrl.startsWith('/api')){
        // A) Operational,trusted error : send message to client
        if(err.isOperational){
            return res.status(err.statusCode).json({
                status : err.status,
                message:err.message,
            });
        }
        
        //B) Programming or other unkown error : don't leak error details
        //1) log error
        console.error('Error',err);
        //2) send generic error
        return res.status(500).json({
            status:'error',
            message:'Something went very wrong!',
            error : err
        })
        
    }
    //B) RENDERED WEBSITE
    //  A)Operational,trusted error : send message to client
    if(err.isOperational){
        //RENDERED WEBSITE
        return res.status(err.statusCode).render('error',{
            title : 'Something went wrong !',
            msg:err.message,
        })
    //Programming or other unkown error : don't leak error details
    }
    // B)
    //1) log error
    console.error('Error',err);
    //2) send generic error
    return res.status(err.statusCode).render('error',{
        title : 'Something went wrong !',
        msg : 'Please try again later',
    })
    
        
    
   
   
}

module.exports =  (err,req,res,next) => {
    //console.log(err.stack);
    //console.log(process.env.NODE_ENV);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    //console.log(err.name);
    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,req,res);
    }else if(process.env.NODE_ENV === 'production'){
        let error = Object.create(err);
        if(error.name === 'CastError') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name === 'ValidationError') error =  handleValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJsonWebTokenError(error);
        if(error.name === 'TokenExpiredError') error = handleTokenExpiredError(error);
        sendErrorProd(error,req,res);
    }

    next();
}