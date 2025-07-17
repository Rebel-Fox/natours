const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const autoSanitize = require('./utils/autoSanitize');

const app = express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
//serving static files first it looks for any route otherwise it serves the file in the mentioned folder 
app.use(express.static(path.join(__dirname,'public')));


//global middleware
//set SECURITY HTTP HEADERS

const scriptSrcUrls = ['https://unpkg.com/',
    'https://tile.openstreetmap.org'];
const styleSrcUrls = [
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://fonts.googleapis.com/'
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
 
//set security http headers
// app.use(
//     helmet.contentSecurityPolicy({
//       directives: {
//         defaultSrc: [],
//         connectSrc: ["'self'", ...connectSrcUrls],
//         scriptSrc: ["'self'", ...scriptSrcUrls],
//         styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//         workerSrc: ["'self'", 'blob:'],
//         objectSrc: [],
//         imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
//         fontSrc: ["'self'", ...fontSrcUrls]
//       }
//     })
//   );

//DEVELOPMENT LOGGING
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max:100,//depending upon use like api will require more
    windowMs:60*60*1000,
    message:'Too many requests from this IP , please try again in an hour',
})

//LIMITS REQUESTS FROM THE SAME IP
app.use('/api',limiter);

//BODY PARSER , READING DATA FROM body INTO req.body
app.use(express.json({
    limit:'10kb',
}));
app.use(cookieParser());
//form action post
app.use(express.urlencoded({
    extended:true,
    limit:'10kb',
}))

//DATA SANITIZATION AGAINST NoSQL query injection
//DATA SANITIZATION against XSS
app.use(autoSanitize);

//REmove duplicate keys in query i.e parameter pollution
//THIS IS NOT WORKING---------------------------------------------------
app.use(hpp({
    whitelist : [
        'duration','sort'
    ]
}));
//-------------------------------------------------------------------------

app.use(compression());

//Test middleward .use to use middleware
app.use((req,res,next) =>{
    req.requestTime = new Date().toISOString();
    //console.log(req.cookies);
    next();
})


//Routes
//it is a middleware


app.use('/',viewRouter);
app.use('/api/v1/bookings',bookingRouter);
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);

app.all(/.*/,(req,res,next) => {
    //next with argument means error
    next(new AppError(`Can't find ${req.originalUrl} on this server`,404));
})

//4 parameters -> error handling middleware
app.use(globalErrorHandler);

module.exports = app;
