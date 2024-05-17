// gameLogic.js

const userBalance = {
    user: 50 // Starting balance for the user
};

// Function to generate random crash points for each horse
function generateRandomCrashPoints() {
    const min = 1;
    const max = 99;

    const randomCrashPoints = {};

    for (let i = 1; i <= 4; i++) {
        const rng = Math.floor(Math.random() * (max - min + 1)) + min;
        randomCrashPoints[`horse${i}`] = rng;
    }

    return randomCrashPoints;
}

// Function to place a bet
function placeBet(user, horseId, stakeAmount) {
    // Check if user exists
    if (!userBalance.hasOwnProperty(user)) {
        throw new Error('User does not exist');
    }

    // Check if stake amount is within the minimum and maximum limits
    if (stakeAmount < 10 || stakeAmount > 500) {
        throw new Error('Stake amount must be between 10 and 500 points');
    }

    // Check if user's balance is sufficient for the stake amount
    if (userBalance[user] < stakeAmount) {
        throw new Error('Insufficient balance');
    }

    // Deduct stake amount from user's balance
    userBalance[user] -= stakeAmount;

    // Log the bet
    console.log(`${user} placed a bet of ${stakeAmount} points on horse ${horseId}`);
}

// Function to calculate crash multiplier based on RNG
function calculateMultiplier(crashPoint) {
    if (crashPoint < 1 || crashPoint > 99) {
        return 1; // Default multiplier
    }

    const E = 100;
    const R = crashPoint;
    const multiplier = ((E * 100 - R) / (E - R)) / 100;

    return multiplier.toFixed(2); // Round to 2 decimal places
}

// Function to cash out a bet
function cashOut(user, horseId, stakeAmount, horsesCrashed, horseCrashPoints) {
    // Check if user exists
    if (!userBalance.hasOwnProperty(user)) {
        throw new Error('User does not exist');
    }

    // Validate horseId is present in horseCrashPoints
    if (!horseCrashPoints || !horseCrashPoints.hasOwnProperty(horseId)) {
        throw new Error(`Crash point not found for horse ${horseId}`);
    }

    // Calculate the payout multiplier
    let multiplier = calculateMultiplier(horseCrashPoints[horseId]);

    // Check if the user's horse is the last one remaining and apply the winner's bonus
    if (horsesCrashed.filter((crashed) => crashed).length === 3 && !horsesCrashed.includes(false)) {
        // Apply winner's bonus of 2.00 to the multiplier
        multiplier += 2.00;
    }

    // Calculate winnings based on the provided stake amount and multiplier
    const winnings = Math.round(stakeAmount * multiplier);

    // Add winnings to user's balance
    userBalance[user] += winnings;

    // Log the cash out
    console.log(`${user} cashed out on horse ${horseId} with a stake amount of ${stakeAmount} points and a multiplier of ${multiplier}. Winnings: ${winnings}`);
}

module.exports = { generateRandomCrashPoints, placeBet, cashOut, calculateMultiplier, userBalance };

