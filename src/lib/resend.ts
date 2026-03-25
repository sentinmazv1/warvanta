import { Resend } from 'resend';

// resend API key should be in .env.local as RESEND_API_KEY
export const resend = new Resend(process.env.RESEND_API_KEY);
