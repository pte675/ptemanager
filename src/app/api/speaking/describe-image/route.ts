import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error("Missing GROQ_API_KEY in environment variables");

const groq = new Groq({ apiKey });

export async function POST(req: NextRequest) {
  const { modelAnswer1, modelAnswer2, studentAnswer } = await req.json();

  const systemPrompt = `
You are an expert evaluator for the PTE Describe Image task.

You will receive:
- Two model answers (not perfect, but help you identify the general topic of the image)
- One student answer (spoken-style transcript)

Step 1: Identify the general topic of the image from the model answers. For example: "internet population", "banana export", or "first aid".

Step 2: Check if the student answer **mentions anything relevant** to the topic. If it **loosely matches**, continue evaluating grammar and vocabulary. Do not penalize if it's not perfect.

Step 3: Evaluate grammar and vocabulary:
- Is sentence structure correct?
- Are words used appropriately?
- Is there good vocabulary variation?

Return only this JSON:
{
  "score": "number from 1 to 5",
  "feedback": "short constructive feedback"
}

Be generous with score if the topic is mentioned and grammar is reasonably clear.
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