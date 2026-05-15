import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";

dotenv.config();

async function getLatestNetflixCode() {
  const user = (process.env.EMAIL_USER || "souzaroni187@gmail.com").trim();
  const pass = (process.env.EMAIL_PASS || "tnaz mqqb ufck rygd").replace(/\s+/g, '');

  console.log(`[NETFLIX-API] Buscando e-mail: ${user}`);

  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
    clientInfo: { name: "NetflixCodeBot", version: "1.0.0" },
    greetingTimeout: 5000,
    connectionTimeout: 10000
  });

  try {
    await client.connect();
    let lock = await client.getMailboxLock("INBOX");
    try {
      let messages = await client.search({
        or: [
          { from: "netflix.com" },
          { from: "info@account.netflix.com" },
          { subject: "Netflix" }
        ]
      });

      if (!messages || messages.length === 0) return null;

      const sortedIds = [...messages].sort((a, b) => Number(b) - Number(a)).slice(0, 10);
      
      for (const msgId of sortedIds) {
        let message = await client.fetchOne(msgId, { source: true, envelope: true });
        if (!message || !message.source) continue;

        const msgDate = new Date(message.envelope.date);
        const diffMinutes = (Date.now() - msgDate.getTime()) / (1000 * 60);
        if (diffMinutes > 60) continue; 

        let parsed = await simpleParser(message.source);
        const text = parsed.text || "";
        const html = parsed.html || "";
        const subject = parsed.subject || "";
        const combined = (subject + " " + text + " " + html).toLowerCase();
        
        let codeMatch = combined.match(/\b\d{6}\b/);
        if (!codeMatch) codeMatch = combined.match(/\b\d{4}\b/);
        
        if (!codeMatch) {
           const spaceMatch = combined.match(/\b\d{3}\s\d{3}\b/);
           if (spaceMatch) return { code: spaceMatch[0].replace(/\s/g, '') };
        }

        if (codeMatch) {
           const result = codeMatch[0];
           if (result !== "2024" && result !== "2025" && result !== "2026") return { code: result };
        }
      }
      return null;
    } finally {
      lock.release();
    }
  } catch (err: any) {
    if (err.message.includes("Authentication failed") || err.message.includes("Invalid credentials")) return "AUTH_ERROR";
    return "CONN_ERROR";
  } finally {
    try { await client.logout(); } catch (e) {}
  }
}

export default async function handler(req: any, res: any) {
  // Configurar CORS se necessário, mas como está na mesma origem no Vercel, não precisa
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await getLatestNetflixCode();
    
    if (result && typeof result === 'object' && 'code' in result) {
      return res.status(200).json({ code: result.code, timestamp: new Date().toISOString() });
    } else if (result === "AUTH_ERROR") {
      return res.status(401).json({ error: "Erro de autenticação no Gmail." });
    } else if (result === "CONN_ERROR") {
      return res.status(503).json({ error: "Erro de conexão com o Gmail." });
    } else {
      return res.status(404).json({ error: "Nenhum código encontrado." });
    }
  } catch (error) {
    console.error("Vercel Function Error:", error);
    return res.status(500).json({ error: "Erro interno." });
  }
}
