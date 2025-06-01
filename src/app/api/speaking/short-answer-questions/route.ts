import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { sampleAnswer, question, userResponse } = await req.json()

    if (!sampleAnswer || !question || !userResponse) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // 🧠 Simple Evaluation Logic (Replace with AI or NLP-based logic as needed)
    const lowerSample = sampleAnswer.toLowerCase()
    const lowerResponse = userResponse.toLowerCase()

    const matchedWords = lowerSample
      .split(/\s+/)
      .filter((word: string) => lowerResponse.includes(word)).length

    const totalWords = lowerSample.split(/\s+/).length
    const score = Math.round((matchedWords / totalWords) * 5)
    
    const feedback =
      score >= 4
        ? "Excellent! Your response closely matches the expected answer."
        : score >= 2
        ? "Fair attempt. Try including more keywords and relevant points."
        : "Needs improvement. Try to match the core idea and keywords."

    return NextResponse.json({ score, feedback })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}