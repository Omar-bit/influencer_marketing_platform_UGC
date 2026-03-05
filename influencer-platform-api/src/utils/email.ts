import nodemailer from 'nodemailer';
import logger from '@utils/logger';
import EMAIL_USER, { EMAIL_PASS } from './secrets';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

interface EmailOptions {
  toEmail: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(
  toEmail: string,
  subject: string,
  text: string,
  html?: string
) {
  try {
    logger.info(`Sending email (${subject}) to ${toEmail}`);

    const mailOptions: any = {
      from: `WebTrend <${EMAIL_USER}>`,
      to: toEmail,
      subject,
      text,
    };

    // Add HTML content if provided
    if (html) {
      mailOptions.html = html;
    }

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${toEmail}`);
  } catch (err) {
    console.error('Email sending error:', err);
    logger.error('Email sending failed:', err);
  }
}

// Enhanced email function with better options support
export async function sendHtmlEmail(options: EmailOptions) {
  try {
    logger.info(`Sending email (${options.subject}) to ${options.toEmail}`);

    const mailOptions: any = {
      from: `WebTrend <${EMAIL_USER}>`,
      to: options.toEmail,
      subject: options.subject,
    };

    if (options.html) {
      mailOptions.html = options.html;
      // Provide fallback text if not specified
      if (!options.text) {
        mailOptions.text = options.subject;
      } else {
        mailOptions.text = options.text;
      }
    } else if (options.text) {
      mailOptions.text = options.text;
    }

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.toEmail}`);
  } catch (err) {
    console.error('Email sending error:', err);
    logger.error('Email sending failed:', err);
  }
}
