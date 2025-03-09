const express = require('express');
const cors = require('cors');
require('dotenv').config();

const cardAnalysisRoute = require('./routes/cardAnalysisRoute');

const app = express();
app.use(cors());
app.use(express.json()); // Increase payload size if needed

// Card Analysis Route
app.use('/api/ca', cardAnalysisRoute);

// Root route
app.get('/', (req, res) => {
    console.log('Hedera Backend is Running!');
    res.send('Hedera Backend is Running!');
});



// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
