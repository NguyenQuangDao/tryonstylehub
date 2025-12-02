import nodemailer from 'nodemailer'

const gmailUser = process.env.GMAIL_EMAIL
const gmailPass = process.env.GMAIL_APP_PASSWORD

export const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
})

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!gmailUser || !gmailPass) {
    throw new Error('GMAIL_EMAIL hoặc GMAIL_APP_PASSWORD chưa được cấu hình')
  }
  return mailTransporter.sendMail({ from: gmailUser, to, subject, html })
}

