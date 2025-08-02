const mongoose= require ('mongoose');
const jwt = require("jsonwebtoken");
const validator = require ("validator");
const bcrypt= require("bcrypt");

const userSchema= new mongoose.Schema({
    firstName:{
        type: String,
        required :true,
        index: true
    },
    lastName:{
        type:String
    },
     emailId:{
        type: String,
         required :true,
         unique: true, //already creates an index
       

     },
    password:{
        type: String,
         required :true
     },
     age:{
        type:Number
     },
    gender:{
        type:String,
        enum:{
            values:["male","female","others"],
            message:`{VALUE} is not a valid gender type`
        }
    },
    photoUrl:{
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error ("Invalid photourl:" + value);
            }
         }
    },
    about:{
        type: String,
        default: "This is a default line"
    },
    skills:{
        type: [String]
    },
    

},{
    timestamps: true
});

userSchema.index({})

userSchema.methods.getJWT = async function(){
    const user = this;

const token=await jwt.sign({_id:user._id}, process.env.JWT_SECRET ,{expiresIn: "7d"});

return token;
}

userSchema.methods.validatePassword= async function(passwordInputByUser){
    const user = this;
    const passwordHash= user.password;

    const isPasswordValid= await bcrypt.compare(passwordInputByUser,passwordHash);
    return isPasswordValid;
}
const User=mongoose.model("User",userSchema);

module.exports= User;
