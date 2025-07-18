const express = require("express");
const { validateSignUpData } = require("../utils/validation.js");
const authRouter= express.Router();
const User= require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

authRouter.post("/signup",async (req, res)=> {
   try{
     //validation of data
    
     
     validateSignUpData(req);
   
     // Encrypt passwords
     const {firstName,lastName, emailId,password}=req.body;
     const passwordHash= await bcrypt.hash(password,10);


    // Creating a new instance of the user
    const user =await User.create ({
      firstName,lastName, emailId,password: passwordHash
    });
  const token = jwt.sign({ _id: user._id }, "DEV@tinder$79");

    const isProd = process.env.NODE_ENV === "production";

 res.cookie("token", token, {
  httpOnly: true,
  secure: false,
  sameSite: "Lax",
  maxAge: 1000 * 60 * 60 * 24
});
   return res.json({
  msg: "Signed Up successfully!",
  user: {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailId: user.emailId
  }
});
} catch(err){
    return res.status(400).send("ERROR : "+err.message);
};
  
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign({ _id: user._id }, "DEV@tinder$79");

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,              // use false in dev (localhost)
      sameSite: isProd ? "None" : "Lax",
      expires: new Date(Date.now() + 8 * 3600000),
    });

    return res.json({message:"Logged in!!", user});
  } catch (err) {
    return res.status(400).send("ERROR: " + err.message);
  }
});


authRouter.post("/logout", async (req, res)=>{
  res.cookie("token", null, {
    expires: new Date(Date.now()),

  })
  res.send("Logout successull!!");
})


module.exports = authRouter;
