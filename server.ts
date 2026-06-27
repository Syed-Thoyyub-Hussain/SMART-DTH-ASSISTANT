import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json());

// API endpoint to route welcome emails to Resend or custom SMTP configurations
app.post("/api/send-welcome", async (req, res) => {
  const { to, subject, htmlBody, customerName } = req.body;
  if (!to || !subject || !htmlBody) {
    return res.status(400).json({ error: "Missing required mail fields (to, subject, htmlBody)." });
  }

  // Identify active email-related secrets safely (only the keys, never the secret values!)
  const targetKeys = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'GEMINI_API_KEY'];
  const detectedSecrets = Object.keys(process.env).filter(k => 
    targetKeys.includes(k) && process.env[k] !== undefined && process.env[k] !== ""
  );

  console.log(`[Email Dispatcher] Attempting to send welcome mail to ${to}. Active key assets detected:`, detectedSecrets);

  // Option A: If SMTP credentials are provided, prefer SMTP for unrestricted sending
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser || "Raja Communications <welcome@rajacommunications.com>";

  if (smtpHost && smtpUser && smtpPass) {
    try {
      console.log(`[Email Dispatcher] Routing through custom SMTP host: ${smtpHost}:${smtpPort}`);
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for port 465, false for 587 or 25
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false // bypass custom certificate handshake issues
        }
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to,
        subject,
        html: htmlBody,
      });

      console.log("[Email Dispatcher] Mail delivered successfully via SMTP:", info.messageId);
      return res.json({ 
        success: true, 
        service: "SMTP", 
        messageId: info.messageId, 
        recipient: to, 
        detectedSecrets 
      });
    } catch (smtpErr: any) {
      console.error("[Email Dispatcher] SMTP dispatch failed:", smtpErr);
      return res.status(500).json({ 
        success: false, 
        error: `SMTP server rejection: ${smtpErr.message}`, 
        detectedSecrets 
      });
    }
  }

  // Option B: Fallback to Resend SDK/API if Resend API Key is defined
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const sender = process.env.RESEND_FROM_EMAIL || "Raja Communications <onboarding@resend.dev>";
      console.log(`[Email Dispatcher] Routing through Resend API connection (sender: ${sender})`);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: sender,
          to: [to],
          subject: subject,
          html: htmlBody
        })
      });

      const data = await response.json() as any;
      if (response.ok) {
        console.log(`[Email Dispatcher] Sent with Resend ID: ${data.id}`);
        return res.json({ 
          success: true, 
          service: "Resend", 
          messageId: data.id, 
          recipient: to, 
          detectedSecrets 
        });
      } else {
        console.error("[Email Dispatcher] Resend rejection payload:", data);
        return res.status(response.status).json({ 
          success: false, 
          error: data.message || "Failed sending email through Resend API",
          details: data,
          detectedSecrets 
        });
      }
    } catch (resendErr: any) {
      console.error("[Email Dispatcher] Resend API connection error:", resendErr);
      return res.status(500).json({ 
        success: false, 
        error: resendErr.message, 
        detectedSecrets 
      });
    }
  }

  // Option C: No active secrets are defined
  console.warn("[Email Dispatcher] No email credentials found in process environment.");
  return res.status(400).json({
    success: false,
    error: "Zero Email configurations found.",
    message: "Please configure either SMTP_HOST, SMTP_USER, SMTP_PASS (for unrestricted custom SMTP) or RESEND_API_KEY in the Settings Secrets menu.",
    detectedSecrets
  });
});

// Export the Express app for Vercel serverless integration
export default app;

// Guard listener so it only boots during standard dev or production server executions, bypassing Vercel serverless build/execution
if (!process.env.VERCEL) {
  const PORT = 3000;

  async function startServer() {
    // Vite middleware for development (or standard static serving for production)
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
}
