const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

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

exports.updateTourImages = upload.fields([
    {name : 'imageCover',maxCount : 1},
    {name : 'images',maxCount : 3},
])

exports.resizeTourImage = catchAsync (async(req,res,next) => {
    //console.log(req.files);
    if(!req.files.imageCover || !req.files.images) return next(); 

    //1) Cover Image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
            .resize(2000,1333)
            .toFormat('jpeg')
            .jpeg({quality:90})
            .toFile(`public/img/tours/${req.body.imageCover}`)
            
            
    //images
    req.body.images = [];
    await Promise.all ( 
        req.files.images.map(async (file,i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`

            await sharp(file.buffer)
                .resize(2000,1333)
                .toFormat('jpeg')
                .jpeg({quality:90})
                .toFile(`public/img/tours/${filename}`)
            
            req.body.images.push(filename);
    }))
    //console.log(req.body);
    next();
})

exports.aliasTopTours = (req, res, next) => {
    //console.log(req);
    const query = {
        'sort':'-ratingsAverage,price',
        'fields':'ratingsAverage,price,name,difficulty,summary',
        'limit':5,
    }
    req.addQuery = query;
    next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour,{ path : 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync (async(req,res,next) => {
   const stats = await Tour.aggregate([
        {
            $match:{ratingsAverage:{$gte:4.5},}
        },
        {
            $group:{
                // _id : '$ratingsAverage',//group id
                _id :{$toUpper : '$difficulty'},//group id
                numTours : {$sum : 1},
                numRatings : {$sum : '$ratingsQuantity'},
                avgRating:{$avg : '$ratingsAverage'},
                avgPrice : {$avg:'$price'},
                minPrice : { $min : '$price'},
                maxPrice : {$max : '$price'},
            }
        },
        {
            $sort:{
                avgPrice : 1,
            }
        },
        // {
        //     $match : {_id : {$ne : 'EASY'}}
        // }
    ])
    res.status(200).json({
        message:'success',
        data : {
            stats 
        }
    })
})

exports.getMonthlyPlan = catchAsync(async (req,res,next) => {
    const year = req.params.year*1;
    const plan = await Tour.aggregate([
        {
            $unwind:'$startDates',
        },
        {
            $match:{
                startDates:{
                    $gte:new Date(`${year}-01-01`),$lte : new Date(`${year}-12-31`),
                }
            }
        },
        {
            $group:{
                _id:{$month : '$startDates'},
                numTourStarts : {$sum : 1},
                tours : {$push : '$name'},
            }
        },
        {
            $addFields : {month : '$_id'}
        },
        {
            $project : {_id : 0},
        },
        {
            $sort : {numTourStarts : -1 , month : 1},
        },
        {
            $limit : 12,
        }
    ])

    res.status(200).json({
        message:'success',
        data : {
            plan 
        }
    })
})

// /tour-within/:distance/center/:latlng/unit/:unit
exports.getToursWithin = catchAsync(async (req,res,next) => {
    //console.log(req.params);
    const {distance,latlng,unit} = req.params;
    const [lat,lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

    if(!lat || !lng){
        next(new AppError('Please provide latitude and longitude in the format lat,lng.',400));
    }
    //console.log(distance,lat,lng,unit);

    const tours = await Tour.find({startLocation : { $geoWithin : {$centerSphere : [[lng,lat],radius] } }});
    res.status(200).json({
        status:'success',
        results : tours.length,
        data : {
            tours
        }
    })
})

// /distances/:latlng/unit/:unit
exports.getDistances = catchAsync(async (req,res,next) => {
    const {latlng,unit} = req.params;
    const [lat,lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lng){
        next(new AppError('Please provide latitude and longitude in the format lat,lng.',400));
    }
    
    const distances = await Tour.aggregate([
        {   
            //geoNear first stage always 
            $geoNear : {
                near : {
                    type : 'Point',
                    coordinates:[lng*1,lat*1],
                },
                distanceField : 'distance',
                distanceMultiplier : multiplier,
            }
        },
        {
            $project : {
                distance : 1,
                name : 1,
            }
        }
            
        
    ])

    res.status(200).json({
        status:'success',
        results : distances.length,
        data : {
            distances
        }
    })
})