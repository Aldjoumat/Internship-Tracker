const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  description: String,
  userId: String   
});

module.exports = mongoose.model('Internship', internshipSchema);
