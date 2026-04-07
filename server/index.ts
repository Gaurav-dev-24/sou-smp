import express from "express";
import helmet from "helmet";
import { createTransport } from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config(); // initial load

const app = express();
app.use(helmet());
const PORT = process.env.PORT || 3001;

// Simple in-memory rate limiter: 5 requests per 15 minutes per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }
  if (entry.count >= 100) {
    res.status(429).json({ error: "Too many requests, please try again later." });
    return;
  }
  entry.count++;
  next();
}

// Middleware
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"] }));
app.use(express.json());

// Global request logger
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Media Proxy to mask external domains in DevTools
app.get("/api/media", async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) return res.status(400).send("URL is required");

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Fetch failed");
    
    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    res.status(404).send("Not found");
  }
});

// Rate limiting applied to the email and chat endpoint
app.use("/api/send-email", rateLimiter);
app.use("/api/chat", rateLimiter);


// POST /api/chat - AI Chat Assistant with Ollama
app.post("/api/chat", async (req: express.Request, res: express.Response) => {
  const { message } = req.body;
  console.log(`[Chat] Received: "${message}"`);

  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  try {
    // 1. Load knowledge.json
    const knowledgePath = path.join(process.cwd(), "knowledge.json");
    if (!fs.existsSync(knowledgePath)) {
      console.warn("knowledge.json not found");
      res.json({ reply: "I'm sorry, I don't have access to my knowledge base right now." });
      return;
    }

    let entries = [];
    try {
      const info = fs.readFileSync(knowledgePath, "utf-8");
      if (info.trim()) {
        const knowledgeData = JSON.parse(info);
        entries = knowledgeData.entries || (Array.isArray(knowledgeData) ? knowledgeData : []);
      }
    } catch (e) {
      console.error("Error parsing knowledge.json:", e);
    }

    if (entries.length === 0) {
      res.json({ reply: "I don't have any specific information about that yet. Please contact our team!" });
      return;
    }

    // 2. Direct MATCH Logic from knowledge.json to speed up response times
    const msgLower = message.toLowerCase().trim();
    const rawWords = msgLower.replace(/[^\w\s]/g, '').split(/\s+/);

    // Stopwords to ignore for lexical match so we don't accidentally trigger on "who are you"
    const stopWords = new Set([
      "what", "is", "the", "a", "an", "are", "of", "to", "in", "for", "on", "with",
      "as", "by", "at", "you", "who", "how", "can", "i", "do", "we", "us", "me", "my", "your"
    ]);
    const words = rawWords.filter((w: string) => w.length >= 2 && !stopWords.has(w));

    const scoredEntries = entries.map((entry: any) => {
      let score = 0;
      const qLower = (entry.question || "").toLowerCase();
      const aLower = (entry.answer || "").toLowerCase();

      const qPlain = qLower.replace(/[^\w\s]/g, '').trim();
      const msgPlain = msgLower.replace(/[^\w\s]/g, '').trim();

      // Exact substring match for the question gets a massive score boost
      if (qPlain && msgPlain && (msgPlain.includes(qPlain) || qPlain.includes(msgPlain))) {
        score += 20;
      }

      words.forEach((word: string) => {
        const regex = new RegExp('\\b' + word + '\\b', 'i');
        if (regex.test(qLower)) score += 3;
        else if (regex.test(aLower)) score += 1;
      });

      return { ...entry, score };
    });

    const topMatches = scoredEntries
      .sort((a: any, b: any) => b.score - a.score);

    // If we have a confident match (score >= 3 means at least one meaningful word matched the question), use it.
    if (topMatches.length > 0 && topMatches[0].score >= 3) {
      console.log(`[Chat] Found direct match with score ${topMatches[0].score}.`);
      res.json({ reply: topMatches[0].answer });
      return;
    }

    // 3. Default fallback if no match is found (User explicitly requested to bypass LLM and use a default reply)
    res.json({ reply: "I'm sorry, I don't have the exact answer to that specific question right now.\n\nHere are some quick links that might help:\n• [About IEEE SOU SB](/about)\n• [Contact Our Team](/contact)\n• [Upcoming Events](/events)" });
  } catch (error) {
    console.error("Chat system error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// POST /api/send-email
app.post("/api/send-email", async (req: express.Request, res: express.Response) => {
  // Force reload .env file values dynamically per request
  dotenv.config({ override: true });

  const dynamicMailConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    to: process.env.MAIL_TO || "",
  };

  const transporter = createTransport({
    host: dynamicMailConfig.host,
    port: dynamicMailConfig.port,
    secure: dynamicMailConfig.port === 465,
    auth: {
      user: dynamicMailConfig.user,
      pass: dynamicMailConfig.pass,
    },
  });

  const { name, email, phone, message, page, fields } = req.body;

  try {
    // Basic validation
    if (!name || !email) {
      res.status(400).json({ error: "Name and email are required." });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email address." });
      return;
    }
    if (!dynamicMailConfig.to) {
      res.status(500).json({ error: "Mail recipient is not configured." });
      return;
    }

    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const subject =
      page === "Join"
        ? "New Join Request — IEEE SOU SB"
        : "New Contact Form Submission — IEEE SOU SB";

    // Build email body
    let bodyRows = `
      <tr><td><b>Name</b></td><td>${name}</td></tr>
      <tr><td><b>Email</b></td><td>${email}</td></tr>
      <tr><td><b>Phone</b></td><td>${phone || "—"}</td></tr>
    `;

    // Extra fields from Join form
    if (fields) {
      Object.entries(fields).forEach(([key, value]) => {
        bodyRows += `<tr><td><b>${key}</b></td><td>${value || "—"}</td></tr>`;
      });
    }

    if (message) {
      bodyRows += `<tr><td><b>Message</b></td><td>${message}</td></tr>`;
    }

    bodyRows += `
      <tr><td><b>Page</b></td><td>${page || "Contact"}</td></tr>
      <tr><td><b>Timestamp</b></td><td>${timestamp}</td></tr>
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: #003087; padding: 20px 24px;">
          <h2 style="color: white; margin: 0; font-size: 18px;">IEEE SOU SB — ${subject}</h2>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tbody style="line-height: 2;">
              ${bodyRows}
            </tbody>
          </table>
        </div>
        <div style="background: #f3f4f6; padding: 12px 24px; font-size: 12px; color: #6b7280;">
          This email was automatically generated by the IEEE SOU SB website.
        </div>
      </div>
    `;

    console.log("Sending email from:", dynamicMailConfig.user, "to:", dynamicMailConfig.to);
    await transporter.sendMail({
      from: `"IEEE SOU SB Website" <${dynamicMailConfig.user}>`,
      to: dynamicMailConfig.to,
      replyTo: email,
      subject,
      html,
    });
    res.status(200).json({ success: true, message: "Email sent successfully." });
  } catch (err: any) {
    console.error("Email send error:", err.message || err);
    res.status(500).json({ error: err.message || "Failed to send email. Please try again." });
  }
});

// POST /api/upload - Generic upload endpoint for file uploads
app.post("/api/upload", async (req: express.Request, res: express.Response) => {
  try {
    console.log("Upload endpoint called with body:", req.body);

    // If this is a file upload, you would typically use multer or similar middleware
    // For now, we'll handle it as a generic endpoint that can be extended later

    // Basic validation
    if (!req.body) {
      res.status(400).json({ error: "No data provided for upload." });
      return;
    }

    // For now, just return a success response
    // In a real implementation, you would:
    // 1. Handle file uploads with multer
    // 2. Validate file types and sizes
    // 3. Store files in cloud storage (AWS S3, Google Cloud, etc.)
    // 4. Return the file URL

    res.status(200).json({
      success: true,
      message: "Upload endpoint is ready. Please implement file handling with multer middleware.",
      data: req.body
    });
  } catch (err: any) {
    console.error("Upload error:", err.message || err);
    res.status(500).json({ error: err.message || "Failed to process upload. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Email & AI Chat server running on http://localhost:${PORT}`);
});
