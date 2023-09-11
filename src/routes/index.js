const express = require('express')
const router = express.Router()

const { apiErrorHandler } = require('../middleware/error-handler')
const { authenticated } = require('../middleware/api-auth')

const users = require('./users')
const oauth = require('./oauth')

router.get('/home', authenticated, (req, res) => {
  res.json({ data: 'here is home' })
})

router.use(users)
router.use(oauth)

router.use(apiErrorHandler)

module.exports = router
