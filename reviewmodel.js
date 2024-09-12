const mongoose=require('mongoose');
const Tour=require('./tourmodel');
const User=require('./usermodel')
const reviewschema=new mongoose.Schema({
    review:{
        type:String,
        required:[true,'review cant be empty']
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'Review must belong to a tour']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    photo:{
        type:String
    }
},{
    toJSON:{virtual:true},
    toObject:{virtual:true},
}
);
reviewschema.pre(/^find/,function(next){
    this.populate({
        path:'tour',
        select:'name'
    })
    next()
})
reviewschema.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select:'name'
    })
    next();
})
reviewschema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
      {
        $match: { tour: tourId }
      },
      {
        $group: {
          _id: '$tour',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' } // Corrected from $rating to '$rating'
        }
      }
    ]);
    if(stats.length>0){
    Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity:stats[0].nRating,
        ratingsAverage:stats[0].avgRating
    })
}
else{
    await Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity:stats[0].nRating,
        ratingsAverage:stats[0].avgRating
    })
}
}
reviewschema.pre(/^findOneAnd/,async function(next){
    const r=await this.findOne();
    next();
})
reviewschema.post(/^findOneAnd/,async function(){
    await this.r.constructor.calcAverageRatings(this.r.tour)

})
reviewschema.post('save',function(next){
    this.constructor.calcAverageRatings(this.tour)
})
const Review=mongoose.model('Review',reviewschema);
module.exports=Review;
