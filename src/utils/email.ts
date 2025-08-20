import nodemailer from "nodemailer";
import { CLIENT_URL } from "../app";
import { emailTemplate } from "./emailTemplate";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_AUTH_USER,
    pass: process.env.EMAIL_AUTH_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

export const sendOTPEmail = async (email: string, otpCode: string, name: string) => {
  try {
    await transporter.sendMail({
      from: "Hoshify Team",
      to: email,
      subject: "Hoshify One-Time Password (OTP)",
      html: emailTemplate({
        title: "Your One-Time Password (OTP)",
        message: `You have requested a One-Time Password (OTP) to complete your action on Hoshify. Please use the following code to proceed:\n\nFor your security, please do not share this OTP with anyone, including Hoshify employees.`,
        name: name.capitalEach(),
        infoMessage: `<p style="font-weight: bold; font-size: 18px;">${otpCode}</p>`,
      }),
    });
  } catch (error) {
    console.error("Email error", error);
    throw error as Error;
  }
};

export const sendVerificationEmail = async (email: string, token: string, name: string) => {
  try {
    await transporter.sendMail({
      from: "Hoshify Team",
      to: email,
      subject: "Hoshify Email Verification",
      html: emailTemplate({
        title: "Verify your email",
        message: "",
        name: name.capitalEach(),
        infoMessage: `You have requested to verify your email address for your Hoshify account. To complete this action, please click the button below.\n\nFor your security, please do not share this email or its link with anyone, including Hoshify employees.`,
        button: {
          buttonText: "Verify your email",
          buttonHref: `${CLIENT_URL}/verify/email/?token=${token}`,
        },
      }),
    });
  } catch (error) {
    console.error("Email error", error);
    throw error as Error;
  }
};

/**
 * @param credentials Default is "password"
 */
export const sendCredentialChanges = async (email: string, name: string, credentials = "password") => {
  try {
    await transporter.sendMail({
      from: "Hoshify Team",
      to: email,
      subject: `Hoshify ${credentials.capitalEach()} Has Been Changed`,
      html: emailTemplate({
        title: `${credentials.capital()} change`,
        message: "",
        name,
        infoMessage: `Dear ${name.capitalEach()},\n\nYour Hoshify account ${credentials.toLowerCase()} has been successfully updated. If you did not make this change, please contact Hoshify support immediately.\n\nFor your security, please do not share your login credentials with anyone, including Hoshify employees.`,
      }),
    });
  } catch (error) {
    console.error("Email error", error);
    throw error as Error;
  }
};
