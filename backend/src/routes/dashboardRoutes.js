const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', authenticateToken, asyncHandler(dashboardController.getDashboard));

module.exports = router;
