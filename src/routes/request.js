
const ConnectionRequest=require("../models/connectionRequest.js");
const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const requestRouter= express.Router();
const User= require("../models/user.js");

const sendEmail = require ("../utils/sendEmail.js")


requestRouter.post("/request/send/:status/:toUserId",userAuth, async (req,res) => {
 try {
  const fromUserId=req.user._id;
  const toUserId=req.params.toUserId;
  const status=req.params.status;

  const allowedStatus=["ignored","interested"];

  if(!allowedStatus.includes(status)){
    return res.status(400).json({message:"invalid status type: " + status});
  }

  // if there is an existing ConnectionRequest
  const existingConnectionRequest= await ConnectionRequest.findOne({
    $or:[
    {fromUserId,toUserId},
    {fromUserId:toUserId,toUserId:fromUserId}
    ]
  });

  if(existingConnectionRequest){
    return res.status(400).send({message:"Connection Request already exists!"});
  }


  //if touser dont exist
  const toUser= await User.findById(toUserId);
  if(!toUser){
    return res.status(404).json({message:"User not found"})
  }

  const connectionRequest = new ConnectionRequest({
    fromUserId,
    toUserId,
    status,
  })

  const data= await connectionRequest.save();

  const emailRes = await sendEmail.run({ message: `You got a new friend request: ${req.user.firstName} marked ${toUser.firstName} as ${status}` });
  console.log(emailRes);

  res.json({
    message:req.user.firstName +  " marked " + toUser.firstName +" as "+ status,
    data
  })

 } catch (err) {
  res.status(400).send("ERROR : " + err.message);
 }
})

requestRouter.post("/request/reveiw/:status/:requestId", userAuth, async (req,res)=>{
  
  try {
    const loggedInUser=req.user;
    const allowedStatus=["accepted","rejected"];
    const {status, requestId}=req.params;

    if(!allowedStatus.includes(status)){
      return res.status(400).json({message:"Status not allowed"});
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    })

    if(!connectionRequest){
      return res.status(400).json({message: "connection request not found"})
    }

    connectionRequest.status=status;

    const data = await connectionRequest.save();

    res.json({message: "Connection Request " + status,data});
  } catch (err) {
    res.status(400).send("ERROR : "+  err.message)
  }

})



module.exports=requestRouter;