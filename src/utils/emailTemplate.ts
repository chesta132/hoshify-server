export function emailTemplate(props: {
  title: string;
  name: string;
  message: string;
  infoMessage: string;
  button?: {
    buttonText: string;
    buttonHref: string;
  };
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${props.title}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset styles for email clients */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        
        /* Base styles */
        body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #F5EFD6;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #2C2C2C;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(155, 93, 229, 0.1);
        }
        
        /* Header styles */
        .header {
            background: linear-gradient(135deg, #9B5DE5 0%, #C9D8B6 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
        }
        
        .logo-container {
            position: relative;
            z-index: 2;
            display: inline-flex;
            align-items: center !important;
            gap: 16px;
            margin-bottom: 12px;
        }
        
        .logo {
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        }
        
        .logo-icon {
            font-size: 24px;
            font-weight: bold;
            color: white;
            width: 25px;
        }
        
        .brand-name {
            font-size: 28px;
            font-weight: 700;
            color: white;
            margin: 0;
            text-decoration: none;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .tagline {
            position: relative;
            z-index: 2;
            font-size: 16px;
            color: rgba(255, 255, 255, 0.9);
            margin: 8px 0 0 0;
            font-weight: 400;
        }
        
        /* Content styles */
        .content {
            padding: 50px 40px;
            background-color: #FFFFFF;
        }
        
        .title {
            font-size: 32px;
            font-weight: 700;
            color: #2C2C2C;
            margin: 0 0 12px 0;
            line-height: 1.2;
        }
        
        .greeting {
            font-size: 20px;
            color: #9B5DE5;
            margin: 0 0 24px 0;
            font-weight: 600;
        }
        
        .message {
            font-size: 16px;
            color: #2C2C2C;
            margin: 0 0 30px 0;
            line-height: 1.7;
        }
        
        .info-message {
            background: linear-gradient(135deg, #F5EFD6 0%, rgba(201, 216, 182, 0.3) 100%);
            border: 1px solid rgba(155, 93, 229, 0.2);
            border-radius: 12px;
            padding: 24px;
            margin: 30px 0;
            position: relative;
        }
        
        .info-message::before {
            content: '💡';
            position: absolute;
            top: 20px;
            left: 20px;
            font-size: 20px;
        }
        
        .info-message p {
            margin: 0 0 0 35px;
            font-size: 15px;
            color: #2C2C2C;
            line-height: 1.6;
            font-weight: 500;
        }
        
        /* Button styles */
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #9B5DE5 0%, #C9D8B6 100%);
            color: white !important;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            transition: all 0.3s ease;
            border: none;
            box-shadow: 0 6px 20px rgba(155, 93, 229, 0.3);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(155, 93, 229, 0.4);
        }
        
        /* Footer styles */
        .footer {
            background: linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%);
            color: #C9D8B6;
            padding: 40px 30px;
            font-size: 14px;
        }
        
        .footer-content {
            max-width: 540px;
            margin: 0 auto;
        }
        
        .footer-brand {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .footer-brand .logo-container {
            justify-content: center;
            margin-bottom: 12px;
        }
        
        .footer-brand .logo {
            background: rgba(155, 93, 229, 0.2);
            border-color: rgba(155, 93, 229, 0.3);
        }
        
        .footer-brand .logo-icon {
            color: #9B5DE5;
        }
        
        .footer-brand .brand-name {
            color: #FFFFFF;
            font-size: 22px;
        }
        
        .footer-description {
            text-align: center;
            font-size: 14px;
            line-height: 1.6;
            color: #C9D8B6;
            margin: 15px 0 30px 0;
            font-style: italic;
        }
        
        .footer-stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin: 25px 0;
            padding: 20px 0;
            border-top: 1px solid rgba(201, 216, 182, 0.2);
            border-bottom: 1px solid rgba(201, 216, 182, 0.2);
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            font-size: 18px;
            font-weight: 700;
            color: #9B5DE5;
            display: block;
            margin-bottom: 4px;
        }
        
        .stat-label {
            font-size: 12px;
            color: #C9D8B6;
            font-weight: 500;
        }
        
        .footer-links {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .footer-links a {
            color: #9B5DE5;
            text-decoration: none;
            margin: 0 12px;
            font-size: 14px;
            font-weight: 500;
            transition: color 0.3s ease;
        }
        
        .footer-links a:hover {
            color: #C9D8B6;
        }
        
        .footer-contact {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .footer-contact a {
            color: #C9D8B6;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
        }
        
        .footer-contact a:hover {
            color: #9B5DE5;
        }
        
        .footer-bottom {
            text-align: center;
            padding-top: 25px;
            border-top: 1px solid rgba(201, 216, 182, 0.2);
            font-size: 13px;
            color: #C9D8B6;
        }
        
        /* Mobile responsive */
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 35px 25px;
            }
            
            .title {
                font-size: 26px;
            }
            
            .greeting {
                font-size: 18px;
            }
            
            .message {
                font-size: 15px;
            }
            
            .button {
                padding: 14px 32px;
                font-size: 15px;
            }
            
            .footer {
                padding: 30px 20px;
            }
            
            .footer-stats {
                flex-direction: column;
                gap: 15px;
            }
            
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .email-container {
                background-color: #FFFFFF;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo-container">
                <div class="logo">
                    <img class="logo-icon" src="https://raw.githubusercontent.com/chesta132/hoshify-client/refs/heads/main/src/app/favicon.ico?token=GHSAT0AAAAAADF5M5B3YN4OLR52TPDF2FOK2FDCIHA"></img>
                </div>
                <div class="brand-name">Hoshify</div>
            </div>
            <div class="tagline">Your All-in-One Personal Management Dashboard</div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <h1 class="title">${props.title}</h1>
            
            <p class="greeting">Hello ${props.name}! 👋</p>
            
            <div class="message">${props.message}</div>
            
            <div class="info-message">
                <p>${props.infoMessage}</p>
            </div>
            
            ${
              props.button
                ? `
            <div class="button-container">
                <a href="${props.button.buttonHref}" class="button">${props.button.buttonText}</a>
            </div>
            `
                : ""
            }
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="logo-container">
                        <div class="logo">
                            <img src="https://raw.githubusercontent.com/chesta132/hoshify-client/refs/heads/main/src/app/favicon.ico?token=GHSAT0AAAAAADF5M5B3YN4OLR52TPDF2FOK2FDCIHA" class="logo-icon"></img>
                        </div>
                        <div class="brand-name">Hoshify</div>
                    </div>
                    <div class="footer-description">
                        "Organize your life, achieve your goals. From to-do lists to financial tracking, everything you need in one beautiful dashboard."
                    </div>
                </div>
                
                <!-- Stats section -->
                <div class="footer-stats">
                    <div class="stat-item">
                        <span class="stat-number">6+</span>
                        <span class="stat-label">Features</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">Local</span>
                        <span class="stat-label">Storage</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">Cross</span>
                        <span class="stat-label">Platform</span>
                    </div>
                </div>
                
                <div class="footer-links">
                    <a href="#about">About Us</a>
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#terms">Terms of Service</a>
                    <a href="#support">Support</a>
                </div>
                
                <div class="footer-contact">
                    <p style="margin: 0 0 8px 0; font-size: 14px;">Need help? We're here for you:</p>
                    <a href="mailto:support@hoshify.com">support@hoshify.com</a>
                </div>
                
                <div class="footer-bottom">
                    <p style="margin: 0;">© ${new Date().getFullYear()} Hoshify. All rights reserved.</p>
                    <p style="margin: 8px 0 0 0;">Built with ❤️ for productivity enthusiasts</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;
}
