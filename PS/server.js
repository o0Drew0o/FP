const express = require('express');
const fetch = require('node-fetch'); // Ensure this line is present for Node.js <18

// Create an Express app
const app = express();
const PORT = 3000;

// List of servers to ping
const serversToPing = [
    "https://tca-mr9v.onrender.com/health",
    "https://fp-2uxw.onrender.com",
    "https://ping-6ccl.onrender.com",
    "https://egjs.onrender.com/ping",
    "https://egjs-1.onrender.com/ping"
];

// Ping interval in milliseconds
const PING_INTERVAL = 1 * 60 * 1000; // 1 minute

// In-memory storage for ping results
const pingResults = [];

// Function to ping servers
const pingServers = async () => {
    console.log("Pinging servers...");
    const results = [];
    for (const server of serversToPing) {
        try {
            const response = await fetch(server);
            const status = response.ok ? "success" : `failed (status: ${response.status})`;
            results.push({
                server,
                status,
                timestamp: new Date().toISOString()
            });
            console.log(`✅ Ping ${status}: ${server}`);
        } catch (error) {
            results.push({
                server,
                status: `failed (error: ${error.message})`,
                timestamp: new Date().toISOString()
            });
            console.error(`❌ Ping failed: ${server} - ${error.message}`);
        }
    }
    // Store the latest results
    pingResults.splice(0, pingResults.length, ...results);
};

// Start the ping loop
setInterval(pingServers, PING_INTERVAL);

// Root endpoint to confirm server is running
app.get('/', (req, res) => {
    res.send("Ping server is running!");
});

// Endpoint to get the ping health of servers
app.get('/ping-health', (req, res) => {
    res.json({
        serverResponses: pingResults
    });
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Ping server is running on http://localhost:${PORT}`);
});
