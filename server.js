const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("crypto_army.db");

// Create the pledges table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS pledges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT,
      wallet_address TEXT UNIQUE NOT NULL,
      signature TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});



const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}));

app.use(express.json());

// WebSocket Server Setup
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("WebSocket connection established.");

  ws.on("message", (message) => {
    console.log("Received message from client:", message);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed.");
  });
});
app.post("/api/pledges", (req, res) => {
  const { name, message, walletAddress, signature } = req.body;

  db.run(
    `INSERT INTO pledges (name, message, wallet_address, signature) VALUES (?, ?, ?, ?)`,
    [name, message || "No message provided", walletAddress, signature],
    function (err) {
      if (err) {
        console.error("Error saving pledge:", err.message);
        res.status(500).json({ error: "Failed to save pledge" });
      } else {
        console.log("Pledge saved with ID:", this.lastID);
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});


// Notify all connected clients
const notifyClients = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
};

app.get("/api/pledges/:walletAddress", (req, res) => {
  const walletAddress = req.params.walletAddress;

  db.get(`SELECT * FROM pledges WHERE wallet_address = ?`, [walletAddress], (err, row) => {
    if (err) {
      console.error("Error checking pledge:", err.message);
      res.status(500).json({ error: "Failed to check pledge." });
    } else if (row) {
      res.json({ pledged: true, data: row });
    } else {
      res.json({ pledged: false });
    }
  });
});



// API Endpoint for Pledges
app.post("/api/pledges", (req, res) => {
  const { name, message, walletAddress, signature } = req.body;

  try {
    console.log("Pledge received:", { name, message, walletAddress, signature });

    // Notify WebSocket clients of the new member
    notifyClients({ type: "new_member", data: { name } });

    res.status(201).json({ message: "Pledge saved successfully!" });
  } catch (error) {
    console.error("Error handling pledge:", error);
    res.status(500).json({ error: "Failed to handle pledge." });
  }
});

// Start the REST API Server
app.listen(5000, () => {
  console.log("REST API running on http://localhost:5000");
});
