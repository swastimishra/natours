const crypto=require('crypto')
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: [25, 'please write first 25 letters only'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        return validator.isEmail(value);
      },
      message: 'Invalid email format',
    },
  },
  role:{
    type:String,
    enum:['user','guide','lead-guide','admin'],
    default:"user"
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    minlength: [10, 'the password is too short'],
    required: true,
    select: false,
  },
  confirmpassword: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: 'passwords do not match',
    },
  },
  passwordchangedAt: {
    type: Date,
  },
  passwordresettoken:String,
  passwordresetexpires:Date,
  active:{
    type:Boolean,
    default:true
  }
});

//userschema.pre('save', async function (next) {
  //if (!this.isModified('password')) return next();
 // this.password = await bcrypt.hash(this.password, 12);
 // this.confirmpassword = undefined;
 // next();
//});
userschema.pre(/^find/,function(next){
  //this points to current query
  this.find({active:{$ne:false}});
  next();
})
userschema.methods.correctPassword = async function (candidatePassword,userpassword) {
    return await bcrypt.compare(candidatePassword, userpassword);
  };
userschema.methods.changedPassword=async function(JWTtimpestamp){
    if(this.passwordChangedAt){
        const changedTimestamp=parseInt(this.passwordChangedAt.getTime()/1000,10);
        console.log(changedTimestamp,JWTtimpestamp);
       return  changedTimestamp<JWTtimpestamp;
    }return false;
    
}
userschema.methods.createpasswordresettoken=function(){
    const resettoken=crypto.randomBytes(32).toString('hex');
    this.passwordresettoken=crypto.createHash('sha256').update(resettoken).digest('hex');
    console.log({resettoken},this.passwordresettoken);
    this.passwordresetexpires=Date.now()+10*60*1000;
    return resettoken;
}
//userschema.pre('save',function(next){
  //  if(!this.isModified('password')||this.isNew) return next();
   // this.passwordchangedAt=Date.now()-1000;
   // next();
//})
const User=mongoose.model('User',userschema);
module.exports=User;