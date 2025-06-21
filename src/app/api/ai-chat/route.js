import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message } = await req.json();

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // or your deployed domain
          "X-Title": "WeatherScope AI Chatbot",
        },
        body: JSON.stringify({
          model: "google/gemini-pro-1.5", // ✅ correct model ID
          max_tokens: 512, // ✅ safe for free tier users
          messages: [
            {
              role: "system",
              content:
                "You are a friendly weather assistant chatbot. Answer questions about weather based on city names. If you are unsure, respond helpfully and politely.",
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    const result = await response.json();
    console.log(
      "🧠 OpenRouter/Gemini Response:",
      JSON.stringify(result, null, 2)
    );

    const reply = result?.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({
      reply: reply || "Gemini didn’t return a response. Please try rephrasing.",
    });
  } catch (err) {
    console.error("❌ Gemini API Error:", err);
    return NextResponse.json(
      { reply: "An error occurred while calling Gemini. Try again later." },
      { status: 500 }
    );
  }
}
