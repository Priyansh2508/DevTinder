const mongoose = require ('mongoose');

const connectDB = async () =>{
    await mongoose.connect(
        "mongodb+srv://priyansh25082004:iqwAKnaxupzUAbFV@namastenodejs.1dtxjzl.mongodb.net/devTinder?retryWrites=true&w=majority"
    );
};

module.exports = connectDB;

