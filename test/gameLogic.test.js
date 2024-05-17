// gameLogic.test.js

const assert = require('assert');

const { generateRandomCrashPoints, placeBet, cashOut, userBalance } = require('../gameLogic');
describe('generateRandomCrashPoints', () => {
    it('should return an object', () => {
        const crashPoints = generateRandomCrashPoints();
        assert.strictEqual(typeof crashPoints, 'object');
    });

    it('should contain crash points for four horses', () => {
        const crashPoints = generateRandomCrashPoints();
        assert.strictEqual(Object.keys(crashPoints).length, 4);
    });

    it('should have crash points within the range of 1 to 99', () => {
        const crashPoints = generateRandomCrashPoints();
        Object.values(crashPoints).forEach(point => {
            assert.ok(point >= 1 && point <= 99);
        });
    });

    it('should produce different results each time', () => {
        const results = [];
        for (let i = 0; i < 10; i++) {
            const newCrashPoints = generateRandomCrashPoints();
            results.push(JSON.stringify(newCrashPoints));
        }
        const uniqueResults = new Set(results);
        assert.ok(uniqueResults.size > 1, 'generateRandomCrashPoints should return different results each time');
    });
});

describe('placeBet', () => {
  beforeEach(() => {
      // Initialize userBalance to the starting balance for each test
      userBalance.user = 50;
  });

  it('should throw an error if the user does not exist', () => {
      assert.throws(() => placeBet('nonexistentUser', 'horse1', 10), /User does not exist/);
  });

  it('should throw an error if the stake amount is outside the range of 10 to 500 points', () => {
      assert.throws(() => placeBet('user', 'horse1', 5), /Stake amount must be between 10 and 500 points/);
      assert.throws(() => placeBet('user', 'horse1', 1000), /Stake amount must be between 10 and 500 points/);
  });

  it('should throw an error if the user does not have sufficient balance', () => {
      userBalance.user = 9; // Set the user's balance to a low value
      assert.throws(() => placeBet('user', 'horse1', 10), /Insufficient balance/);
  });

  it('should deduct the stake amount from the user\'s balance', () => {
      placeBet('user', 'horse1', 10);
      assert.strictEqual(userBalance.user, 40); // User's balance should be 40 after placing the bet
  });

  it('should log the bet', () => {
    // Capture console output
    let logOutput = '';
    const originalConsoleLog = console.log;
    console.log = (message) => {
        logOutput += message;
    };

    // Execute placeBet and check the log output
    placeBet('user', 'horse1', 10);
    assert(logOutput.includes('user placed a bet of 10 points on horse horse1')); // Make sure the log message matches the expected format

    // Restore original console.log function
    console.log = originalConsoleLog;
});
});

describe('cashOut', () => {
    beforeEach(() => {
        // Initialize userBalance to the starting balance for each test
        userBalance.user = 50;
    });

    it('should throw an error if the user does not exist', () => {
        assert.throws(() => cashOut('nonexistentUser', 'horse1', [false, false, false, false]), /User does not exist/);
    });

    it('should calculate the correct winnings based on the multiplier', () => {
        // Set up necessary conditions
        const initialBalance = userBalance.user;
        const stakeAmount = 10;
        const multiplier = 2.00;
        const horseCrashPoints = {
            horse1: 34,
            horse2: 45,
            horse3: 28,
            horse4: 67,
        };
        // Assuming the user's initial balance is 50 and they placed a bet of 10 on a horse
        userBalance.user = 50 - stakeAmount;
    
        // Perform cashOut
        cashOut('user', 'horse1', [false, false, false, true], horseCrashPoints);
    
        // Calculate expected winnings and round them
        const expectedWinnings = Math.round(stakeAmount * multiplier);
    
        // Assert the user's balance has increased by the expected winnings
        assert.strictEqual(userBalance.user, initialBalance + expectedWinnings);
    });    

    it('should handle the winner\'s bonus if the user\'s horse is the last one remaining', () => {
        // Set up necessary conditions
        const stakeAmount = 10;
        const multiplier = 2.00;

        // Assuming the user's initial balance is 50 and they placed a bet of 10 on a horse
        userBalance.user = 50 - stakeAmount;

        // Perform cashOut with horsesCrashed array indicating the other three horses crashed
        const horsesCrashed = [true, true, true, false]; // 'horse1' is the last one standing

        cashOut('user', 'horse1', horsesCrashed);

        // Calculate expected winnings with the winner's bonus
        const expectedMultiplier = multiplier + 2.00; // Multiplier with winner's bonus
        const expectedWinnings = stakeAmount * expectedMultiplier;

        // Assert the user's balance has increased by the expected winnings
        assert.strictEqual(userBalance.user, 50 - stakeAmount + expectedWinnings);
    });

    it('should handle user balance correctly if cashing out on a crashed horse', () => {
        // Set up necessary conditions
        const stakeAmount = 10;
        const initialBalance = userBalance.user;

        // Assuming the user's initial balance is 50 and they placed a bet of 10 on a horse
        userBalance.user = initialBalance - stakeAmount;

        // Perform cashOut where the horse has crashed
        const horsesCrashed = [true, false, false, false]; // 'horse1' has crashed

        cashOut('user', 'horse1', horsesCrashed);

        // Assert the user's balance has not changed (since their horse crashed)
        assert.strictEqual(userBalance.user, initialBalance - stakeAmount);
    });
});