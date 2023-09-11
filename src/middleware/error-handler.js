module.exports = {
  apiErrorHandler (err, req, res, next) {
    if (err instanceof Error) { // 客製化的部分
      return res.status(400).json({
        status: 'error',
        message: `${err.message} `
      })
    } else {
      return res.status(500).json({
        status: 'error',
        message: `${err.name} : ${err.message} `
      })
    }
  }
}
