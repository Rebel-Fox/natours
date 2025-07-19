const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { login } = require('./authController');
exports.getOverview = catchAsync(async (req,res,next) => {
    //1) Get tour data from the collection
    const tours = await Tour.find();

    //2) Build template

    //3) Render that template using tour data from 1
    res.status(200).render('overview',{
        title : 'All Tours',
        tours
    })
})

exports.getTour = catchAsync ( async (req,res,next) => {
    const {slug} = req.params;
    const tour = await Tour.findOne({slug}).populate({
        path : 'reviews',
        select : 'review rating user'
    });
    if(!tour){
        return next(new AppError('There is no tour with that name',404))
    }
    //console.log(tour);
    //console.log(tour.reviews);
    res.status(200).render('tour',{
        title:`${tour.name} tour`,
        tour
    })
})

exports.getLoginForm = (req,res) => {
    res.status(200).render('login',{
        title : 'Log into your account',
    })
}

exports.getSignUpForm = (req,res) => {
    res.status(200).render('signup',{
        title : 'Sign Up into your account',
    })
}

exports.getAccount = (req,res) => {
    res.status(200).render('account',{
        title : 'Your account',
    })
}

exports.updateUserData = catchAsync(async (req,res,next) => {
    //console.log('hello');
    //console.log(req.body);
    const updatedUser = await User.findByIdAndUpdate(req.user.id,{
        name : req.body.name,
        email:req.body.email,
    },
    {
        new : true,
        runValidators : true,
    });

    res.status(200).render('account',{
        title : 'Your account',
        user : updatedUser,
    })
})

exports.getMyTours = catchAsync (async (req,res,next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({user : req.user.id});

    // 2) Find tours with the returned IDs
    const tourIds = bookings.map(booking => booking.tour);

    const tours = await Tour.find({_id : {$in : tourIds}});

    //console.log('hello');
    //console.log(tours);

    res.status(200).render('overview',{
        title : 'My Tours',
        tours
    })
})

// exports.getPayPalCheckout = catchAsync(async(req,res,next) => {
//     //1) Get the currently booked tour
//     const tour = await Tour.findById(req.params.tourId);

//     //2) Go to paypal
//     res.status(200).render('paypal',{
//         title:`Checkout - ${tour.name}`,
//         tour,
//         user : req.user,
//         clientId : process.env.PAYPAL_CLIENT_ID,
//     })
// })