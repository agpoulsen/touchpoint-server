const mongoose = require('mongoose');

const touchpointSchema = new mongoose.Schema({
  touchpointType: {
    type: String,
    required: [true, 'Please enter the type of Touchpoint']
  },
  date: {
    type: Date,
    required: [true, 'Please enter the date']
  },
  companyName: {
    type: String,
  },
  roleOrPosition: {
    type: String
  },
  contactPerson: {
    type: String
  },
  additionalNotes: {
    type: String
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Touchpoint must belong to a user']
  }
}, {timestamps: true});

// touchpointSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'user',
//     select: 'name'
//   })
//
//   next();
// })

const Touchpoint = mongoose.model('Touchpoint', touchpointSchema);

module.exports = Touchpoint;
