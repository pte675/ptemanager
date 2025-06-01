import { Groq } from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const apiKey = process.env.GROQ_API_KEY
if (!apiKey) throw new Error("Missing GROQ_API_KEY in environment variables")

const groq = new Groq({ apiKey })

export async function POST(req: NextRequest) {
  try {
    const { transcript, response } = await req.json()

    if (!transcript || !response) {
      return NextResponse.json(
        { error: "Missing 'transcript' or 'response' in request body" },
        { status: 400 }
      )
    }

    const systemPrompt = `
You are an expert evaluator for the PTE speaking task "Retell Lecture".
Evaluate the student's response based on content coverage, fluency, grammar, and coherence.
Return only valid JSON like:
{
  "score": "number from 1 to 5",
  "feedback": "a short paragraph giving constructive feedback"
}
`

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Lecture Transcript:\n${transcript}\n\nStudent Response:\n${response}` },
      ],
      temperature: 0,
      max_completion_tokens: 512,
      response_format: { type: "json_object" },
    })

    const result = completion.choices[0]?.message?.content
    if (!result) throw new Error("No content received from Groq model")

    const parsed = JSON.parse(result)

    return NextResponse.json({
      score: parsed.score,
      feedback: parsed.feedback,
    })
  } catch (error: any) {
    console.error("Retell Lecture Evaluation Error:", error.message)
    return NextResponse.json({
      score: undefined,
      feedback: "Evaluation failed. Please try again later.",
    }, { status: 500 })
  }
}