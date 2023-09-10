require('dotenv').config()

const express = require('express')

const app = express()
const port = process.env.PORT

const { apis } = require('./routes')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api', apis)

app.get('/', (req, res) => {
  res.render('dev/dev_home')
})

app.listen(port, () => {
  console.info(`http://localhost:${port}`)
})
