const express = require('express');
const fetch = require('node-fetch'); // Import node-fetch

const app = express();
const PORT = 3000;

// List of servers to ping
const serversToPing = [
    "https://fp-1-j84j.onrender.com",
    "https://fp-2uxw.onrender.com"
];

// Ping interval (1 minutes)
const PING_INTERVAL = 1 * 60 * 1000;

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

// Ping servers at regular intervals
setInterval(pingServers, PING_INTERVAL);

// Start Express server
app.get('/', (req, res) => {
    res.send("Ping Server is running!");
});

app.listen(PORT, () => {
    console.log(`Ping server is running on http://localhost:${PORT}`);
});
