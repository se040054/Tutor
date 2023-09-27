const fs = require('fs') // 引入 fs 模組
const localFileHandler = file => { // file 是 multer 處理完的檔案
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null) // 如果Multer沒傳 就終止
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return resolve(new Error('僅接受jpg jpeg png'))
    }
    const fileName = `public/images/${file.originalname}`
    return fs.promises.readFile(file.path)
      .then(data => fs.promises.writeFile(fileName, data))
      .then(() => resolve(`${process.env.URL}/images/${file.originalname}`))
      .catch(err => reject(err))
  })
}
module.exports = {
  localFileHandler
}
