const express = require("express");
const router = new express.Router();
const User = require("../model/User.js");
const validator = require('../Helper/Validator.js');

//dev dependencies
const {errorLog, successLog, normalLog} = require("../adminSection/Logs.js");




// ===================    Method Area  ======================================

const showErrorLog = (message) => {
  errorLog(message);
};


const showSuccessLog = (message) => {
  successLog(message);
};



// ----------------------     Create User   ------------------------------------------
router.post('/users/create', async (req, res) => {

    let isUserCreated = false;
    try {
      const {email} = validator.userValidator(req.body);
      const user = await User.find({email});
      if(user.length >  0 )
        return res.status(400).send({error : "user is already registered with us"});
      
      const newUser = new User(req.body);
      if(!newUser)
        return res.status(403).send({error : "Registration Failed!", message : "check your input data"});
      
      await newUser.save();
      isUserCreated = true;
      const token = await newUser.generateToken();
      const userId = newUser._id;
      res.status(201).send({
        user : newUser,
        token : token,
        userId : userId,
        message : "User created successfully"
      })
    }
    catch (err) { 

      showErrorLog(err.message);
      if(isUserCreated){
        const createdUser = await User.findOneAndDelete({email:req.body.email});
        showErrorLog("deleted new created user");
      }        
      res.status(400).send({error : err.message})
    }

});


// ----------------------     Login User   ------------------------------------------

router.post('/users/login', async (req, res) => {

    try {
      const {email, password} = validator.userValidator(req.body);
      
      const user = await User.findByCredentails(email,password)
      const token = await user.generateToken();
      showSuccessLog("User Logged In Successfully")
      res.status(200).send({
        user,
        token,
        message : "User logged in successfully"
      })
    }
    catch (err) { 
      showErrorLog(err.message);     
      res.status(400).send({error : err.message})
    }

});












//+++++++++++++++++++ Checks 


// ----------------------     Check is User Login  ------------------------------------------


router.post("/users/check/login", async (req, res) => {
  try {
   
    res.send("Done");

  } catch (err) {
    showErrorLog(err.message);
    res.status(400).send({ error: err.message });
  }
});


module.exports = router;
