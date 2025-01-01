const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

const dbFilePath = "/opt/render/project/src/TCA/crypto_army.db";
const localDbPath = path.join(__dirname, dbFilePath);
const app = express();

// Initialize SQLite Database
const db = new sqlite3.Database(dbFilePath);

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

// Notify all connected clients
const notifyClients = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
};

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date(),
  });
});

// Backup Endpoint
app.post("/api/backup", (req, res) => {
  exec("bash upload-db.sh", (error, stdout, stderr) => {
    if (error) {
      console.error(`Backup script error: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
      return;
    }
    console.log(`Backup script output: ${stdout}`);
    res.json({ success: true, message: "Backup completed successfully!" });
  });
});

// Watch .db file for changes and trigger upload
fs.watch(localDbPath, (eventType, filename) => {
  if (eventType === "change") {
    console.log(`Detected change in ${filename}. Uploading updated .db file...`);
    exec("bash upload-db.sh", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error uploading .db file: ${error.message}`);
        return;
      }
      console.log(`Successfully uploaded updated .db file: ${stdout}`);
    });
  }
});

// Download .db file on startup
const downloadDb = () => {
  console.log("Checking for remote .db file...");
  exec("bash download-db.sh", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error downloading .db file: ${error.message}`);
      return;
    }
    console.log(`Downloaded .db file: ${stdout}`);
  });
};
downloadDb();

// REST API Endpoints
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
        notifyClients({ type: "new_member", data: { name } });
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

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

// Start the REST API Server
app.listen(5000, () => {
  console.log("REST API running on http://localhost:5000");
});
