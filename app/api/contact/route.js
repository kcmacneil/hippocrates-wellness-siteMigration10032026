import { NextResponse } from 'next/server';

// Replaces the Contact Form 7 submissions handled by WordPress.
// Delivery is configured through environment variables (see README):
//   FORM_WEBHOOK_URL  - POST the JSON submission to any endpoint
//                       (e.g. Zapier/Make/Formspree webhook).
// Without FORM_WEBHOOK_URL the submission is validated and accepted
// but only logged server-side, matching a "queue it later" behavior.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  // Honeypot spam check — bots fill the hidden "company" field.
  if (data.company) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof data.name === 'string' ? data.name.trim().slice(0, 200) : '';
  const email = typeof data.email === 'string' ? data.email.trim().slice(0, 200) : '';
  const message = typeof data.message === 'string' ? data.message.trim().slice(0, 5000) : '';
  const subject = typeof data.subject === 'string' ? data.subject.trim().slice(0, 300) : '';

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: 'Name, email and message are required.' }, { status: 422 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please provide a valid email address.' }, { status: 422 });
  }

  const submission = { name, email, subject, message, receivedAt: new Date().toISOString() };

  const hook = process.env.FORM_WEBHOOK_URL;
  if (hook) {
    try {
      const res = await fetch(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } catch (err) {
      console.error('form webhook failed', err);
      return NextResponse.json({ ok: false, error: 'Could not deliver your message. Please try again.' }, { status: 502 });
    }
  } else {
    console.log('contact form submission (no FORM_WEBHOOK_URL configured)', submission);
  }

  return NextResponse.json({ ok: true });
}
