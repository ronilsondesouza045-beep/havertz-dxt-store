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
      user: process.env.EMAIL_USER || "souzaroni187@gmail.com",
      pass: (process.env.EMAIL_PASS || "tnaz mqqb ufck rygd").replace(/\s+/g, ''),
    },
    logger: false,
  });

  try {
    await client.connect();
    let lock = await client.getMailboxLock("INBOX");
    try {
      // Search for emails in the last 60 minutes
      const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      let messages = await client.search({
        or: [
          { from: "info@account.netflix.com" },
          { from: "info@mailer.netflix.com" },
          { from: "netflix@netflix.com" },
          { subject: "Netflix" },
          { body: "seu código de acesso" }
        ],
        since: sixtyMinutesAgo,
      });

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
      
      const text = parsed.text || "";
      const html = parsed.html || "";
      const subject = parsed.subject || "";
      
      // Netflix codes are usually 4 digits for PIN or 6 digits for access
      const combined = (subject + " " + text + " " + html).toLowerCase();
      
      // Look for 4 or 6 digit numbers. 
      // We avoid catching years like 2024, 2025 by checking the context or just taking the most likely one.
      // Usually the code is prominently displayed.
      
      // Try to find 6 consecutive digits first (common for sign-in)
      let codeMatch = combined.match(/\b\d{6}\b/);
      
      // If not found, try 4 digits (common for PIN)
      if (!codeMatch) {
         codeMatch = combined.match(/\b\d{4}\b/);
      }
      
      // If still not found, search for codes with a space in the middle like "123 456"
      if (!codeMatch) {
         const spaceMatch = combined.match(/\b\d{3}\s\d{3}\b/);
         if (spaceMatch) {
           return spaceMatch[0].replace(/\s/g, '');
         }
      }

      // Check if the found code is a year (loose filter)
      if (codeMatch && (codeMatch[0] === "2024" || codeMatch[0] === "2025" || codeMatch[0] === "2026")) {
        // Look for another one if this is just the year
        const matches = combined.matchAll(/\b\d{4}\b/g);
        for (const m of matches) {
          if (m[0] !== "2024" && m[0] !== "2025" && m[0] !== "2026") {
            return m[0];
          }
        }
      }
      
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
