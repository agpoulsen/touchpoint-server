const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../util/catchAsync');
const AppError = require('./../util/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 23 * 60 * 60 * 1000),
    httpOnly: true
  }
  if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from response output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and password exists
  if (!email || !password) {
    return next( new AppError('Please provide email and password', 400));
  }

  // 2. Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if(!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. If previous two checks are fine, send token to client
  createSendToken(user, 200, res);
});


// Ensures only logged in users can access protected routes
exports.protect = catchAsync(async (req, res, next)=> {

  // 1. Get token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if(!token) {
    return next( new AppError('You are not logged in. Please log in to get access.', 401));
  }

  // 2. Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists!', 401));
  }

  // 4. Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next( new AppError('User recently changed password! Please log in again', 401));
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

// Restricts routes to users with particular roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Roles is an array e.g. ['admin', 'coach'].
    if(!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};
