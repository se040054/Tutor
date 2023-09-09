require('dotenv').config()

const express = require('express')
const { engine } = require('express-handlebars')
const app = express()
const port = 3000
const { apis, pages } = require('./routes')
const flash = require('connect-flash')
const session = require('express-session')
const messageHandler = require('./middleware/message-handler')

app.engine('.hbs', engine({ extname: '.hbs' }))
app.set('view engine', '.hbs')
app.set('views', './views')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(flash())

app.use(messageHandler)

app.use('/api', apis)
app.use(pages)

app.get('/', (req, res) => {
  res.render('dev/dev_home')
})

app.listen(port, () => {
  console.info(`http://localhost:${port}`)
})
