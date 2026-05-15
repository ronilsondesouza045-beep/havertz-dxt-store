import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

async function getLatestNetflixCode() {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER || "ronilsondesouza045@gmail.com",
      pass: (process.env.EMAIL_PASS || "tnaz mqqb ufck rygd").replace(/\s+/g, ''),
    },
    logger: false,
  });

  try {
    await client.connect();
    let lock = await client.getMailboxLock("INBOX");
    try {
      // Search for emails in the last 10 minutes for better "real-time" feel
      let messages = await client.search({
        from: "info@account.netflix.com",
        since: new Date(Date.now() - 10 * 60 * 1000),
      });

      if (!messages || messages.length === 0) {
        messages = await client.search({
          subject: "Netflix",
          since: new Date(Date.now() - 10 * 60 * 1000),
        });
      }

      if (!messages || messages.length === 0) {
        return null;
      }

      // Get the latest message (highest ID)
      const lastMsgId = [...messages].sort((a, b) => Number(b) - Number(a))[0];
      let message = await client.fetchOne(lastMsgId, { source: true });
      
      if (!message || !message.source) {
        return null;
      }

      let parsed = await simpleParser(message.source);
      
      const content = parsed.text || "";
      const subject = parsed.subject || "";
      
      // Netflix codes are usually 4 digits for PIN or 6 digits for access
      // Pattern: "Seu código da Netflix é 123456" or similar
      const combined = (subject + " " + content).toLowerCase();
      
      // Look for 4 or 6 digit numbers that look like codes
      // Often surrounded by spaces or in the middle of text
      const codeMatch = combined.match(/\b\d{4}\b/) || combined.match(/\b\d{6}\b/);
      
      return codeMatch ? codeMatch[0] : null;

    } finally {
      lock.release();
    }
    await client.logout();
  } catch (err) {
    console.error("IMAP Error:", err);
    return null;
  }
}

app.get("/api/netflix-code", async (req, res) => {
  try {
    const code = await getLatestNetflixCode();
    if (code) {
      res.json({ code, timestamp: new Date().toISOString() });
    } else {
      res.status(404).json({ error: "No code found in the last hour" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to check email" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
