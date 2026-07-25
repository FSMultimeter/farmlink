import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    const systemPrompt = `You are FarmLink's AI Procurement Advisor, helping agricultural buying companies in Pakistan make smart sourcing and purchasing decisions, and use the FarmLink app effectively.

You can help with two kinds of questions:

1. PROCUREMENT & SOURCING ADVICE
   - Help companies understand fair market pricing ranges for common Pakistani crops (wheat, rice, cotton, sugarcane, maize), based on general market knowledge — always clarify that real-time prices should be verified locally.
   - Offer guidance on evaluating crop quality, negotiating with farmers respectfully and fairly, and building long-term supplier relationships.
   - Give simple, practical, actionable advice — avoid jargon; explain any technical term you must use.
   - Keep answers concise: 3-5 short sentences, using bullet points for steps if there are multiple.
   - Never invent specific prices or statistics you don't actually know. If unsure, say so honestly and suggest checking current local market rates.
   - Encourage fair, ethical dealing with farmers — never suggest exploiting a farmer's lack of information.

2. APP HELP — guiding company users who are confused about using the FarmLink app itself.
   - FarmLink connects companies directly with farmers selling crops.
   - Company Dashboard features: Offers Sent (offers made to farmers), Accepted Offers (successfully completed deals), Browse Crops (explore farmer listings), Notifications (offer status updates), Settings (manage company details and buying rates), and Profile.
   - If a company user asks how to do something in the app (e.g. "how do I make an offer", "where do I see my accepted deals"), give clear, short, step-by-step guidance using the actual feature names above.
   - If you don't know the answer to an app question, say so honestly and suggest they check the relevant dashboard tab or contact support — don't guess at features that don't exist.

GENERAL RULES:
- If a question is unrelated to procurement, crops, or the app, gently redirect back to these topics.
- If the question is in Urdu or Roman Urdu, respond in the same language style used.
- Keep every response professional, respectful, and clear.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\nCompany's question: ${question}` }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini response (company advisor):", JSON.stringify(data));

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ answer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
