const path=require('path');
const express = require('express');
const morgan = require('morgan');
const AppError=require('./appError');
const viewRouter=require('./Routes/viewRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter=require('./routes/reviewRoutes');
const rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const mongosanitize=require('express-mongo-sanitize');
const xss=require('xss-clean');
const app = express();
// app.js
app.use(express.urlencoded({extended:true,limit:'10kb'}))
const cookieParser = require('cookie-parser'); // Import the middleware

app.use(cookieParser());
// Use the middleware

// Your other middleware and routes...

const hpp=require('hpp')
// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'))
app.use(helmet.contentSecurityPolicy({
  directives:{
    defaultSrc:["''self'",'https:','http:','data:','ws:'],
    baseUri:["'self'"],
    fontSrc:["'self'",'https:','http:','data:'],
    scriptSrc:["'self'","'unsafe-inline'",'https:','http:']
  }
}))
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
const limiter=rateLimit({
  max:100,
  windows:60*60*100,
  message:'Too any requests from this IP,please try again in an hour!'
})
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use('/api',limiter);
app.use(express.json({limit:'10kb'}))
//data sanitization
app.use(mongosanitize());
app.use(xss());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/',viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use((err,req,res,next)=>{
  console.log(err.stack);
  err.statusCode=err.statusCode||500;
  err.status=err.status||'error'
  res.status(err.statusCode).json({
    status:err.status,
    message:err.message
  })
})
module.exports = app;
