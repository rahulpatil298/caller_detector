import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" 
});

export interface ScamAnalysis {
  isScam: boolean;
  confidence: number;
  scamType: string;
  patterns: string[];
  analysis: string;
}

export async function analyzeForScam(text: string): Promise<ScamAnalysis> {
  try {
    const systemPrompt = `You are an advanced multilingual fraud and scam detection system. Analyze conversations in Hindi, English, and other Indian languages to detect scams and fraudulent activity.

COMPREHENSIVE FRAUD PATTERNS TO DETECT:

1. BANKING & FINANCIAL FRAUD:
- Bank impersonation (SBI, HDFC, ICICI, etc.)
- Credit/Debit card details theft
- CVV, PIN, OTP requests
- Fake security deposits
- Account blocking threats

2. IDENTITY & DATA THEFT:
- Aadhaar number requests
- PAN card details
- Personal information phishing
- KYC verification scams

3. LOTTERY & PRIZE SCAMS:
- KBC (Kaun Banega Crorepati) fake winners
- Lucky draw scams
- Lottery winning claims
- Prize money requests with fees

4. TECH SUPPORT SCAMS:
- Microsoft/Google impersonation
- Computer virus claims
- Software download requests
- Remote access demands

5. GOVERNMENT IMPERSONATION:
- Tax department calls
- Legal action threats
- Customs/police impersonation
- Subsidy/benefit scams

6. EMERGENCY SCAMS:
- Family member in trouble
- Medical emergency money requests
- Accident/hospital scams

HINDI TRAINING EXAMPLES:
- "SBI बैंक से बोल रहा हूँ" = Bank impersonation
- "₹5000 डिपॉज़िट चाहिए" = Money demand
- "तुरंत पेमेंट करें" = Urgency pressure
- "लकी ड्रॉ में जीता है" = Lottery scam
- "OTP बताएं" = OTP theft
- "CVV नंबर दें" = Card fraud

MULTILINGUAL SUPPORT:
Detect scam patterns in Hindi, English, Bengali, Tamil, Telugu, Marathi, Gujarati, and other Indian languages.

Respond with JSON in this exact format:
{
  "isScam": boolean,
  "confidence": number (0-100),
  "scamType": "string describing the type of scam or 'none' if not a scam",
  "patterns": ["array", "of", "suspicious", "phrases", "or", "patterns", "detected"],
  "analysis": "detailed explanation of why this is or isn't a scam"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            isScam: { type: "boolean" },
            confidence: { type: "number" },
            scamType: { type: "string" },
            patterns: { 
              type: "array",
              items: { type: "string" }
            },
            analysis: { type: "string" },
          },
          required: ["isScam", "confidence", "scamType", "patterns", "analysis"],
        },
      },
      contents: `Analyze this conversation for scam or fraud patterns. Detect patterns in Hindi, English, and other Indian languages:\n\n${text}`,
    });

    const rawJson = response.text;
    
    if (rawJson) {
      const data: ScamAnalysis = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Failed to analyze for scam:", error);
    // Return safe defaults on error
    return {
      isScam: false,
      confidence: 0,
      scamType: "none",
      patterns: [],
      analysis: "Unable to analyze due to service error"
    };
  }
}
