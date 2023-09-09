const axios = require('axios')
const port = process.env.PORT || 3000
const userController = {
  renderRegister: (req, res) => {
    res.render('user/register')
  },
  renderLogin: (req, res) => {
    res.render('user/login')
  },
  postRegister: (req, res, next) => {
    const { email, password, confirmPassword } = req.body
    return axios.post(
      `http://localhost:${port}/api/users/register`,
      { email, password, confirmPassword }
    )
      .then(response => {
        const responseData = response.data.data // 因為api的資料叫做data 然後res的資料也會有一層data
        console.log('axios post', responseData)
        if (responseData) return res.redirect('/users/login')
      })
      .catch(err => next(err))
  }
}
module.exports = userController
