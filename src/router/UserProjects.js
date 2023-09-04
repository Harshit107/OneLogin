const express = require("express");
const router = express.Router();
const database = require("../database/firebaseConfig");
const {createUserRef} = require('../database/FirebaseRef')

// New File store
router.get("/check", async function (req, res) {

  try {
 
    const createUserDbRef = database.ref(createUserRef("123","445"));
    const messageKey = await createUserDbRef.push().key;
    await createUserDbRef.child(messageKey).set({"Harshit" : "123"});
    res.send(messageKey);
  } catch (e) {
    res.status(400).send({ data: "", error: e.message });
  }
});


module.exports = router