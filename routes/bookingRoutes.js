const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router
    .post('/book-tour',authController.protect,bookingController.bookTour);

router.use(authController.protect);
router.use(authController.restrictTo('lead-guide','admin'));

router
    .route('/')
    .get(bookingController.getAllBookings)
    .post(bookingController.createBooking);

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router;
