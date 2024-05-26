const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");
const roles = ['buyer', 'seller'];

mongoose.connect(process.env.MONGODB_URI);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  posts: [{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Post'
  }],
  dp: {
    type: String, 
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  contactNo: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: roles
  }
});

userSchema.plugin(plm);
module.exports = mongoose.model('User', userSchema);
