const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const { placeBet, cashOut, generateRandomCrashPoints, userBalance } = require('./gameLogic');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create a WebSocket server instance using the HTTP server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // Handle incoming messages from the client
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'placeBet') {
                // Handle placing a bet
                const { user, horseId, stakeAmount } = data;
                placeBet(user, horseId, stakeAmount);
                
                // Broadcast updated user balance to all connected clients
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({ type: 'updateBalance', user, balance: userBalance[user] }));
                });

            } else if (data.type === 'cashOut') {
                // Handle cashing out
                const { user, horseId, horsesCrashed, horseCrashPoints } = data;
                cashOut(user, horseId, horsesCrashed, horseCrashPoints);
                
                // Broadcast updated user balance to all connected clients
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({ type: 'updateBalance', user, balance: userBalance[user] }));
                });

            } else {
                // Handle other message types as needed
            }
        } catch (error) {
            console.error(`Error processing message: ${error.message}`);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error(`Error occurred: ${error.message}`);
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});