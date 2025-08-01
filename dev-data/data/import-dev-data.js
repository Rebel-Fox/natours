const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

//console.log(process.env);

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB)
    .then(con => {
        console.log('connection succesful');
    })

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));

//IMPORT DATA INTO DB
const importData = async () => {
    try{
        await Tour.create(tours);
        await User.create(users,{ validateBeforeSave : false});
        await Review.create(reviews);
        console.log('Data successfully loaded!');
    }catch(err){
        console.log(err);
    }
    process.exit();
}

//DELETE ALL DATA FROM DB
const deleteData = async () =>{
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data successfully deleted!');
    }catch(err){
        console.log(err);
    }
    process.exit();
}

//console.log(tours);

//console.log(process.argv);
if(process.argv[2] === '--import') importData();
else if(process.argv[2] === '--delete') deleteData();
