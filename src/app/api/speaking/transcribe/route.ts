import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { Readable } from 'stream';
import { writeFile } from 'fs/promises';
import path from 'path';
import os from 'os';
import fs from 'fs';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Save file temporarily to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempFilePath = path.join(os.tmpdir(), file.name);
    await writeFile(tempFilePath, buffer as unknown as NodeJS.ArrayBufferView);    
    
    // Transcribe using Groq
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "distil-whisper-large-v3-en",
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });

    return NextResponse.json({ text: transcription.text });
  } catch (err: any) {
    console.error("Transcription error:", err.message);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}