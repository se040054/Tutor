
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: './environment/prod/.env' })
}

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: './environment/dev/.env' })
}

const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors()) // 測試

const apis = require('./src/routes/index')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api', apis)

app.get('/', (req, res) => { // 測試
  res.send('dev_home')
})

app.listen(process.env.PORT, () => {
  console.log(`目前為:${process.env.NODE_ENV} 環境`)
  console.info(`http://localhost:${process.env.PORT}`)
  // console.log(`for api http://localhost:${process.env.PORT}/api `)
  // console.log(`for auth http://localhost:${process.env.PORT}/api/auth/google `)
})
