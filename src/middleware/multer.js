const multer = require('multer')
const upload = multer({ dest: 'public/temp' })

module.exports = upload
