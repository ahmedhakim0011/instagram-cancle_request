const express = require('express');
const multer = require('multer');
const FollowRequestController = require('../controllers/followRequestController');

// Setup file storage for JSON uploads
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Route for handling the cancel follow requests action
router.post('/cancel-follow-requests', upload.single('file'), FollowRequestController.cancelFollowRequests);

module.exports = router;
