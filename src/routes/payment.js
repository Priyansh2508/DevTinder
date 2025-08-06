const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const User = require("../models/user");
const { membershipAmount } = require("../utils/constants");
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils')

paymentRouter.post("/create", userAuth,  async(req, res)=>{
    try {

        // --- DEBUGGING LOG ---
        console.log("User object from middleware:", req.user);
        if (!req.user) {
            return res.status(401).json({ msg: "Authentication error, user not found." });
        }
        // -------------------

        const {membershipType} = req.body;
        const {firstName, lastName, emailId} = req.user;

                // --- DEBUGGING LOGS ---
        console.log("Received membershipType:", membershipType);
        const amount = membershipAmount[membershipType] * 100;
        console.log("Calculated amount:", amount);
        // -----------------------


        const order = await razorpayInstance.orders.create({
            "amount": membershipAmount[membershipType]*100,
            "currency": "INR",
            "receipt": "receipt#1",
            "notes": {
            firstName,
            lastName,
            emailId,
            membershipType: membershipType,
             },
            })
             //save it in my database
             console.log(order);
             
             const payment = new Payment({
                userId: req.user._id,
                orderId: order.id,
                status: order.status,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                notes: order.notes
             });

             const savedPayment = await payment.save();

             //return back my order details to frontend
             res.json({...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID});
       
    } catch (error) {
    // This will print the full error object to your terminal
    console.error("--- PAYMENT CREATION FAILED ---");
    console.error(error); 
    console.error("-------------------------------");
    
    // Also, send a more detailed error message to the frontend if possible
    // Razorpay errors often have a 'description' field
    const errorMessage = error.description || error.message;
    return res.status(500).json({ msg: "Server error during payment creation.", error: errorMessage });
}
})

paymentRouter.post("/webhook", async (req, res) => {
    try {

       const webhookSignature = req.get("X-Razorpay-Signature");
       const isWebhookValid = validateWebhookSignature(req.rawBody, webhookSignature, process.env.RAZORPAY_WEBHOOK_SECRET);

       if(!isWebhookValid){
        return res.status(400).json({msg: "Webhook signature is invalid"});
       }

       //update my payment status in db
       const paymentDetails = req.body.payload.payment.entity;
       
       const payment = await Payment.findOne({orderId: paymentDetails.orderId});
       payment.status = paymentDetails.status;
       await payment.save();

       const user = await User.findOne({_id: payment.userId});

       user.isPremium = true;
       user.membershipType = payment.notes.membershipType;
       await user.save();


       //return success response to razorpay 

    //    if(req.body.event == "payment.captured"){
        
    //    }

    //    if(req.body.event == "payment.captured"){

    //    }
       return res.status(200).json({msg:"Webhook recieved successfully!"});
    } catch (error) {
        return res.status(400).json({msg:error.message});
    }
})

module.exports = paymentRouter;
