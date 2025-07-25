const express = require('express');
const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/signup',viewsController.getSignUpForm);

router.get('/',authController.isLoggedIn,viewsController.getOverview);

router.get('/tour/:slug',authController.isLoggedIn,viewsController.getTour);

router.get('/login',authController.isLoggedIn,viewsController.getLoginForm);

router.get('/me',authController.protect,viewsController.getAccount);

router.post('/submit-user-data',authController.protect,viewsController.updateUserData);

router.get('/my-tours',authController.protect,viewsController.getMyTours);

// router.get('/checkout-session/:tourId',authController.protect,viewsController.getPayPalCheckout);

module.exports = router;