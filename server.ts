import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// In-memory data store for the live session
const quotesStore: any[] = [
  {
    id: "q-1",
    name: "Aarav Sharma",
    phone: "+91 98111 22334",
    email: "aarav.sharma@example.com",
    age: 35,
    coverage: 15000000,
    planType: "Term Life Insurance",
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: "quote_generated",
    aiSummary: "Recommended high life cover of 1.5 Cr with low premium for active earning years. Tax benefit under 80C suggested."
  },
  {
    id: "q-2",
    name: "Priyanka Patel",
    phone: "+91 97222 33445",
    email: "priyanka.patel@example.com",
    age: 28,
    coverage: 5000000,
    planType: "Child Education plan",
    submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "pending",
  }
];

const consultationsStore: any[] = [];

// Lazy initialize Gemini client safely
let aiClient: any = null;

function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured or placeholder detected. Falling back to local simulation mode.");
      return null;
    }
    try {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    } catch (err) {
      console.error("Error creating GoogleGenAI class client:", err);
      return null;
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log all requests for debugging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Endpoints: Quotes Engine
  app.get("/api/quotes", (req, res) => {
    res.json({ success: true, count: quotesStore.length, data: quotesStore });
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const { name, phone, email, age, coverage, planType } = req.body;
      if (!name || !phone || !email) {
        return res.status(400).json({ success: false, error: "Missing required details: name, phone, email are mandatory." });
      }

      const parsedAge = parseInt(age) || 30;
      const parsedCoverage = parseInt(coverage) || 10000000;

      // Mock instant premium suggestion
      const baseRate = 450 * (parsedCoverage / 10000000);
      const ageFactor = Math.pow(1.05, Math.max(0, parsedAge - 18));
      const estimatedMonthly = Math.round(baseRate * ageFactor);

      // Generate localized professional tips using Gemini if key is setup
      let systemAiSummary = `Calculated initial monthly premium of ₹${estimatedMonthly.toLocaleString('en-IN')} for ₹${(parsedCoverage/10000000).toFixed(1)} Cr cover. Key advise: Secure term plans early to lock in lower rates.`;

      const genAI = getGeminiClient();
      if (genAI) {
        try {
          const aiResponse = await genAI.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `Generate a single short professional advice paragraph (under 80 words) for a client named ${name}, aged ${parsedAge}, requesting a ${planType} with coverage of ₹${parsedCoverage.toLocaleString('en-IN')}. Focus on saving benefits, retirement planning, or family security depending on plan. Be polite, encouraging, and mention that K Premium Advisor will follow up with exact LIC quotes.`,
            config: {
              systemInstruction: "You are a professional Certified LIC Premium Advisor assistant. Give direct, insightful insurance advice to Indian customers."
            }
          });
          if (aiResponse.text) {
            systemAiSummary = aiResponse.text.trim();
          }
        } catch (e) {
          console.warn("Failed to generate AI advice with Gemini, using standard advice fallback:", e);
        }
      }

      const newQuote = {
        id: `q-${Date.now()}`,
        name,
        phone,
        email,
        age: parsedAge,
        coverage: parsedCoverage,
        planType: planType || "Term Life Insurance",
        submittedAt: new Date().toISOString(),
        status: "quote_generated",
        aiSummary: systemAiSummary,
        estimatedMonthly
      };

      quotesStore.unshift(newQuote);
      res.json({ success: true, data: newQuote });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Endpoints: Consultation Request Scheduler
  app.get("/api/consultations", (req, res) => {
    res.json({ success: true, count: consultationsStore.length, data: consultationsStore });
  });

  app.post("/api/consultations", (req, res) => {
    const { name, phone, email, preferredDate, preferredTimeSlot, message } = req.body;
    if (!name || !phone || !email || !preferredDate || !preferredTimeSlot) {
      return res.status(400).json({ success: false, error: "Missing scheduling details: name, phone, email, date and time slot are required." });
    }

    const newConsultation = {
      id: `c-${Date.now()}`,
      name,
      phone,
      email,
      preferredDate,
      preferredTimeSlot,
      message: message || "No custom notes",
      submittedAt: new Date().toISOString()
    };

    consultationsStore.unshift(newConsultation);
    res.json({ success: true, data: newConsultation });
  });

  // Endpoints: Interactive Gemini Chat Helper
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ success: false, error: "Empty message payload received." });
      }

      const genAI = getGeminiClient();
      
      // Format chat history correctly for Gemini format
      // Gemini expects format { role: 'user' | 'model', parts: [{ text: '...' }] }
      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      if (genAI) {
        try {
          const chat = genAI.chats.create({
            model: "gemini-3.5-flash",
            history: formattedHistory,
            config: {
              systemInstruction: `You are 'K Premium Advisor AI Companion', a highly professional, polite, and knowledgeable personal financial planner and insurance expert in India. You represent Kushwaha Ketan (a certified elite LIC advisor). 
Your tone should be warm, wise, reassuring, and completely truthful.
Help users understand different options:
1. Term Insurance: High cover, low cost, pure risk protection.
2. Child Education: Security for education milestones and marriage.
3. Retirement Plans: Long term stress-free cash flow with guaranteed pension options.
4. Savings & Investment: Wealth growth coupled with tax benefits under section 80C.
Guide them carefully, offer to schedule consultations, and keep answers concise and easy to read. Refuse politely to advise on topics outside finance/insurance.`
            }
          });

          const response = await chat.sendMessage({ message });
          return res.json({ success: true, reply: response.text });
        } catch (chatError: any) {
          console.error("Gemini Live Chat Error:", chatError);
          return res.json({ 
            success: true, 
            reply: "I am experiencing high demand at the moment, but let me guide you: Securing a robust Term Plan with at least 15-20x annual income coverage is the modern standard for secure households. I highly recommend scheduler booking to get custom quotes. How can I help you regarding other plans?" 
          });
        }
      } else {
        // Fallback simulation mode
        const lowerMsg = message.toLowerCase();
        let simulatedReply = "Thank you for reaching out! To secure your family's future, we recommend locking in Term Insurance early. Lower ages get much lower premium rates. May I know your age and current budget so I can suggest specific LIC schemes?";
        
        if (lowerMsg.includes("term") || lowerMsg.includes("life")) {
          simulatedReply = "Term Insurance is a pure protection plan with zero maturity returns but the highest possible sum assured at the lowest price (e.g. ₹1 Crore life cover can cost less than ₹800/month if started early). It secures your nominees completely. Would you like us to generate custom quotes?";
        } else if (lowerMsg.includes("child") || lowerMsg.includes("education") || lowerMsg.includes("kid")) {
          simulatedReply = "LIC's Child Education plans are excellent for creating a guaranteed fund for your child's college degree or wedding. Even if anything unfortunate happens to parents, LIC waives future premiums and guarantees payouts on milestones. Shall we calculate a specific premium for your child?";
        } else if (lowerMsg.includes("retire") || lowerMsg.includes("pension") || lowerMsg.includes("elderly")) {
          simulatedReply = "Secure your post-retirement life with LIC Pension plans which offer immediate or deferred annuity options with sovereign protection. This ensures a steady monthly income that you cannot outlive. Would you like a projection for your desired monthly pension?";
        } else if (lowerMsg.includes("tax") || lowerMsg.includes("savings") || lowerMsg.includes("exempt")) {
          simulatedReply = "Most LIC savings and life insurance premium payments are fully exempt under Section 80C of the Income Tax Act up to ₹1.5 Lakhs annually, and maturity claims are completely tax-free under section 10(10D). It offers high-safety guaranteed returns.";
        }
        
        return res.json({ success: true, reply: simulatedReply });
      }
    } catch (err: any) {
      console.error("Critical API error in /api/chat:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Serve static assets or mount Vite handler
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
    console.log(`[LIC Premium Advisor] Server running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
