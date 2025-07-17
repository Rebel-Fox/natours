const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name :{
        type:String,
        required:[true,'A User must have a name']
    },
    email:{
        type:String,
        required:[true,'A User must have a email'],
        unique:true,
        lowercase:true,
        //this only works on CREATE SAVE !!!
        validate:{
            validator: v => validator.isEmail(v, { require_tld: true }),
            message : 'Invalid email',
        }
    },
    photo:{
        type:String,
        default : 'default.jpg',
    },
    role:{
        type:String,
        enum : ['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'A user must have a password'],
        minlength:[8,'A password must of length greater than equal to 8'],
    select:false,
    },
    passwordConfirm:{
        type:String,
        required:[true,'Please confirm you password'],
        validate:{
            validator:function(val){
                return val === this.password;
            },
            message:'It does not matches with the password',
        }
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date,
    active:{
        type:Boolean,
        default:true,
        select:false,
    }
},{
    toJSON : {virtuals : true},
    toObject : {virtuals : true},
});

//Document middleware
userSchema.pre('save',async function(next){
    //Only run this function if the password was modified
    if(!this.isModified('password')) return next();

    //Hash the password with the cost of 12
    this.password = await bcrypt.hash(this.password,12);

    //Delete confirm password
    this.passwordConfirm = undefined;
    next();
})

userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew ) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})

userSchema.pre(/^find/,function(next){
    //this points to current document
    this.find({active:{$ne : false}});
    next();
})

userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    //this to current document
    //here userPassword is hash
    return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimeStamp){
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000,10);
        //console.log(changedTimeStamp,JWTTimeStamp);
        return JWTTimeStamp < changedTimeStamp;
    }

     //false means not changed
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken =  crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({resetToken},this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10*60*10000;

    return resetToken;
}


const User = mongoose.model('User',userSchema);

module.exports = User;