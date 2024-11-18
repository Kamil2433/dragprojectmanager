const express = require("express");
const router = express.Router();
const user = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const logerror=require("../middleware/logger");


const authsrt = "nikko";


//route to create a new user
router.post("/reg", async (req, res) => {
  try {
    // Check if the user already exists by email
    const existingUser = await user.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email already registered, please use a different email." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    const newUser = new user({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role || "team_member", // Default role is 'team_member'
    });

    // Save the user to the database
    await newUser.save();

    // Respond with the user data (excluding the password for security)
    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    logerror("Error occurred while registering",error);
    res.status(500).json({ error: "An error occurred during registration." });
  }
});


//login a user
router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    const userdata = await user.findOne({ name: req.body.id });
    
    
    if (!userdata) {
      return res
        .status(400)
        .json({ error: "Invalid Credentials, user doesn't exist" });
    }

    const passwordcomp = await bcrypt.compare(req.body.password, userdata.password);

    if (!passwordcomp) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const data = {
      user: {
        id: userdata._id,
      },
    };

    const authtoken = jwt.sign(data, authsrt);
    res.json(authtoken);

  } catch (err) {
    logerror("Error occurred while login",err);
    res.status(500).json({ error: "An error occurred" });
  }
});




router.post("/getuser", fetchuser, async (req, res) => {
  try {
    let userid = await user.findOne({ id: req.body.id });
    res.send(userid);
  } catch (error) {
    logerror("Error occurred while getting user info",error);
    res.status(500).send("err");
  }
});

module.exports = router;
