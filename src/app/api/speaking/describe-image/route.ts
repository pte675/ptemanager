import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error("Missing GROQ_API_KEY in environment variables");

const groq = new Groq({ apiKey });

export async function POST(req: NextRequest) {
  const { modelAnswer1, modelAnswer2, studentAnswer } = await req.json();

  const systemPrompt = `
You are an expert evaluator for the PTE speaking section, Describe Image task.
You will receive two model answers and one student answer.
Evaluate the student’s answer by comparing it with the two model answers for content, vocabulary, fluency, and coherence.

Return only JSON like:
{
  "score": "number from 1 to 5",
  "feedback": "a short paragraph giving constructive feedback"
}
`;
  console.log(modelAnswer1)
  console.log(modelAnswer2)
  console.log(studentAnswer)
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `Model Answer 1:\n${modelAnswer1}\n\nModel Answer 2:\n${modelAnswer2}\n\nStudent Answer:\n${studentAnswer}` 
        },
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