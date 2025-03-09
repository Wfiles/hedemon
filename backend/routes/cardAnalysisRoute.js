const express = require('express');
const { cardAnalysis } = require('../controllers/cardAnalysisController');

const router = express.Router();

router.post('/', cardAnalysis);

module.exports = router;