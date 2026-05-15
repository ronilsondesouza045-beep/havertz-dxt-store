import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";

dotenv.config();

export const app = express();
const PORT = 3000;

async function getLatestNetflixCode() {
  const user = process.env.EMAIL_USER || "souzaroni187@gmail.com";
  const pass = (process.env.EMAIL_PASS || "tnaz mqqb ufck rygd").replace(/\s+/g, '');

  console.log(`Tentando conectar ao Gmail para: ${user}`);

  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
    clientInfo: { name: "NetflixCodeBot", version: "1.0.0" }
  });

  try {
    await client.connect();
    console.log("Conectado ao IMAP com sucesso.");
    let lock = await client.getMailboxLock("INBOX");
    try {
      // Removemos o 'since' restrito para evitar erro de Timezone no Vercel
      // O Gmail às vezes falha se o Since for enviado de forma incompatível
      // Buscamos as últimas 10 mensagens e filtramos manualmente
      
      let messages = await client.search({
        or: [
          { from: "netflix.com" },
          { subject: "Netflix" }
        ]
      });

      if (!messages || messages.length === 0) {
        console.log("Nenhum e-mail da Netflix encontrado na busca geral.");
        return null;
      }

      // Ordenar por ID decrescente para pegar os mais novos
      const sortedIds = [...messages].sort((a, b) => Number(b) - Number(a)).slice(0, 5);
      
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
        
        // Tenta 6 dígitos
        let codeMatch = combined.match(/\b\d{6}\b/);
        
        // Tenta 4 dígitos se não achar 6
        if (!codeMatch) {
           codeMatch = combined.match(/\b\d{4}\b/);
        }
        
        // Tenta formatos com espaço (123 456)
        if (!codeMatch) {
           const spaceMatch = combined.match(/\b\d{3}\s\d{3}\b/);
           if (spaceMatch) {
             return { code: spaceMatch[0].replace(/\s/g, '') };
           }
        }

        if (codeMatch) {
           const result = codeMatch[0];
           // Filtra anos comuns
           if (result !== "2024" && result !== "2025" && result !== "2026") {
             return { code: result };
           }
        }
      }
      
      console.log("Nenhum código válido encontrado nos e-mails recentes.");
      return null;
    } finally {
      lock.release();
    }
  } catch (err: any) {
    console.error("IMAP Error Detail:", err.message);
    if (err.message.includes("Authentication failed")) return "AUTH_ERROR";
    return "CONN_ERROR";
  } finally {
    try { await client.logout(); } catch (e) {}
  }
}

// API routes FIRST
app.get("/api/netflix-code", async (req, res) => {
  try {
    const result = await getLatestNetflixCode();
    
    if (result && typeof result === 'object' && 'code' in result) {
      res.json({ code: result.code, timestamp: new Date().toISOString() });
    } else if (result === "AUTH_ERROR") {
      res.status(401).json({ 
        error: "Erro de autenticação no Gmail.", 
        message: "Certifique-se de usar uma 'Senha de App' e que o EMAIL_USER/EMAIL_PASS estão corretos no Vercel." 
      });
    } else if (result === "CONN_ERROR") {
      res.status(503).json({ 
        error: "Erro de conexão.", 
        message: "Não foi possível conectar ao servidor IMAP do Gmail. O Vercel pode estar bloqueando a conexão ou o Gmail bloqueou o IP." 
      });
    } else {
      res.status(404).json({ error: "Nenhum código encontrado nos últimos 60 minutos." });
    }
  } catch (error) {
    console.error("Endpoint Error:", error);
    res.status(500).json({ error: "Erro interno ao processar busca." });
  }
});

// Handling for development (AI Studio)
if (process.env.NODE_ENV !== "production") {
  async function setupVite() {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  setupVite();
}

export default app;
