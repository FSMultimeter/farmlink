import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    const systemPrompt =
      "You are an agricultural assistant for farmers in Pakistan. Provide simple, practical advice about crop health, fertilizers, irrigation and pest management. Never invent facts. Recommend consulting agricultural experts for severe issues.";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\nFarmer's question: ${question}` }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data));

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ answer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
