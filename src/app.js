require('dotenv').config();

const express = require("express");
const connectDB = require("./config/database.js");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js");
const paymentRouter = require('./routes/payment.js');
const http = require("http");
const initializeSocket = require('./utils/socket.js');
const chatRouter = require('./routes/chat.js');
require("./utils/cronjob.js");


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json({
  verify: (req, res, buf) => {
    // Save the raw body as a string on the request object
    req.rawBody = buf.toString();
  }
}));
app.use(cookieParser());

// ✅ Add this test route before DB connection
app.get("/test", (req, res) => {
  res.send("Test OK");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/request", requestRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/chat", chatRouter);


const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("✅ MongoDB connection established");
    server.listen(3000, () => {
      console.log("Server is listening on port 3000....");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
