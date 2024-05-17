// routes/index.js

const express = require('express');
const router = express.Router();
const { placeBet, cashOut } = require('../gameLogic'); // Import the functions from gameLogic.js

// Define route for placing a bet
router.post('/bet', (req, res) => {
    // Extract necessary data from request body
    const { user, horseId, stakeAmount } = req.body;

    // Call the placeBet function with extracted data
    placeBet(user, horseId, stakeAmount);

    // Send response
    res.send('Bet placed successfully!');
});

// Define route for cashing out
router.post('/cash-out', (req, res) => {
    // Extract necessary data from request body
    const { user, horseId } = req.body;

    // Call the cashOut function with extracted data
    cashOut(user, horseId);

    // Send response
    res.send('Cash out successful!');
});

module.exports = router;
