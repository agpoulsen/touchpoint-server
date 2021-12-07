const Touchpoint = require('./../models/touchpointModel');
const User = require('./../models/userModel');
const catchAsync = require('./../util/catchAsync');
const AppError = require('./../util/appError');

exports.getAllTouchpoints = catchAsync(async (req, res, next) => {
  const touchpoints = await Touchpoint.find()

  // Send response
  res.status(200).json({
    status: 'success',
    results: touchpoints.length,
    data: {
      touchpoints
    }
  });
});

exports.createTouchpoint = catchAsync( async (req, res, next) => {
  // Allow nested routes
  if(!req.body.user) req.body.user = req.user.id;

  const newTouchpoint = await Touchpoint.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      touchpoint: newTouchpoint
    }
  });
});

exports.getUsersTouchpoints = catchAsync( async (req, res, next) => {

  const userTouchpoints = await Touchpoint.find( {user: req.user.id} );

  res.status(201).json({
    status: 'success',
    data: {
      userTouchpoints
    }
  });
});

exports.getSingleTouchpoint = catchAsync( async (req, res, next) => {

  const touchpoint = await Touchpoint.findById(req.params.touchpointId);

  res.status(201).json({
    status: 'success',
    data: {
      touchpoint
    }
  });
});

exports.updateTouchpoint = catchAsync( async (req, res, next) => {
  const touchpoint = await Touchpoint.findByIdAndUpdate(req.params.touchpointId, req.body, {
    new: true,
    runValidators: true
  });

  if (!touchpoint) {
    return next( new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      touchpoint
    }
  });
});

exports.deleteTouchpoint = catchAsync( async (req, res, next) => {

  console.log(req);

  const touchpoint = await Touchpoint.findByIdAndDelete(req.params.touchpointId);

  if(!touchpoint) {
    return next( new AppError('No touchpoint found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
