const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest=require("../models/connectionRequest")
const userRouter=express.Router();
const User=require("../models/user")
const USER_SAFE_DATA = ["firstName","lastName","photoUrl","age","gender","about","skills"];

//get all the pending connection request for the logged in user
userRouter.get("/user/requests/received", userAuth, async(req,res) =>{
    try {
        const loggedInUser=req.user;

        const connectionRequests= await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", USER_SAFE_DATA);

        res.json({
            message:"Data fetched successfully!",
            data:connectionRequests
        })
    } catch (err) {
        res.status(400).send("ERROR :"+ err.message);
    }
})

userRouter.get("/user/connections",userAuth, async(req,res)=>{
    try {
        const loggedInUser=req.user;
        const connectionRequests=await ConnectionRequest.find({
            $or:[
                {
                    toUserId:loggedInUser._id, status:"accepted"
                },
                {
                    fromUserId:loggedInUser._id, status:"accepted"
                }
            ]
        }).populate("fromUserId",USER_SAFE_DATA).populate("toUserId",USER_SAFE_DATA);

        console.log(connectionRequests);

       const data = connectionRequests.map((row) => {
    if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
    } else {
        return row.fromUserId;
    }
});


        res.json({data});
    } catch (err) {
        res.status(400).send({message:err.message});
    }
})

userRouter.get("/feed",userAuth, async(req,res)=>{
    try {
        //user should see all the user cars except
        // 0. his own card
        // 1. carrd of his connections
        // 2. ignored people
        // 3. already sent the connection request
        
        const loggedInUser=req.user;

        const page = parseInt(req.query.page) || 1;
        let limit=parseInt(req.query.limit) || 10;
        limit = limit>50 ? 50 : limit;

        const skip=(page - 1 )*limit;

        //find all the connection requests (sent + recieved)
        const connectionRequests = await ConnectionRequest.find({
            $or:[
                {
                    fromUserId: loggedInUser._id,
                },
                {
                    toUserId: loggedInUser._id,
                }
            ]
        }).select("fromUserId toUserId");

        const hideUsersfromFeed= new Set();
        connectionRequests.forEach((req) => {
            hideUsersfromFeed.add(req.fromUserId.toString());
             hideUsersfromFeed.add(req.toUserId.toString())
        });
        console.log(hideUsersfromFeed);

        const users = await User.find({
            $and:[{_id:{$nin: Array.from(hideUsersfromFeed)},},{_id:{$ne:loggedInUser._id}}]
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        res.send({data: users});
    } catch (err) {
        console.log("feed api fails");
        res.status(400).json({message:err.message})
    }
})

module.exports = userRouter;