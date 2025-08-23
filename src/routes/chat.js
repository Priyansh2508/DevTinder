// routes/chat.js
const express = require("express");
const mongoose = require("mongoose");
const { Chat } = require("../models/chat");
const { userAuth } = require("../middlewares/auth");

const chatRouter = express.Router();

const toOid = (v) => new mongoose.Types.ObjectId(String(v));

chatRouter.get("/:targetUserId", userAuth, async (req, res) => {
  try {
    const targetUserId = req.params.targetUserId;
    const userId = req.userId || req.user?._id; // depends on your userAuth

    // DEBUG: see what's coming in
    console.log("[chat] params:", req.params, "userId from auth:", userId);

    // 1) presence checks
    if (!userId || !targetUserId) {
      return res.status(400).json({ error: "Missing userId or targetUserId" });
    }

    // 2) validate ObjectId shape
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(targetUserId)) {
      return res.status(400).json({ error: "Invalid ObjectId(s)" });
    }

    const me = toOid(userId);
    const other = toOid(targetUserId);

    // 3) find existing chat
    let chat = await Chat.findOne({
      participants: { $all: [me, other] },
    })
      .populate({ path: "participants", select: "firstName lastName photoUrl" })
      .populate({ path: "messages.senderId", select: "firstName lastName photoUrl" });

    // 4) create if missing
    if (!chat) {
      chat = await Chat.create({
        participants: [me, other],
        messages: [],
      });
      chat = await chat.populate({
        path: "participants",
        select: "firstName lastName photoUrl",
      });
    }

    return res.json(chat);
  } catch (err) {
    console.error("GET /api/v1/chat/:targetUserId error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = chatRouter;
