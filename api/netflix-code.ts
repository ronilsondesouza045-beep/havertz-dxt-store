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
          { from: "mailer.netflix.com" },
          { from: "account.netflix.com" },
          { subject: "Netflix" },
          { subject: "código" }
        ]
      });

      if (!messages || messages.length === 0) return null;

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
        
        // Prioridade 1: Assunto diz que é um código
        const isCodeEmail = subject.includes("código") || subject.includes("code") || subject.includes("acesso") || subject.includes("pin");
        
        // Tenta encontrar o código perto de palavras-chave no corpo da mensagem
        // Netflix geralmente envia: "Seu código é 123456" ou "Your code is 123 456"
        let code = null;
        
        // Regex para capturar números de 4 ou 6 dígitos que apareçam após palavras de "código"
        const specificMatch = bodyContent.match(/(?:código|code|pin|acesso|entrar|seu código é|o código é|is)\s*(?::|—|-)?\s*(\d{6}|\d{3}\s\d{3}|\d{4})\b/i);
        
        if (specificMatch) {
            code = specificMatch[1].replace(/\s/g, '');
        } else {
            // Se não achou com palavra-chave, tenta pegar o primeiro número de 6 dígitos que NÃO é um ano
            const allSix = bodyContent.match(/\b\d{6}\b/g) || [];
            for (const n of allSix) {
                if (!["2024", "2025", "2026"].includes(n)) {
                    code = n;
                    break;
                }
            }
            
            // Se ainda não achou, tenta 4 dígitos (PIN)
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
            // Se o e-mail tem "código" no assunto, esse ganha pontuação máxima na decisão
            const score = isCodeEmail ? 100 : 50;
            results.push({ code, date: msgDate, score });
        }
      }

      if (results.length > 0) {
        // Ordena por Score (e-mail de código primeiro) e depois por Data (mais recente)
        results.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.date.getTime() - a.date.getTime();
        });
        return { code: results[0].code, receivedAt: results[0].date.toISOString() };
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
      return res.status(200).json({ 
        code: result.code, 
        receivedAt: result.receivedAt,
        now: new Date().toISOString() 
      });
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
