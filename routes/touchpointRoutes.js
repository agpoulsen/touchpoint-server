const express = require('express');
const touchpointController = require('./../controllers/touchpointController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/')
  .get(authController.protect, touchpointController.getAllTouchpoints)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    touchpointController.createTouchpoint
  );

module.exports = router;
