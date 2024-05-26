const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads') //destionation folder for uploads
    },
    filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4(); //generating a unique filename using UUID
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  })
  
  const upload = multer({ storage: storage })

  module.exports = upload;