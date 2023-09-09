require('dotenv').config()

const express = require('express')
const { engine } = require('express-handlebars')
const app = express()
const port = 3000
const { apis, pages } = require('./routes')
app.engine('.hbs', engine({ extname: '.hbs' }))
app.set('view engine', '.hbs')
app.set('views', './views')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api', apis)
app.use(pages)

app.listen(port, () => {
  console.info(`http://localhost:${port}`)
})
