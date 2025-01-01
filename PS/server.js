const express = require('express');
const fetch = require('node-fetch');

// Create the Express app
const app = express();
const PORT = 3000;

// List of servers to ping
const serversToPing = [
    "https://your-first-server.com",
    "https://your-second-server.com"
];

// Ping servers every interval (e.g., 5 minutes)
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Function to ping servers
const pingServers = async () => {
    console.log("Pinging servers...");
    for (const server of serversToPing) {
        try {
            const response = await fetch(server);
            if (response.ok) {
                console.log(`✅ Ping successful: ${server}`);
            } else {
                console.error(`⚠️ Ping failed (non-OK response): ${server}`);
            }
        } catch (error) {
            console.error(`❌ Ping failed (error): ${server} - ${error.message}`);
        }
    }
};

// Set up the periodic pings
setInterval(pingServers, PING_INTERVAL);

// Root route to check if this server is running
app.get('/', (req, res) => {
    res.send("Ping Server is running!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Ping server is running on http://localhost:${PORT}`);
});
