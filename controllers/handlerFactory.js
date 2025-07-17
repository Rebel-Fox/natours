const qs = require('qs');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req,res,next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    
    if(!doc){
        return next(new AppError('No doc found with that ID',404));
    }

    //204 -> no content
    res.status(204).json({
        message:'success',
        data : null
    })
});

exports.updateOne = Model => catchAsync(async (req,res,next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{
        new : true,
        runValidators:true,
    })

    if(!doc){
        return next(new AppError('No doc found with that ID',404));
    }

    res.status(200).json({
        message:'success',
        data : {
            doc 
        }
    })
});

exports.createOne = Model => catchAsync (async (req,res,next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
        message:'success',
        data : {
            data : newDoc,
        }
    })
})

exports.getOne = (Model,popOptions) => catchAsync (async (req,res,next) => {
    //populate only on query
    let query = Model.findById(req.params.id);
    if(popOptions) query.populate(popOptions);
    const doc = await query;

    if(!doc){
        return next(new AppError('No doc found with that ID',404));
    }

    res.status(200).json({
        status : 'success',
        data : {
            doc
        }
    });
})

exports.getAll = Model => catchAsync (async (req,res,next) => {
    const modifiedQuery = new Object({
    ...qs.parse(req.query),
    ...(req.addQuery || {})
    });
    //console.log(modifiedQuery);
    //to allow nested GET reviews on tour (hack)
    let filter = {};
    if(req.params.tourId) filter = {tour : req.params.tourId};

    //EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter),modifiedQuery)
    .filter()
    .sort()
    .limitFields()
    .paginate();
        
    // const docs = await features.query.explain();
    const docs = await features.query;
    //SEND RESPONSE
    res.status(200).json({
        status : 'success',
        results: docs.length,
        data:{
            data : docs
        }
    });
})
