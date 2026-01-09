import nodemailer from "nodemailer";
import { google } from "googleapis";

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = process.env.REDIRECT_URI;
const refreshToken = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectURI
);

oauth2Client.setCredentials({
  refresh_token: refreshToken,
});

async function createTransport() {
  const { token: accessToken } = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: "Gmail",
    secure: true,
    port: 465,
    auth: {
      type: "OAuth2",
      user: "babonarnab@gmail.com",
      clientId,
      clientSecret,
      refreshToken,
      accessToken,
    },
  });
}

function generateEmailTemplate(title, message, code, url, validity) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; text-align: center;">${title}</h2>
          <p style="color: #555;">${message}</p>
          <p style="font-size: 1.5em; font-weight: bold; color: #333; text-align: center; margin: 20px 0;">${code}</p>
          <p style="color: #555; text-align: center;">Or copy and paste this URL in your browser:</p>
          <p style="color: #007BFF; text-align: center; word-break: break-all;">${url}</p>
          <p style="color: #555; text-align: center; margin-top: 20px;">This code is valid only for ${validity}.</p>
          <p style="color: #555; text-align: center;">If you did not request this code, please ignore this email.</p>
        </div>
      </body>
    </html>
  `;
}

export async function sendVerificationEmail(
  email,
  username,
  verifyCode,
  verifyUrl
) {
  try {
    const transport = await createTransport();

    const mailOptions = {
      from: "Verity <babonarnab@gmail.com>",
      to: email,
      subject: "Verity | Verification Code",
      text: `Hello, ${username}\n\nThank you for registering. Please use the following verification code to complete your registration:\n\n${verifyCode}\n\nThis code is valid only for 1 hour.\n\nIf you did not request this code, please ignore this email.`,
      html: generateEmailTemplate(
        `Hello ${username},`,
        "Thank you for registering. Please use the following verification code to complete your registration:",
        verifyCode,
        verifyUrl,
        "1 hour"
      ),
    };

    await transport.sendMail(mailOptions);

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Error sending verification email:", error);

    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}

export async function sendForgotPasswordEmail(
  email,
  resetPasswordCode,
  resetPasswordUrl
) {
  try {
    const transport = await createTransport();

    const mailOptions = {
      from: "Verity <babonarnab@gmail.com>",
      to: email,
      subject: "Verity | Reset Password Code",
      text: `Please enter the following code to change your password:\n\n${resetPasswordCode}\n\nOr copy and paste this URL in your browser to reset your password: ${resetPasswordUrl}\n\nThis code is valid only for 30 minutes.\n\nIf you did not request this code, please ignore this email.`,
      html: generateEmailTemplate(
        "Reset Password",
        "Please enter the following code to change your password:",
        resetPasswordCode,
        resetPasswordUrl,
        "30 minutes"
      ),
    };

    await transport.sendMail(mailOptions);

    return {
      success: true,
      message: "Forgot password email sent successfully",
    };
  } catch (error) {
    console.error("Error sending forgot password email:", error);

    return {
      success: false,
      message: "Failed to send forgot password email",
    };
  }
}
