const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination : (req,file,cb) => {
//         cb(null,'public/img/users');
//     },
//     filename : (req,file,cb) => {
//         //user-id-timestamp.jpeg
//         const ext = file.mimetype.split('/')[1];
//         cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }else{
        cb(new AppError('Not an image ! Please upload only images',400),false);
    }
}

const upload = multer({
    storage : multerStorage,
    fileFilter : multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync (async (req,res,next) => {
    if(!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    //console.log(req.file);
    await sharp(req.file.buffer)
        .resize(500,500)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/users/${req.file.filename}`)

    next();
})

const filterObj = (obj,...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
        if(allowedFields.includes(key)){
            newObj[key] = obj[key];
        }
    })
    return newObj;
}

exports.getMe = (req,res,next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async (req,res,next) => {
    // console.log(req.file);
    // console.log(req.body);
    // 1) Create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password updates. Pleause use /updateMyPassword',400));
    }
    // 2) Update user document
    //non sensitive data therefore use findbyidandupdate
    const filteredBody = filterObj(req.body,'name','email');
    if(req.file){
        filteredBody.photo = req.file.filename;
    }
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    });

    res.status(200).json({
        status : 'success',
        user : updatedUser,
    })
})

exports.deleteMe = catchAsync(async (req,res,next) => {
    await User.findByIdAndUpdate(req.user._id,{active : false});
    
    res.status(204).json({
        status:'success',
        data:null,
    })
})

exports.createUser = (req,res) => {
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined ! Please use /signup instead'
    })
}

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
//Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

