import express from "express";
import cors from "cors";
import type { Server } from "http";

const app = express();
app.use(express.json());
app.use(cors());

// Test endpoints
app.get("/test/success", (req, res) => {
  res.json({ success: true });
});

app.post("/test/echo", (req, res) => {
  res.json(req.body);
});

app.get("/test/error", (req, res) => {
  res.status(500).json({ error: "Server Error" });
});

app.get("/test/delayed", (req, res) => {
  setTimeout(() => {
    res.json({ delayed: true });
  }, 1000);
});

let server: Server;

export function startServer(port: number = 3333) {
  return new Promise<void>((resolve) => {
    server = app.listen(port, () => {
      console.log(`Test server running on port ${port}`);
      resolve();
    });
  });
}

export function stopServer() {
  return new Promise<void>((resolve, reject) => {
    if (server) {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
}
