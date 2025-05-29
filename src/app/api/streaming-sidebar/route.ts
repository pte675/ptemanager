import { Groq } from 'groq-sdk';
import { NextRequest } from 'next/server';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error("Missing GROQ_API_KEY in environment variables");

const groq = new Groq({ apiKey });

export async function POST(req: NextRequest) {
    const allowedOrigins = [
    "http://localhost:3000",
    "https://ptegoglobal.com",
    "https://ptemanager.vercel.app"
    ];
    const origin = req.headers.get("origin");

    if (!origin || !allowedOrigins.includes(origin)) {
        return new Response("Forbidden: CORS", {
        status: 403,
        headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": "null",
        },
        });
    }

    const userAgent = req.headers.get("user-agent") || "";
    if (userAgent.includes("Postman") || userAgent.includes("curl")) {
        return new Response("Blocked", { status: 403 });
    }

   // Basic in-memory rate limiting with 5-min ban
    const ip = req.headers.get("x-forwarded-for") || "local";
    const now = Date.now();
    const rateStore = (globalThis as any)._rateStore ||= new Map();

    const windowMs = 60 * 1000;      // 1-minute window
    const maxRequests = 20;
    const banDurationMs = 5 * 60 * 1000; // 5 minutes

    const record = rateStore.get(ip) || {
    count: 0,
    startTime: now,
    bannedUntil: null
    };

    // Check if currently banned
    if (record.bannedUntil && now < record.bannedUntil) {
    return new Response("Too many requests. You are blocked.", {
        status: 429,
    });
    }

    // Rate limit logic
    if (now - record.startTime < windowMs) {
    record.count++;
    if (record.count > maxRequests) {
        record.bannedUntil = now + banDurationMs;
        rateStore.set(ip, record);
        return new Response("Too many requests. You are banned.", {
        status: 429,
        });
    }
    } else {
    // Reset window
    record.count = 1;
    record.startTime = now;
    record.bannedUntil = null;
    }

    rateStore.set(ip, record);

    

    const {
        section,
        questionType,
        instruction,
        passage,
        userResponse,
        previousQA,
        userQuery
    } = await req.json();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
        try {
           const systemMessage = {
            role: "system",
            content: [
                `You are a helpful assistant guiding users in the '${section}' section of a test.`,
                `Task: ${questionType}`,
                ``,
                `Instruction: ${instruction}`,
                ``,
                `Passage:`,
                passage,
                ``,
                `User's Answer:`,
                userResponse || "(No answer provided)",
                ``,
                `Use the above context to reply to the user's query.`
            ]
                .filter(Boolean) // removes empty strings
                .join("\n")
            };

            const chatMessages: ChatCompletionMessageParam[] = [];

            if (previousQA?.question && previousQA?.answer) {
                chatMessages.push({
                    role: "user",
                    content: [
                    `Previous User Query:`,
                    previousQA.question,
                    ``,
                    `Previous Assistant Reply:`,
                    previousQA.answer
                    ].join("\n")
                });
            }

            chatMessages.push({
                role: "user",
                content: [
                    `Current User Query:`,
                    userQuery
                ].join("\n")
            });

            console.log("💬 Sytem Messages Sent to Groq:\n", systemMessage);
            console.log("💬 Chat Messages Sent to Groq:\n", chatMessages);

            const chatStream = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                temperature: 0.7,
                max_completion_tokens: 1024,
                top_p: 1,
                stream: true,
                messages: [
                    systemMessage,
                    ...chatMessages,
                ] as ChatCompletionMessageParam[], // ✅ explicitly cast
                });

            for await (const chunk of chatStream) {
            const content = chunk.choices[0]?.delta?.content || "";
            controller.enqueue(encoder.encode(content));
            }

            controller.close();
        } catch (error: any) {
            controller.enqueue(encoder.encode("Something went wrong: " + error.message));
            controller.close();
        }
        }
    });

    return new Response(stream, {
        headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        },
    });
}