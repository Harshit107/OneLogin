const express = require("express");
const router = new express.Router();
const fe = require("freely-email");

router.get("/testing", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "not_found" });
  }
  const msgBody = {
    recipient: process.env.TEST_EMAIL || "test@example.com",
    app: "Reminder",
    subject: "Applying for SDE Role",
    sender: "Uthsav",
    replyTo: process.env.TEST_EMAIL || "test@example.com",
    otp: "123456",
    message:
      "Welcome to the Auto Email Sender app! This app is designed to make it easy for developers to send automated emails to multiple recipients.",
    HTMLfile: "",
  };
  const result = await fe.sendOTP(msgBody);
  res.send(result);
});

module.exports = router;
