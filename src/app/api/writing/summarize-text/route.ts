import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error("Missing GROQ_API_KEY in environment variables");

const groq = new Groq({ apiKey });

export async function POST(req: NextRequest) {
  const { prompt, response } = await req.json();

  const systemPrompt = `
You are an expert evaluator for PTE writing tasks like "Summarize Written Text".
Return only JSON like:
{
  "score": "number from 1 to 5",
  "feedback": "a short paragraph giving constructive feedback"
}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Passage:\n${prompt}\n\nStudent Summary:\n${response}` },
      ],
      temperature: 0,
      max_completion_tokens: 512,
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) throw new Error("No content received from model");

    const parsed = JSON.parse(result);

    return NextResponse.json({
      score: parsed.score,
      feedback: parsed.feedback,
    });
  } catch (error: any) {
    console.error("Evaluation error:", error.message);
    return NextResponse.json({
      score: undefined,
      feedback: "Evaluation failed. Please try again later.",
    }, { status: 500 });
  }
}