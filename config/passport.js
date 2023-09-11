const passport = require('passport')
const passportJwt = require('passport-jwt')
const JwtStrategy = passportJwt.Strategy
const ExtractJwt = passportJwt.ExtractJwt
const { User } = require('../src/db/models')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}

passport.use(new JwtStrategy(opts, (jwtPayload, cb) => {
  User.findByPk(jwtPayload.id) // 以後設置關聯 請在這裡擴充payload包含的資料
    .then(user => {
      if (!user) return cb(new Error('用戶不存在'), false) // 注意這裡的錯誤 不會給控制器抓到 而是處置器
      return cb(null, user)
    })
    .catch(err => cb(err, false))
}))

passport.use(new LocalStrategy(
  // 客製化欄位資料+選項
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // 此次生命週期登入後回調函式把user丟進req.user(下面記得加req)
  },
  // 驗證登入流程
  (req, email, password, cb) => { // 這裡的req是上面的回調函式需要用的 不能移除
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) return cb(new Error('用戶不存在'), false)
        bcrypt.compare(password, user.password)
          .then(res => {
            if (!res) return cb(new Error('密碼錯誤'), false)
            return cb(null, user)
          })
      })
      .catch(err => cb(err))
  }
))

const GoogleStrategy = require('passport-google-oauth20').Strategy

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['email', 'profile'],
  state: false // API是無狀態，沒session，不用特別設置，但要記得false
},
(accessToken, refreshToken, profile, cb) => {
  const userProfile = profile._json
  return User.findOne(
    { where: { email: userProfile.email } }
  )
    .then(user => {
      if (user) return cb(null, user)
      if (!user) {
        return User.create({
          email: userProfile.email,
          name: userProfile.name,
          password: bcrypt.hashSync(Math.random().toString(36).slice(2), 10),
          isTeacher: false,
          isAdmin: false,
          learningHour: 0
        })
          .then(createdUser => cb(null, createdUser))
      }
    })
    .catch(err => cb(err))
}))

module.exports = passport
