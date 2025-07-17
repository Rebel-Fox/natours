const express = require('express')
const tourController = require('../controllers/tourController');
const reviewRouter = require('../routes/reviewRoutes');
const authController = require('../controllers/authController');

const router = express.Router();//it is a middleware
//param middleware
// router.param('id',tourController.checkID);

//GET /tour/2345fs/reviews/9876f

router.use('/:tourId/reviews',reviewRouter);

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours,tourController.getAllTours)

router
    .route('/tour-stats')
    .get(tourController.getTourStats);

router
    .route('/monthly-plan/:year')
    .get(
        authController.protect,
        authController.restrictTo('admin','lead-guide','guide'),
        tourController.getMonthlyPlan
    );

router
    .route('/tour-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);

router
    .route('/distances/:latlng/unit/:unit')
    .get(tourController.getDistances);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.createTour
    );

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.updateTourImages,
        tourController.resizeTourImage,
        tourController.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.deleteTour
    );



module.exports = router;