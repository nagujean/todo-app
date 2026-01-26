import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Types
interface InvitationData {
  teamId: string;
  teamName: string;
  type: "email" | "link";
  email?: string;
  role: "editor" | "viewer";
  createdBy: string;
  createdAt: admin.firestore.Timestamp;
  expiresAt: admin.firestore.Timestamp;
  status: "pending" | "accepted" | "declined";
  maxUses?: number;
  uses?: number;
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

// Get email configuration from environment variables
function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !port || !user || !pass || !from) {
    console.warn("Email configuration incomplete. Required environment variables:");
    console.warn("SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM");
    return null;
  }

  return {
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465,
    user,
    pass,
    from,
  };
}

// Create nodemailer transporter
function createTransporter(config: EmailConfig): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

// Format date for display
function formatDate(timestamp: admin.firestore.Timestamp): string {
  const date = timestamp.toDate();
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Get role display name
function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    editor: "Editor (Can edit todos)",
    viewer: "Viewer (Read-only access)",
  };
  return roleNames[role] || role;
}

// Generate invitation email HTML
function generateEmailHTML(
  teamName: string,
  role: string,
  invitationLink: string,
  expiresAt: string
): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #3b82f6; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                Team Invitation
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                You have been invited to join a team on Todo App.
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Team Name</p>
                    <p style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">${teamName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 20px 20px;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Your Role</p>
                    <p style="margin: 0; color: #111827; font-size: 16px;">${getRoleDisplayName(role)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 20px 20px;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Expires</p>
                    <p style="margin: 0; color: #ef4444; font-size: 14px;">${expiresAt}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${invitationLink}" style="display: inline-block; padding: 14px 40px; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; text-align: center;">
                Or copy and paste this link in your browser:
              </p>
              <p style="margin: 10px 0 0; color: #3b82f6; font-size: 14px; text-align: center; word-break: break-all;">
                ${invitationLink}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This invitation will expire on ${expiresAt}.
              </p>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                If you did not expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Generate plain text email
function generateEmailText(
  teamName: string,
  role: string,
  invitationLink: string,
  expiresAt: string
): string {
  return `
Team Invitation

You have been invited to join a team on Todo App.

Team Name: ${teamName}
Your Role: ${getRoleDisplayName(role)}
Expires: ${expiresAt}

To accept this invitation, click the link below:
${invitationLink}

This invitation will expire on ${expiresAt}.

If you did not expect this invitation, you can safely ignore this email.
`.trim();
}

/**
 * Cloud Function triggered when a new invitation is created in Firestore.
 * Sends an email invitation if the invitation type is 'email'.
 */
export const sendInvitationEmail = functions
  .region("asia-northeast3") // Seoul region - change as needed
  .firestore.document("invitations/{invitationId}")
  .onCreate(async (snapshot, context) => {
    const invitationId = context.params.invitationId;
    const data = snapshot.data() as InvitationData;

    // Only send email for email-type invitations
    if (data.type !== "email") {
      console.log(`Skipping non-email invitation: ${invitationId}`);
      return null;
    }

    // Check if email is present
    if (!data.email) {
      console.error(`Email invitation ${invitationId} has no email address`);
      return null;
    }

    // Get email configuration
    const emailConfig = getEmailConfig();
    if (!emailConfig) {
      console.warn(`Email not sent for invitation ${invitationId}: SMTP not configured`);
      // Store the error status in the invitation document
      await snapshot.ref.update({
        emailStatus: "not_configured",
        emailError: "SMTP configuration is missing",
      });
      return null;
    }

    // Generate invitation link
    const appUrl = process.env.APP_URL || "https://your-app-url.com";
    const invitationLink = `${appUrl}/join/${invitationId}`;

    // Format expiration date
    const expiresAtFormatted = formatDate(data.expiresAt);

    // Generate email content
    const htmlContent = generateEmailHTML(
      data.teamName,
      data.role,
      invitationLink,
      expiresAtFormatted
    );
    const textContent = generateEmailText(
      data.teamName,
      data.role,
      invitationLink,
      expiresAtFormatted
    );

    try {
      // Create transporter and send email
      const transporter = createTransporter(emailConfig);

      const mailOptions: nodemailer.SendMailOptions = {
        from: emailConfig.from,
        to: data.email,
        subject: `You're invited to join "${data.teamName}" on Todo App`,
        text: textContent,
        html: htmlContent,
      };

      const result = await transporter.sendMail(mailOptions);

      console.log(`Email sent successfully for invitation ${invitationId}:`, result.messageId);

      // Update invitation document with email status
      await snapshot.ref.update({
        emailStatus: "sent",
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        emailMessageId: result.messageId,
      });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`Failed to send email for invitation ${invitationId}:`, error);

      // Update invitation document with error status
      await snapshot.ref.update({
        emailStatus: "failed",
        emailError: error instanceof Error ? error.message : "Unknown error",
      });

      // Re-throw to mark the function as failed
      throw error;
    }
  });

/**
 * HTTP function to test email configuration.
 * Only available in development/testing environments.
 */
export const testEmailConfig = functions
  .region("asia-northeast3")
  .https.onRequest(async (req, res) => {
    // Only allow in development
    if (process.env.FUNCTIONS_EMULATOR !== "true") {
      res.status(403).json({ error: "This endpoint is only available in development mode" });
      return;
    }

    const emailConfig = getEmailConfig();

    if (!emailConfig) {
      res.status(500).json({
        configured: false,
        message: "Email configuration is incomplete",
        required: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"],
      });
      return;
    }

    try {
      const transporter = createTransporter(emailConfig);
      await transporter.verify();

      res.json({
        configured: true,
        message: "Email configuration is valid and connection successful",
        config: {
          host: emailConfig.host,
          port: emailConfig.port,
          secure: emailConfig.secure,
          from: emailConfig.from,
        },
      });
    } catch (error) {
      res.status(500).json({
        configured: true,
        message: "Email configuration exists but connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

/**
 * Scheduled function to clean up expired invitations.
 * Runs daily at midnight.
 */
export const cleanupExpiredInvitations = functions
  .region("asia-northeast3")
  .pubsub.schedule("0 0 * * *") // Every day at midnight
  .timeZone("Asia/Seoul")
  .onRun(async (_context) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    try {
      // Query for expired pending invitations
      const expiredInvitations = await db
        .collection("invitations")
        .where("status", "==", "pending")
        .where("expiresAt", "<", now)
        .get();

      if (expiredInvitations.empty) {
        console.log("No expired invitations to clean up");
        return null;
      }

      // Batch update expired invitations
      const batch = db.batch();
      let count = 0;

      expiredInvitations.forEach((doc) => {
        batch.update(doc.ref, {
          status: "expired",
          expiredAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        count++;
      });

      await batch.commit();
      console.log(`Marked ${count} invitations as expired`);

      return { expiredCount: count };
    } catch (error) {
      console.error("Error cleaning up expired invitations:", error);
      throw error;
    }
  });
