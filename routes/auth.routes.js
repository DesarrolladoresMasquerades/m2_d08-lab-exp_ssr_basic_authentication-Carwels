const express = require("express")
const User = require("../models/User.model")
const router = express.Router()
const saltRounds = 10;
const bcryptjs = require("bcryptjs")
const bcrypt = require("bcrypt")
const res = require("express/lib/response")


router
  .route("/signup")
  .get((req, res) => {
    res.render("signup");
  })
  .post((req, res) => {
    const username = req.body.username;
    //*1- can be let password =
    const password = req.body.password;

    //Check the form is NOT empty
    if (!username || !password) {
      res.render("signup", { errorMessage: "All fields are required" });
    }
    //looking in DB if user exists
    User.findOne({ username }).then((user) => {
      //kill switch, if the user exists then it kills the function
      if (user && user.username) {
        {
          res.render("signup", { errorMessage: "User already taken" });
        }
        throw new Error("Validation error");
      }
      //here we use bcrypt
      const salt = bcrypt.genSaltSync(saltRounds);
      //*1- then here would be password = bcrypt.hashSync(password,salt)
      const hashedPwd = bcrypt.hashSync(password, salt);
      //*1- Then here would be User.create({username, password) In this way would be a cleaner code
      User.create({ username, password: hashedPwd }).then(() =>
        res.redirect("/")
      );
    });
  });

  router
    .route("/login")
    .get((req, res) => {
        res.render("login")
    })
    .post((req, res) => {
        const username = req.body.username
        const password = req.body.password

        if(!username || !password) {
            res.render("login", { errorMessage: "All fields are required"})
            throw new Error("Validation error")
        }

        User.findOne({ username })
        .then((user) => {
            if(!user) {
                res.render("login", { errorMessage: "Incorrect credentials"})
                throw new Error("Validation error")
            }

            const isPwCorrect = bcrypt.compareSync(password, user.password)

            if(isPwCorrect) {
                req.session.currentUserId = user._id
                res.redirect("/profile")
            } else {
                res.render("login", { errorMessage: "Incorrect credentials!" })
            }
        })
        .catch((err) => console.log(err))
    })



    module.exports = router