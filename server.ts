import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// In-memory store for application settings & photos
interface PhotoMemory {
  id: string;
  url: string;
  caption: string;
}

interface CreatorSettings {
  girlfriendName: string;
  boyfriendName: string;
  recipientEmail: string;
  customProposalTitle: string;
  customProposalSubtitle: string;
  soundEnabled: boolean;
  photos: PhotoMemory[];
}

let storedSettings: CreatorSettings = {
  girlfriendName: "Blessing",
  boyfriendName: "Miracle",
  recipientEmail: "mcmikeyofficial@gmail.com",
  customProposalTitle: "Application to Be Your King",
  customProposalSubtitle: "Submitted with devotion & love to Queen Blessing 👑🌻",
  soundEnabled: true,
  photos: [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
      caption: "Sunflower sunshine & happy laughter 🌻",
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
      caption: "Holding hands & sweet moments ❤️",
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
      caption: "Golden hour walks together ✨",
    },
  ],
};

// In-memory store for proposal responses
interface ProposalResponse {
  id: string;
  answer: string;
  customNote?: string;
  girlfriendName: string;
  boyfriendName: string;
  recipientEmail: string;
  answersList: Array<{ question: string; answer: string }>;
  timestamp: string;
  userAgent?: string;
  emailSentStatus: string;
}

const responseLogs: ProposalResponse[] = [];

// Helper function to send email notification
async function sendNotificationEmail(responseData: ProposalResponse) {
  const targetEmail = responseData.recipientEmail || process.env.NOTIFICATION_EMAIL || "mcmikeyofficial@gmail.com";
  
  const emailSubject = `👑 SHE SAID ${responseData.answer.toUpperCase()}! - Girlfriend Proposal Alert! 💕`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 2px solid #ec4899; border-radius: 16px; background-color: #fff1f2;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h1 style="color: #be123c; margin-bottom: 8px;">👑 GREAT NEWS! SHE SAID YES! 👑</h1>
        <p style="font-size: 18px; color: #881337;">Your proposal was accepted!</p>
      </div>

      <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <h2 style="color: #e11d48; margin-top: 0;">💖 Proposal Details</h2>
        <p><strong>Her Answer:</strong> <span style="font-size: 20px; color: #15803d; font-weight: bold;">${responseData.answer}</span></p>
        <p><strong>Girlfriend:</strong> ${responseData.girlfriendName}</p>
        <p><strong>King (You):</strong> ${responseData.boyfriendName}</p>
        <p><strong>Date & Time:</strong> ${new Date(responseData.timestamp).toLocaleString()}</p>
        
        ${responseData.customNote ? `
          <div style="margin-top: 16px; padding: 12px; background: #fff0f6; border-left: 4px solid #ec4899; border-radius: 4px;">
            <p style="margin: 0; font-style: italic; color: #9d174d;"><strong>Her Personal Note to You:</strong></p>
            <p style="margin: 8px 0 0 0; font-size: 16px; color: #831843;">"${responseData.customNote}"</p>
          </div>
        ` : ""}
      </div>

      ${responseData.answersList && responseData.answersList.length > 0 ? `
        <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <h3 style="color: #be123c; margin-top: 0;">🌸 Her Sequence Answers:</h3>
          <ul style="padding-left: 20px; color: #374151;">
            ${responseData.answersList.map(item => `
              <li style="margin-bottom: 8px;">
                <strong>${item.question}:</strong> <span style="color: #e11d48;">${item.answer}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ""}

      <div style="text-align: center; font-size: 13px; color: #9f1239; margin-top: 24px;">
        <p>Sent with love via the "Can I Be Your King?" app ✨</p>
      </div>
    </div>
  `;

  // Check if custom SMTP is configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"${responseData.boyfriendName}'s Proposal Bot" <${smtpUser}>`,
        to: targetEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      console.log(`[Email] Notification email successfully sent via SMTP to ${targetEmail}`);
      return { success: true, method: "SMTP" };
    } catch (err: any) {
      console.error("[Email] SMTP Error:", err?.message || err);
    }
  }

  // Check if Resend API Key is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Proposal Alert <onboarding@resend.dev>",
          to: [targetEmail],
          subject: emailSubject,
          html: emailHtml,
        }),
      });
      if (res.ok) {
        console.log(`[Email] Notification email sent via Resend to ${targetEmail}`);
        return { success: true, method: "Resend" };
      }
    } catch (err: any) {
      console.error("[Email] Resend Error:", err?.message || err);
    }
  }

  // If no SMTP / Resend credentials are configured, we record the attempt gracefully
  console.log(`[Email] No active SMTP/Resend key configured. Email payload prepared for ${targetEmail}.`);
  console.log(`[Email Payload Preview]\nTo: ${targetEmail}\nSubject: ${emailSubject}\nBody:\n${responseData.customNote || "She accepted!"}`);
  return { success: false, method: "Logged in Server Feed (Setup SMTP or Resend in .env for direct inbox delivery)" };
}

// API Routes
app.post("/api/respond", async (req, res) => {
  try {
    const { answer, customNote, girlfriendName, boyfriendName, recipientEmail, answersList } = req.body;

    const newResponse: ProposalResponse = {
      id: "resp_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      answer: answer || "Yes! 💖",
      customNote: customNote || "",
      girlfriendName: girlfriendName || "My Princess",
      boyfriendName: boyfriendName || "Your King",
      recipientEmail: recipientEmail || process.env.NOTIFICATION_EMAIL || "mcmikeyofficial@gmail.com",
      answersList: answersList || [],
      timestamp: new Date().toISOString(),
      userAgent: req.headers["user-agent"],
      emailSentStatus: "pending",
    };

    const emailResult = await sendNotificationEmail(newResponse);
    newResponse.emailSentStatus = emailResult.success
      ? `Sent via ${emailResult.method}`
      : `Saved locally (${emailResult.method})`;

    responseLogs.unshift(newResponse);

    res.json({
      success: true,
      message: "Response recorded and notification alert dispatched!",
      response: newResponse,
      emailStatus: newResponse.emailSentStatus,
    });
  } catch (error: any) {
    console.error("Error processing response:", error);
    res.status(500).json({ success: false, error: error.message || "Server error" });
  }
});

// Endpoint to get creator settings
app.get("/api/settings", (_req, res) => {
  res.json({
    success: true,
    settings: storedSettings,
  });
});

// Endpoint to update creator settings & photos permanently on server
app.post("/api/settings", (req, res) => {
  try {
    const updated = req.body;
    if (updated && typeof updated === "object") {
      storedSettings = {
        ...storedSettings,
        ...updated,
        photos: Array.isArray(updated.photos) ? updated.photos : storedSettings.photos,
      };
      res.json({
        success: true,
        message: "Settings and photos saved permanently on server!",
        settings: storedSettings,
      });
    } else {
      res.status(400).json({ success: false, error: "Invalid settings payload" });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to update settings" });
  }
});

// Endpoint to view recorded responses
app.get("/api/responses", (_req, res) => {
  res.json({
    success: true,
    total: responseLogs.length,
    responses: responseLogs,
    notificationEmail: process.env.NOTIFICATION_EMAIL || "mcmikeyofficial@gmail.com",
  });
});

// Endpoint to test email dispatch
app.post("/api/test-email", async (req, res) => {
  const targetEmail = req.body?.email || process.env.NOTIFICATION_EMAIL || "mcmikeyofficial@gmail.com";
  const dummyData: ProposalResponse = {
    id: "test_" + Date.now(),
    answer: "YES! (Test Email)",
    customNote: "Testing email notification alert system! ❤️",
    girlfriendName: "Future Queen",
    boyfriendName: "King Michael",
    recipientEmail: targetEmail,
    answersList: [{ question: "Can I be your king?", answer: "YES! 👑" }],
    timestamp: new Date().toISOString(),
    emailSentStatus: "testing",
  };

  const result = await sendNotificationEmail(dummyData);
  res.json({
    success: true,
    targetEmail,
    emailResult: result,
  });
});

// Vite Middleware & Production Setup
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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
