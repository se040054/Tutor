const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')

router.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }))

router.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    return res.json({
      status: 'success',
      data: req.user
    })
  })

module.exports = router
