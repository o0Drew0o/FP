const express = require('express');

// Create an Express app
const app = express();
const PORT = 3000;

// List of servers to ping
const serversToPing = [
    "https://tca-mr9v.onrender.com",
    "https://fp-2uxw.onrender.com",
    "https://ping-6ccl.onrender.com"
];

// Ping interval in milliseconds
const PING_INTERVAL = 1 * 60 * 1000; // 1 minutes

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

// Start the ping loop
setInterval(pingServers, PING_INTERVAL);

// Root endpoint to confirm server is running
app.get('/', (req, res) => {
    res.send("Ping server is running!");
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Ping server is running on http://localhost:${PORT}`);
});
