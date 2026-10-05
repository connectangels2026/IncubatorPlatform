/**
 * Reusable HTML & text email templates for incubator notifications
 */

export interface EmailTemplateData {
  recipientName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

export function generateBaseEmail(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const { recipientName, title, message, actionUrl, actionText, metadata } = data;

  const metadataHtml = metadata
    ? Object.entries(metadata)
        .map(
          ([key, value]) =>
            `<tr><td style="padding: 6px 12px; font-weight: bold; color: #475569; text-transform: capitalize;">${key.replace(/_/g, ' ')}:</td><td style="padding: 6px 12px; color: #1e293b;">${value}</td></tr>`
        )
        .join('')
    : '';

  const actionButton = actionUrl
    ? `
    <div style="margin: 28px 0; text-align: center;">
      <a href="${actionUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
        ${actionText || 'View Details'}
      </a>
    </div>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
    <!-- Header -->
    <tr>
      <td style="background-color: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">IncubatorPlatform</h1>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 32px 24px;">
        <p style="font-size: 15px; color: #334155; margin-top: 0;">Hi <strong>${recipientName || 'there'}</strong>,</p>
        <h2 style="font-size: 18px; color: #0f172a; margin: 16px 0 12px 0;">${title}</h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px;">${message}</p>
        
        ${
          metadataHtml
            ? `<table width="100%" style="background-color: #f1f5f9; border-radius: 8px; margin: 20px 0; font-size: 13px;">${metadataHtml}</table>`
            : ''
        }

        ${actionButton}

        <p style="font-size: 13px; color: #64748b; margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          If you have any questions, feel free to reply directly to this email or visit your portal.
        </p>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        You received this email based on your notification preferences. <br/>
        &copy; ${new Date().getFullYear()} IncubatorPlatform. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
${title}
=======================================
Hi ${recipientName || 'there'},

${message}

${metadata ? Object.entries(metadata).map(([k, v]) => `${k}: ${v}`).join('\n') : ''}

${actionUrl ? `Link: ${actionUrl}` : ''}

Best regards,
IncubatorPlatform Team
  `.trim();

  return { subject: title, html, text };
}

export const emailTemplates = {
  application_submission: (applicantName: string, startupName: string, cohort: string) =>
    generateBaseEmail({
      recipientName: applicantName,
      title: 'Application Received Successfully',
      message: `Thank you for submitting your application for ${startupName}. Our review committee has received your submission and will evaluate your application for the ${cohort} cohort.`,
      metadata: {
        Startup: startupName,
        Cohort: cohort,
        Status: 'Submitted',
        'Next Step': 'Committee Evaluation',
      },
      actionText: 'Track Application Status',
      actionUrl: 'https://incubator.example.com/dashboard/applications',
    }),

  application_decision: (applicantName: string, startupName: string, decision: 'admitted' | 'rejected' | 'under_review', comments?: string) => {
    const isAdmitted = decision === 'admitted';
    const isReview = decision === 'under_review';
    const title = isAdmitted
      ? `🎉 Congratulations! Your Application for ${startupName} is Admitted`
      : isReview
      ? `Update on Your Application for ${startupName}`
      : `Application Status Update for ${startupName}`;

    const message = isAdmitted
      ? `We are delighted to inform you that ${startupName} has been officially admitted into our incubation program! Welcome aboard.`
      : isReview
      ? `Your application for ${startupName} is currently under active review by our evaluation team.`
      : `Thank you for your interest in our program. After thorough evaluation, we are unable to admit ${startupName} at this time.`;

    return generateBaseEmail({
      recipientName: applicantName,
      title,
      message,
      metadata: {
        Startup: startupName,
        Decision: decision.toUpperCase(),
        ...(comments ? { 'Reviewer Notes': comments } : {}),
      },
      actionText: 'View Application Details',
      actionUrl: 'https://incubator.example.com/dashboard/applications',
    });
  },

  mentorship_booking: (recipientName: string, sessionTitle: string, partnerName: string, date: string, time: string, link: string) =>
    generateBaseEmail({
      recipientName,
      title: `Mentorship Session Confirmed: ${sessionTitle}`,
      message: `Your mentorship session with ${partnerName} has been confirmed. Please join the meeting at the scheduled time.`,
      metadata: {
        Session: sessionTitle,
        With: partnerName,
        Date: date,
        Time: time,
        'Meeting Link': link || 'Online',
      },
      actionText: 'Join Meeting',
      actionUrl: link || 'https://incubator.example.com/dashboard/mentors',
    }),

  mentorship_reminder: (recipientName: string, sessionTitle: string, partnerName: string, date: string, time: string, link: string) =>
    generateBaseEmail({
      recipientName,
      title: `⏰ Reminder: Mentorship Session Tomorrow`,
      message: `This is a friendly reminder that your mentorship session "${sessionTitle}" with ${partnerName} is scheduled for tomorrow.`,
      metadata: {
        Session: sessionTitle,
        Partner: partnerName,
        Date: date,
        Time: time,
        'Meeting Link': link || 'Online',
      },
      actionText: 'Open Session Details',
      actionUrl: link || 'https://incubator.example.com/dashboard/mentors',
    }),
};
