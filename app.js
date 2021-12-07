const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./util/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const touchpointRouter = require('./routes/touchpointRoutes');

const app = express();

// GLOBAL MIDDLEWARE STACK:

// Set Security HTTP headers:
app.use(helmet());

// Development logging
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP address
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP address, please try again in 1 hour'
});

app.use('/api', limiter);

// CORS:
app.use(cors());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb'}));

// Cookie parser, reading data from cookies
app.use(cookieParser());

// Data Sanitisation against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitisation against XSS
app.use(xss());

// Compresses responses
app.use(compression());

// DATABASE CONNECTION:
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect( DB,
  { useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
  }).then(() => console.log('Connection to Atlas successful'));

// ROUTES:
app.use('/api/v1/users', userRouter);
app.use('/api/v1/touchpoints', touchpointRouter)

// ROUTER HANDLER: Catches any routes that were missed.
app.all('*', (req, res, next) => {
  next( new AppError(`Can't find ${ req.originalUrl } on this server!`, 404));
});

// ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
