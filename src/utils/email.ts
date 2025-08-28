import nodemailer from "nodemailer";
import { CLIENT_URL } from "../app";
import { emailTemplate } from "./emailTemplate";
import { UserRole } from "@/models/User";
import { capital, capitalEach } from "./manipulate";

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
        name: capitalEach(name),
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
        name: capitalEach(name),
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
      subject: `Hoshify ${capitalEach(credentials)} Has Been Changed`,
      html: emailTemplate({
        title: `${capital(credentials)} change`,
        message: "",
        name,
        infoMessage: `Dear ${capitalEach(
          name
        )},\n\nYour Hoshify account ${credentials.toLowerCase()} has been successfully updated. If you did not make this change, please contact Hoshify support immediately.\n\nFor your security, please do not share your login credentials with anyone, including Hoshify employees.`,
      }),
    });
  } catch (error) {
    console.error("Email error", error);
    throw error as Error;
  }
};

export const sendRequestRole = async (role: UserRole, token: string, name: string) => {
  try {
    await transporter.sendMail({
      from: "Hoshify Team",
      to: process.env.EMAIL_AUTH_USER,
      subject: "Hoshify Role Request",
      html: emailTemplate({
        title: `Someone is requesting ${role.toLowerCase()} role`,
        message: "",
        name: "Chesta Ardiona",
        infoMessage: `${capitalEach(
          name
        )} is requesting ${role.toLowerCase()} role in Hoshify. To complete this action, please click the button below.\n\nFor your security, please do not share this email or its link with anyone, including Hoshify employees.`,
        button: {
          buttonText: `Allow ${name} to access ${role.toLowerCase()} role`,
          buttonHref: `${CLIENT_URL}/verify/role/?token=${token}`,
        },
      }),
    });
  } catch (error) {
    console.error("Email error", error);
    throw error as Error;
  }
};

export const sendRoleGranted = async (role: UserRole, email: string, name: string) => {
  try {
    await transporter.sendMail({
      from: "Hoshify Team",
      to: email,
      subject: "Hoshify Role Granted",
      html: emailTemplate({
        title: `${capital(role.toLowerCase())} role granted`,
        message: "",
        name,
        infoMessage: `You have been promoted to ${role.toLowerCase()} role in Hoshify.`,
        button: {
          buttonText: `Open Hoshify`,
          buttonHref: `${CLIENT_URL}/`,
        },
      }),
    });
  } catch (error) {
    console.error("Email error", error);
    throw error as Error;
  }
};
