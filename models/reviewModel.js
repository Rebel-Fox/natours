//review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review : {
        type : String,
        required : [true,"Please provide a review"],
    },
    rating : {
        type : Number,
        required : [true,"Please provide a rating"],
        min : [1,"Rating should be greater than 1"],
        max : [5,"Rating can not be less than 5"],
    },
    createdAt : {
        type : Date,
        default : Date.now(),
    },
    tour :{
        type:mongoose.Schema.ObjectId,
        ref : 'Tour',
        required:[true,"Review must belong to a tour."]
    },
    user :{
        type:mongoose.Schema.ObjectId,
        ref : 'User',
        required : [true,"A review must belong to a user"],
    }
    
},{
    toJSON : {virtuals : true},
    toObject : {virtuals : true},
});

//STILL DUPLICATE REVIEWS ( FIX THIS ------------------------------------------------
reviewSchema.index({tour : 1 , user : 1},{unique : true});
//-----------------------------------------------------------

//query middleware
//populating tour
reviewSchema.pre(/^find/,function(next){
    // this.populate({
    //     path : 'tour',
    //     select : 'name',
    // })
    this.populate({
        path : 'user',
        select : 'name photo'
    })
    next();
})

//static method
reviewSchema.statics.calcAverageRatings = async function(tourId){
    //this points to model
    const stats = await this.aggregate([
        {
            $match : {tour:tourId},
        },
        {
            $group : {
                _id : '$tour',
                nRating : {$sum : 1},
                avgRating : {$avg : '$rating'}
            }
        }
    ]);
    //console.log(stats);
    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity : stats[0].nRating,
            ratingsAverage : stats[0].avgRating,
        })
    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity : 0,
            ratingsAverage : 4.5,
        })
    }
    
}

reviewSchema.post('save',function(){
    //this points to current review doc
    this.constructor.calcAverageRatings(this.tour);
})

//findByIdUpdate
//findByIdDelete
//query middleware

reviewSchema.pre(/^findOneAnd/,async function(next){
    //console.log(this);
    this.r = await this.model.findOne(this.getQuery());
    //console.log(r);
    next();
})

reviewSchema.post(/^findOneAnd/,async function(){
    //await this.model.findOne() ; //doest not work here querey is already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
})

const Review = mongoose.model('Review',reviewSchema);

module.exports = Review;
