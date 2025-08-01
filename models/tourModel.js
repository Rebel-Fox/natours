const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//const User = require('./userModel');
const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A tour must have a name'],
        unique:true,
        trim:true,
        maxlength:[40,'A tour name must have less or equal than 40 chararcters'],
        minlength:[10,'A tour name must have more or equal than 10 characters'],
        //this her needs without spaces not really useful here
        // validate:{
        //     validator:validator.isAlpha,
        //     message : 'Name should have only alphabetical characters',
        // }
    },
    slug:String,
    duration:{
        type:Number,
        required:[true,'A tour must have a duration'],
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A tour must have a group size'],
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have a difficulty'],
        enum :{
            values:['easy','medium','difficult'],
            message:'Difficulty is either:easy , medium , difficult',
        } 
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min : [1,'Rating must be above 1.0'],
        max : [5,'Rating must be below 5.0'],
        //setter func runs each time there is update
        set : val => Math.round(val * 10)/10,
    },
    ratingsQuantity:{
        type:Number,
        default:0,
    },
    price:{
        type:Number,
        required:[true,'A tour must have a price']
    },
    priceDiscount:{
        type : Number,
        validate : {
            validator :  function(val){
                //this here only works only when creating and not on updating
                return val < this.price;
            },
            message : 'Discount price ({VALUE}) should be below the regular price',
        }
    },
    summary:{
        type:String,
        trim:true,
        required:[true,'A tour must have a description'],
    },
    description:{
        type:String,
        trim:true,
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a cover image'],
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false,
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default : false,
    },
    startLocation : {
        //GeoJSON
        type : {
            type: String,
            default:'Point',
            enum : ['Point'],
        },
        coordinates : [Number],
        address:String,
        description:String,
    },
    //array of obj -> embedded document
    locations : [
        {
            type : {
                type:String,
                default:'Point',
                enum:['Point'],
            },
            coordinates : [Number],
            address:String,
            description : String,
            day : Number,
        }
    ],
    guides : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'User',
        }
    ]

},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
});

// tourSchema.index({price : 1})
tourSchema.index({price : 1,ratingsAverage : -1});
tourSchema.index({slug:1});
tourSchema.index({startLocation : '2dsphere'});

tourSchema.virtual('durationWeeks').get(function(){
    //to use this keyword use normal function
    return this.duration/7;
});

//Virtual populate
tourSchema.virtual('reviews',{
    ref: 'Review',
    localField : '_id',
    foreignField : 'tour',
})

//DOCUMENT MIDDLEWARE : run before .save() and .create()
tourSchema.pre('save',function(next){
    //this points to the document curr begin saved
    this.slug = slugify(this.name,{lower:true});
    next();
})

// tourSchema.pre('save',async function(next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id))

//     this.guides = await Promise.all(guidesPromises);
//     next();
// })

// tourSchema.post('save',function(doc,next){
//     console.log(doc);
//     next();
// })

//QUERY MIDDLEWARE
tourSchema.pre(/^find/,function(next){
    //this -> query object
    this.find({secretTour:{$ne : true}});

    this.start = Date.now();
    next();
})

tourSchema.post(/^find/,function(docs,next){
    //console.log(docs);
    //console.log(Date.now() - this.start);
    next();
})

tourSchema.pre(/^find/,function(next){
    this.populate({
        path : 'guides',
        select : '-__v -_id -passwordChangedAt ',
    })
    //populate does one extra query 
    next();
})

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate',function(next){
//     //this -> curr aggregation object
//     this.pipeline().unshift({$match : {secretTour : {$ne : true}}});
//     console.log(this.pipeline());
//     next();
// })

const Tour = mongoose.model('Tour',tourSchema);
module.exports = Tour;