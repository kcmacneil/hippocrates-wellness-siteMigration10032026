'use client';

import { useState } from 'react';

// React re-implementation of the WordPress Contact Form 7 form
// (name / email / subject / message). Posts to /api/contact.
export default function ContactForm() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get('name'),
      email: fd.get('email'),
      subject: fd.get('subject'),
      message: fd.get('message'),
      company: fd.get('company'), // honeypot
    };
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || 'Submission failed');
      setStatus('sent');
      e.target.reset();
    } catch (err) {
      setError(err.message || 'There was an error trying to send your message. Please try again later.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return <p className="form-success">Thank you for your message. It has been sent.</p>;
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <p className="visually-hidden" aria-hidden="true">
        <label>Company <input name="company" tabIndex={-1} autoComplete="off" /></label>
      </p>
      <label>
        Your name
        <input name="name" type="text" required autoComplete="name" />
      </label>
      <label>
        Your email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Subject
        <input name="subject" type="text" />
      </label>
      <label>
        Your message (optional)
        <textarea name="message" rows={6} />
      </label>
      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Submit'}
      </button>
      {status === 'error' && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
