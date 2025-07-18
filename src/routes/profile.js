const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const profileRouter= express.Router();
const {validateEditProfileData} = require("../utils/validation.js")

profileRouter.get("/view",userAuth,  async (req,res) => {
try{ 
  const user = req.user;
  
  if(!user){
    throw new Error("user does not exist");
  }
  res.send(user);
} catch(err){
    res.status(400).send("ERROR : "+err.message);
};
  
})

profileRouter.patch("/profile/edit", userAuth, async (req,res)=>{
  try {

    if(!validateEditProfileData(req)){
     throw new Error("Invalid edit request");
    }
    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({message: `${loggedInUser.firstName} , your profile is updated!!`, data: loggedInUser});

  } catch (err) {
    res.status(400).send("ERROR :" + err.message);
  }
})

// profileRouter.patch("/profile/password", userAuth, async(req, res) => {
//   try {
    
//   } catch (err) {
    
//   }
// })

module.exports=profileRouter;


