const express = require("express");
const router = new express.Router();
const User = require("../model/User.js");
const validator = require('../Helper/Validator.js');
const userAuth = require('../auth/userAuth.js')


//dev dependencies
const {errorLog, successLog, normalLog} = require("../adminSection/Logs.js");




// ===================    Method Area  ======================================

const showErrorLog = (message) => {
  errorLog(message);
};


const showSuccessLog = (message) => {
  successLog(message);
};



/* -------------------------------------------------------------------------- */
/*                                 Create User                                */
/* -------------------------------------------------------------------------- */


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


/* -------------------------------------------------------------------------- */
/*                                 Login User                                 */
/* -------------------------------------------------------------------------- */

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


/* -------------------------------------------------------------------------- */
/*                                 Logout User                                */
/* -------------------------------------------------------------------------- */

router.post('/users/logout', userAuth, async (req, res) => {

    try {

      const tokenToRemove = req.token;
      const user = req.user;

      user.tokens =  user.tokens.filter(token => token.token !== tokenToRemove );
      await user.save();
      res.send({message : "User logged out successfully"})

    }
    catch (err) { 
      showErrorLog(err.message);     
      res.status(400).send({error : err.message})
    }

});


/* -------------------------------------------------------------------------- */
/*                        Logout User from every device                       */
/* -------------------------------------------------------------------------- */

router.post('/users/logout/all', userAuth, async (req, res) => {

    try {

      const user = req.user;
      user.tokens = [];

      await user.save();
      res.send({message : "User logged out successfully"})

    }
    catch (err) { 
      showErrorLog(err.message);     
      res.status(400).send({error : err.message})
    }

});



/* -------------------------------------------------------------------------- */
/*                        Logout User from every device                       */
/* -------------------------------------------------------------------------- */

router.post('/users/logout/all', userAuth, async (req, res) => {

    try {

      const user = req.user;
      user.tokens = [];

      await user.save();
      res.send({message : "User logged out successfully"})

    }
    catch (err) { 
      showErrorLog(err.message);     
      res.status(400).send({error : err.message})
    }

});



/* -------------------------------------------------------------------------- */
/*                          Logout User from specific                         */
/* -------------------------------------------------------------------------- */


router.post('/users/logout/device', userAuth, async (req, res) => {

    try {
      const tokenToRemove = req.body.token+'';
      const user = req.user;

      if(!tokenToRemove) {
        return res.status(403).send({error : "No Device Found"});
      }
      
      const allToken = user.tokens.filter(
        (token) => token.token !== tokenToRemove
      );

      if (allToken.length === user.tokens.length)
        return res.status(400).send({ error: "Device not found in login list" }); 

      user.tokens = allToken;
      await user.save();
      res.send({message : "User logged out successfully"})

    }
    catch (err) { 
      showErrorLog(err.message);     
      res.status(400).send({error : err.message})
    }

});


/* -------------------------------------------------------------------------- */
/*                          checking profile from Id                          */
/* -------------------------------------------------------------------------- */

router.get('/users/profile', userAuth, async (req, res) => {

    try {
        const user = await User.findById(req.user._id)
        res.status(200).send({message : user})


    } catch (error) {
        res.status(403).send({
            "Error": error
        })
    }
})



/* -------------------------------------------------------------------------- */
/*                           check user is verified                           */
/* -------------------------------------------------------------------------- */


router.get("/users/isVerified", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).send({ message: user.isVerified });
  } catch (error) {
    res.status(403).send({
      Error: error,
    });
  }
});








  //+++++++++++++++++++     Checks      ++++++++++++++++++++++++++++++

/* -------------------------------------------------------------------------- */
/*                             Check is User Login                            */
/* -------------------------------------------------------------------------- */


router.get("/users/check/login",userAuth, async (req, res) => {
  try {
    
    res.status(200).send({message : "true"});

  } catch (err) {
    showErrorLog(err.message);
    res.status(400).send({ error: err.message });
  }
});



module.exports = router;
