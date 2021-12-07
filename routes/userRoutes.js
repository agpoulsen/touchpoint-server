const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const touchpointController = require('./../controllers/touchpointController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router
  .route('/')
  .get(authController.protect, userController.getAllUsers)
  .post(userController.createUser);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router
  .route('/:userId/touchpoints')
  .get(
    authController.protect,
    touchpointController.getUsersTouchpoints
  )
  .post(
    authController.protect,
    authController.restrictTo('user'),
    touchpointController.createTouchpoint
  );

router
  .route('/:userId/touchpoints/:touchpointId')
  .get(
    authController.protect,
    touchpointController.getSingleTouchpoint
  )
  .patch(
    authController.protect,
    authController.restrictTo('user'),
    touchpointController.updateTouchpoint
  )
  .delete(
    authController.protect,
    authController.restrictTo('user'),
    touchpointController.deleteTouchpoint
  );

module.exports = router;
