import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error("Missing GROQ_API_KEY in environment variables");

const groq = new Groq({ apiKey });

export async function POST(req: NextRequest) {
  const { prompt, response } = await req.json();

  const systemPrompt = `
You are an expert evaluator for the PTE Academic Writing section, specifically for "Write Essay" tasks.
Your job is to assess the student's essay based on four criteria: content, form, grammar, and vocabulary.

Return a JSON in this format:
{
  "score": "number from 1 to 5",
  "feedback": "a short paragraph with constructive feedback based on the four criteria (content relevance, structure, grammar, and vocabulary)"
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