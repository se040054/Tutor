require('dotenv').config({ path: './environment/dev/.env' })

const express = require('express')

const app = express()
const port = process.env.PORT

const apis = require('./src/routes/index')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api', apis)

app.get('/', (req, res) => {
  res.send('dev/dev_home')
})

app.listen(port, () => {
  console.info(`http://localhost:${port}`)
  console.log(`for api http://localhost:${port}/api `)
  console.log(`for auth http://localhost:${port}/api/auth/google `)
})
