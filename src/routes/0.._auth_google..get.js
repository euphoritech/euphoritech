import passport from 'passport'

export default passport.authenticate("google", {
  scope: [  //https://developers.google.com/gmail/api/auth/scopes
    "profile",
    "email",

    // https://developers.google.com/gmail/api/auth/scopes
    // https://stackoverflow.com/questions/39161914/using-gmail-send-scope-with-smtp-msa
    // "https://www.googleapis.com/auth/gmail.send"
    "https://mail.google.com/"
  ],
  accessType: 'offline'   //returns the refresh token
})
