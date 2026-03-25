'use server';

import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";

export async function sendFeedback(subject: string, message: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açılmamış.");

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, companies(name)')
    .eq('id', user.id)
    .single();

  const companyName = (profile?.companies as any)?.name || 'Bilinmiyor';
  const userName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || user.email;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Warvanta Support <onboarding@resend.dev>', // Should ideally be from verified domain
      to: ['ibrahimsentinmaz@gmail.com'],
      subject: `[Warvanta Feedback] ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Yeni Geri Bildirim / Geliştirme Talebi</h2>
          <p><strong>Gönderen:</strong> ${userName} (${user.email})</p>
          <p><strong>Şirket:</strong> ${companyName}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Konu:</strong> ${subject}</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <footer style="margin-top: 30px; font-size: 11px; color: #94a3b8;">
            Warvanta SaaS Uygulaması üzerinden gönderilmiştir.
          </footer>
        </div>
      `
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Resend error:", err);
    throw new Error("Geri bildirim gönderilirken bir hata oluştu: " + err.message);
  }
}

export async function sendPublicContactMessage(email: string, message: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Warvanta <onboarding@resend.dev>',
      to: ['ibrahimsentinmaz@gmail.com'],
      replyTo: email,
      subject: `[Warvanta İletişim] Yeni Mesaj: ${email}`,
      text: `Yeni İletişim Talebi\nE-posta: ${email}\nMesaj: ${message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Yeni İletişim Talebi (Ziyaretçi)</h2>
          <p><strong>E-posta:</strong> ${email}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <footer style="margin-top: 30px; font-size: 11px; color: #94a3b8;">
            Warvanta Giriş/Başvuru sayfası üzerinden gönderilmiştir.
          </footer>
        </div>
      `
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Resend error:", err);
    throw new Error("Mesaj gönderilirken bir hata oluştu: " + err.message);
  }
}
