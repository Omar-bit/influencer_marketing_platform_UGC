import multer from 'multer';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        '-' +
        Date.now() +
        file.originalname.substring(file.originalname.lastIndexOf('.'))
    );
  },
});

const upload = multer({ storage });
export default upload;
