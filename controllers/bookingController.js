const paypal = require('@paypal/paypal-server-sdk');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');

exports.bookTour = catchAsync(async (req,res,next) => {
    const tourId = req.body.tour;
    const userId = req.user.id;
    const tour = await Tour.findById(tourId);
    if(!tour){
        return (new AppError('Tour does not exist',400));
    }

    const booking = await Booking.create({
        tour : tourId,
        user : userId,
        price : tour.price,
    })

    //console.log(booking);
    res.status(200).json({
        status : 'success',
        booking,
    })
    
})

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
