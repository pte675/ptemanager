import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

  // Initialize Upstash Redis
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  // Ratelimit: 4 per IP, 4 per phone per 24 hours
  const individualLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(4, '86400s'),
  });
  
  // 50 requests per 3600 seconds = 1 hour
  const globalLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(50, '3600s'), 
});

export async function POST(req: NextRequest) {
  const { to, generatedOtp } = await req.json(); // ✅ get values from request body

  // Separate rate limits: one for IP, one for phone number
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';

  // Perform all 3 checks in parallel
  const [ipCheck, phoneCheck, globalCheck] = await Promise.all([
    individualLimit.limit(`ip:${ip}`),
    individualLimit.limit(`phone:${to}`),
    globalLimit.limit(`global:otp`),
  ]);

  if (!ipCheck.success) {
    await redis.setex(`block:ip:${ip}`, 600, '1'); // Block for 10 mins
    return NextResponse.json({ error: 'Too many requests from this IP.' }, { status: 429 });
  }

  if (!phoneCheck.success) {
    await redis.setex(`block:phone:${to}`, 600, '1'); // Block for 10 mins
    return NextResponse.json({ error: 'Too many OTPs for this number.' }, { status: 429 });
  }

  if (!globalCheck.success) {
    return NextResponse.json(
      { error: 'OTP service limit reached. Try again tomorrow.' },
      { status: 429 }
    );
  }
  
  //code to send OTP via WHAPI
  const apiKey = process.env.WHAPI_API_KEY;
  const url = 'https://gate.whapi.cloud/messages/text';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      to,
      body: `${generatedOtp} is your one-time password (OTP) for ptegoglobal.com.`,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data.error }, { status: response.status });
  }

  return NextResponse.json({ success: true, data });
}