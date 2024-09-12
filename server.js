const dotenv = require('dotenv');
const app = require('./app');
const mongoose=require('mongoose');
const Tour=require('./tourmodel');
dotenv.config({ path: './config.env' });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
const uri='mongodb+srv://Vansh:12345678Rt.@cluster0.61xxi7x.mongodb.net/?tls=true'
mongoose.connect(uri, {useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true})
  .then((con) => {
    console.log(con.connections)
    console.log('Connected to MongoDB');
    console.log(process.env.NODE_ENV);
    // Your application logic goes here
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
/*const testTour=new Tour({
  name:'The Park Camper',
  rating:4.8,
  price:597

})
testTour.save().then(doc=>{
  console.log(doc)
})*/