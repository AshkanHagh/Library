const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');

const app = express();

require('dotenv').config();
const PORT = process.env.PORT || 5500;


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+'.jpg')
  }
})

const fileFilter = function (req, file, cb) {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true);
  }
  else {
    cb(new Error('File type not supported!'), false);
  }
};


const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});


app.use(bodyParser.json());
app.use(cors());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(upload.single('image'));


app.use('/auth', authRouter);
app.use('/post', postRouter);


app.use((error, req, res, next) => {

    console.log(error);

    const status = error.statusCode || 500;
    const message = error.message;

    res.status(status).json({message});
    next()
})


mongoose.connect(process.env.MONGODB_URL);

app.listen(PORT, () => console.log(`server running on ${PORT}`));