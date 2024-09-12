const mongoose=require('mongoose');
const slugify=require('slugify');
const validator=require('validator');
const User=require('./usermodel')
const Review=require('./reviewmodel')
const tourschema=new mongoose.Schema({
    name:{
      type:String,
      required:true,
      unique:true,
        maxlength:[40,'limit exceeded'],
        minlength:[10,'atleast 10 characters required'],
    },
    slug:String,
    duration:{
        type:Number,
        require:true
    },
    maxGroupSize:{
        type:Number,
        require:true
    },
    difficulty:{
        type:String,
        enum:{
            values:['easy','medium','difficult'],
            message:'either easy medium or difficult'
    }
},
    ratingsQuantity:{
        type:Number,
        default:0
    },
    ratingsAverage:{
      type:Number,
      default:4.5,
      min:[1,'should atleast be one'],
      max:[5,'cant have more than 5']
    },
    price:{
      type:Number,
     required: true
  },
discount:
{
    type:Number,
    validate:{
        validator:function(val){
        //this only runs on post
        return val<this.price;
    },
    message:'discount should not exceed price'
}}
,summary:{
    type:String,
    trim:true,
    required:true
},
description:{
    type:String,
    trim:true
},
imageCover:{
    type:String,
    required:true,

},
startLocation: {
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
locations:[
    {
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String,
        day:Number
    }
]
,images:{
type:[String]
},
createdAt:{
    type:Date,
    default:Date.now()

},
    startDates:{

    type:[Date],
    },
    secretTour:{
        type:Boolean,
        default:false
    },
    guides:[
        {type:mongoose.Schema.ObjectId,
        ref:'User',

    }
    ],
    reviews:[
        {type:mongoose.Schema.ObjectId,
        ref:'Review'}
    ]
},
{
    toJSON:{virtual:true},
    toObject:{virtual:true},
})
tourschema.virtual('durationweeks').get(function(){
    return this.duration/7;
})
//middleware
tourschema.virtual('review',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
})
/*REFERENCING*/
tourschema.pre('save',async function(next){
const guidesPromises=this.guides.map(async id=>await User.findById(id));
this.guides=await Promise.all(guidesPromises);  
//this.slug=slugify(this.name,{lower:true});
 next();
})
tourschema.pre(/^find/,function(next){
    this.populate({
        path:'reviews',
        select:'name'
    })
    next()
})
//tourschema.post('save',function(doc,next){
  //  console.log(doc);
    //next();
//})
/*EMBEDDING*/
//querymiddleware
tourschema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}})
    next();
})
tourschema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-v -passwordChangeAt'
    })
    next();
})
tourschema.post(/^find/,function(next){
})
//aggregationmiddleware
tourschema.pre('aggregate',function(next){
    this.pipeline().unshift({ $match:{
        secretTour:{$ne:true}
    } })
    console.log(this.pipeline());
    next();
})
  const Tour=mongoose.model('Tour',tourschema);
  module.exports=Tour;