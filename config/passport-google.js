const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport')
const User = require('../models/User')


module.exports = function () {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"https://dsocial-interactive-blog.herokuapp.com/users/google/callback" || "http://localhost:3000/users/google/callback",
  },
    async function (accessToken, refreshToken, profile, cb) {
      // find a user if user exists serialize that user otherwise save new user to the database
      try {
        // find user
        const foundUser = await User.findOne({'googleId': profile.id }).exec()
        if (foundUser !==null) {
           cb(null, foundUser);
           return
        }
        //else create user doc

        const user = await User.create({
          name: profile.displayName,
          googleId: profile.id,
          email: profile.emails[0].value,
          picUrl: profile.photos[0].value
        })
         cb(null, user)
         
      } catch (error) {
        console.log(error);
      }
    }
  ))

  // serialize 
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  //de serialzie user
  passport.deserializeUser(async (id, done) => {
    let user = await User.findById(id)
    done(null, user)
  })
}
