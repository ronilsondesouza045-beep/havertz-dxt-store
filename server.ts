import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";

import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

// Load firebase config to get the correct projectId
let firebaseConfig: any = {};
try {
  const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
} catch (e) {
  console.error("Failed to load firebase-applet-config.json:", e);
}

// Lazy Load Firebase Admin
let _adminAuth: admin.auth.Auth | null = null;
function getAdminAuth() {
  if (!_adminAuth) {
    const projectId = firebaseConfig.projectId || process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0875766870";
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: projectId,
      });
    }
    _adminAuth = admin.auth();
  }
  return _adminAuth;
}

// Map to store last request timestamp per IP and User
const userCooldowns = new Map<string, number>();
const ipCooldowns = new Map<string, number>();
const COOLDOWN_TIME = 15 * 60 * 1000; // 15 minutes cooldown

export const app = express();
app.use(express.json());
const PORT = 3000;

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
    console.log("[NETFLIX-API] Conectado ao IMAP.");
    let lock = await client.getMailboxLock("INBOX");
    try {
      // Removemos o 'since' restrito para evitar erro de Timezone no Vercel
      // O Gmail às vezes falha se o Since for enviado de forma incompatível
      // Buscamos as últimas 10 mensagens e filtramos manualmente
      
      let messages = await client.search({
        or: [
          { from: "netflix.com" },
          { from: "mailer.netflix.com" },
          { from: "account.netflix.com" },
          { subject: "Netflix" },
          { subject: "código" }
        ]
      });

      if (!messages || messages.length === 0) {
        console.log("[NETFLIX-API] Nenhum e-mail encontrado na INBOX.");
        return null;
      }

      const results: { code: string; date: Date; score: number }[] = [];
      const limitedIds = [...messages].sort((a, b) => Number(b) - Number(a)).slice(0, 15);
      
      for (const msgId of limitedIds) {
        let message = await client.fetchOne(msgId, { source: true, envelope: true });
        if (!message || !message.source || !message.envelope) continue;

        const msgDate = new Date(message.envelope.date);
        const diffMinutes = (Date.now() - msgDate.getTime()) / (1000 * 60);
        
        if (diffMinutes > 15) continue; 

        let parsed = await simpleParser(message.source);
        const text = parsed.text || "";
        const subject = (parsed.subject || "").toLowerCase();
        const bodyContent = text.toLowerCase();
        
        const isCodeEmail = subject.includes("código") || subject.includes("code") || subject.includes("acesso") || subject.includes("pin");
        
        let code = null;
        
        const specificMatch = bodyContent.match(/(?:código|code|pin|acesso|entrar|seu código é|o código é|is)\s*(?::|—|-)?\s*(\d{6}|\d{3}\s\d{3}|\d{4})\b/i);
        
        if (specificMatch) {
            code = specificMatch[1].replace(/\s/g, '');
        } else {
            const allSix = bodyContent.match(/\b\d{6}\b/g) || [];
            for (const n of allSix) {
                if (!["2024", "2025", "2026"].includes(n)) {
                    code = n;
                    break;
                }
            }
            
            if (!code) {
                const allFour = bodyContent.match(/\b\d{4}\b/g) || [];
                for (const n of allFour) {
                    if (!["2024", "2025", "2026"].includes(n)) {
                        code = n;
                        break;
                    }
                }
            }
        }

        if (code) {
            const score = isCodeEmail ? 100 : 50;
            results.push({ code, date: msgDate, score });
        }
      }

      if (results.length > 0) {
        results.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.date.getTime() - a.date.getTime();
        });
        console.log(`[NETFLIX-API] Código localizado: ${results[0].code}`);
        return { code: results[0].code, receivedAt: results[0].date.toISOString() };
      }
      
      console.log("[NETFLIX-API] Nenhum código válido nos últimos e-mails.");
      return null;
    } finally {
      lock.release();
    }
  } catch (err: any) {
    console.error("[NETFLIX-API] Erro IMAP:", err.message);
    if (err.message.includes("Authentication failed") || err.message.includes("Invalid credentials")) return "AUTH_ERROR";
    if (err.message.includes("ETIMEDOUT") || err.message.includes("ECONNREFUSED")) return "CONN_ERROR";
    return "CONN_ERROR";
  } finally {
    try { await client.logout(); } catch (e) {}
  }
}

app.get("/api/netflix-code", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Identidade não confirmada.", message: "Você precisa estar logado para acessar o suporte Netflix." });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await getAdminAuth().verifyIdToken(idToken);
    } catch (e) {
      return res.status(401).json({ error: "Sessão expirada.", message: "Sua sessão expirou, faça login novamente." });
    }

    // Rate limiting: Strict check for both User UID and IP Address
    const userId = decodedToken.uid;
    const userIp = req.ip || "unknown-ip";
    const now = Date.now();
    
    const lastUserRequest = userCooldowns.get(userId) || 0;
    const lastIpRequest = ipCooldowns.get(userIp) || 0;

    const userTimeLeft = COOLDOWN_TIME - (now - lastUserRequest);
    const ipTimeLeft = COOLDOWN_TIME - (now - lastIpRequest);

    if (userTimeLeft > 0 || ipTimeLeft > 0) {
      const remainingSeconds = Math.ceil(Math.max(userTimeLeft, ipTimeLeft) / 1000);
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      
      return res.status(429).json({ 
        error: "Aguarde a Renovação.", 
        message: `Para evitar sobrecarga na conta, você só pode gerar um código a cada 15 minutos. Aguarde ${minutes > 0 ? `${minutes}m ` : ""}${seconds}s.` 
      });
    }

    const result = await getLatestNetflixCode();
    
    if (result && typeof result === 'object' && 'code' in result) {
      // Update cooldowns on success
      userCooldowns.set(userId, now);
      ipCooldowns.set(userIp, now);

      res.json({ 
        code: result.code, 
        receivedAt: result.receivedAt,
        now: new Date().toISOString() 
      });
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
      res.status(404).json({ error: "Nenhum código encontrado nos últimos 15 minutos." });
    }
  } catch (error) {
    console.error("Endpoint Error:", error);
    res.status(500).json({ error: "Erro interno ao processar busca." });
  }
});

async function startServer() {
  // Handling for development (AI Studio)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
