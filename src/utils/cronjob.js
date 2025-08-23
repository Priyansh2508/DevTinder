
const cron = require("node-cron");

const {subDays, startOfDay, endOfDay} = require("date-fns");
const { Connection } = require("mongoose");
const ConnectionRequestModel = require("../models/connectionRequest");

const sendEmail = require("./sendEmail");

cron.schedule("12 16 * * *",async  ()=>{
   try {

    const yesterday = subDays(new Date(), 1);

    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequestModel.find({
        status: "interested",
        createdAt: {
            $gte: yesterdayStart,
            $lt: yesterdayEnd,
        }
    }).populate("fromUserId toUserId");

    const listOfEmails = [...new Set(pendingRequests.map(req => req.toUserId.emailId))];



    for(const email of listOfEmails){

        try {
            const res = await sendEmail.run();
           
        } catch (error) {
            console.log(error);
        }
    }

   } catch (error) {
    console.error(error);
   }
});