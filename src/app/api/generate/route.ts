import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

function getGroqClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function POST(req: NextRequest) {
  try {
    const { jsonInput, endpointInfo } = await req.json();

    if (!jsonInput || typeof jsonInput !== "string") {
      return NextResponse.json(
        { error: "jsonInput is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate JSON
    try {
      JSON.parse(jsonInput);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON provided" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert API documentation writer. Given a JSON API response (and optionally endpoint metadata), generate clean, professional API documentation in Markdown.

Include these sections:
1. **Endpoint** — method, path, and a one-line description
2. **Request** — if endpoint info is provided, describe expected request parameters/body
3. **Response Schema** — a table with Field, Type, and Description columns. Infer types from the JSON values. Provide meaningful descriptions for each field.
4. **Example Response** — the JSON formatted in a code block
5. **Example cURL** — a ready-to-use cURL command for the endpoint
6. **Error Responses** — 2-3 common error responses with status codes and example bodies

Rules:
- Infer sensible field descriptions from field names and values
- If the JSON is an array, document the array item schema
- Use standard HTTP status codes for error examples
- Keep descriptions concise but informative
- Format everything as clean Markdown`;

    const userPrompt = `Generate API documentation for the following:

${endpointInfo ? `**Endpoint Info:** ${endpointInfo}\n\n` : ""}**JSON Response:**
\`\`\`json
${jsonInput}
\`\`\``;

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const markdown = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ markdown });
  } catch (error: unknown) {
    console.error("Generate error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
