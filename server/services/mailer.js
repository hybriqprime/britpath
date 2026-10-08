// Sends email through Resend (https://resend.com). No package needed.
// Without RESEND_API_KEY, development prints the email in the server console instead.
export async function sendMail({ to, subject, text, html }) {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY is not set, email was not sent');
    }
    console.log(`\n[email not sent: no RESEND_API_KEY]\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`);
    return { sent: false };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || 'The BritPath <onboarding@resend.dev>',
      to: [to],
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Email failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  return { sent: true };
}