module.exports = {
  generalErrorHandler (err, req, res, next) {
    if (err.response.status === 400) { // axios error
      req.flash('error_messages', `${err.response.data.error}`)
    } else if (err instanceof Error) { // 手動觸發的Error
      req.flash('error_messages', `${err.name} : ${err.message}`)
    }
    res.redirect('back')
    return next(err)
  },
  apiErrorHandler (err, req, res, next) {
    if (err instanceof Error) { // 客製化的部分
      return res.status(400).json({
        status: 'error',
        message: `${err.message} `
      })
    } else {
      return res.status(500).json({
        status: 'error',
        message: `${err.message} `
      })
    }
  }
}
