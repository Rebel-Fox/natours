const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});
process.on('uncaughtException',err => {
    console.log('UNCAUGHTED EXCEPTION ! SHUTTING DOWN')
    console.log(err.name,err.message);
    process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose
.connect(DB)
.then(con => {
    console.log('connection succesful');
})
//console.log(process.env);

const port = process.env.PORT || 3000;
//start the server
const server = app.listen(port,'127.0.0.1', () => {
    //console.log(`App running on port ${port}`);
});

//from async code
process.on('unhandledRejection',err => {
    //console.log(err);
    console.log('UNHANDLED REJECTION! SHUTTING DOWN');
    console.log(err.name,err.message);
    //graceful shutting down
    server.close(() => {
        process.exit(1);//CRASH DUE TO 1
    })
})

