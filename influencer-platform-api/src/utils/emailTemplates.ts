// Email template constants and utilities
export const BRAND_COLORS = {
  primary: '#6c51a2',
  secondary: '#8f7ab8',
  accent: '#a996d8',
  light: '#f4eeff',
  text: '#2d3748',
  muted: '#718096',
};

export const INFLUENCER_COLORS = {
  primary: '#da0d8c',
  secondary: '#f3c028',
  accent: '#f15f4d',
  gradient: 'linear-gradient(135deg, #f3c028 0%, #f15f4d 50%, #da0d8c 100%)',
  light: '#fef7f0',
  text: '#2d3748',
  muted: '#718096',
};

export const BASE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background-color: #f7fafc;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: {{HEADER_BACKGROUND}};
            padding: 32px 24px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
        }
        
        .content {
            padding: 40px 32px;
        }
        
        .welcome-message {
            text-align: center;
            margin-bottom: 32px;
        }
        
        .welcome-message h2 {
            font-size: 24px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 12px;
        }
        
        .welcome-message p {
            font-size: 16px;
            color: #718096;
            line-height: 1.5;
        }
        
        .verification-box {
            background: {{BOX_BACKGROUND}};
            border: 2px solid {{BOX_BORDER}};
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 32px 0;
        }
        
        .verification-code {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 4px;
            color: {{CODE_COLOR}};
            background: white;
            padding: 16px 24px;
            border-radius: 8px;
            margin: 16px 0;
            display: inline-block;
            border: 1px solid #e2e8f0;
        }
        
        .button {
            display: inline-block;
            background: {{BUTTON_BACKGROUND}};
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 16px 0;
            transition: all 0.3s ease;
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .features {
            margin: 32px 0;
        }
        
        .feature-item {
            display: flex;
            align-items: center;
            margin: 16px 0;
            padding: 12px 0;
        }
        
        .feature-icon {
            width: 48px;
            height: 48px;
            background: {{ICON_BACKGROUND}};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 16px;
            font-size: 20px;
        }
        
        .feature-content h3 {
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 4px;
        }
        
        .feature-content p {
            font-size: 14px;
            color: #718096;
            margin: 0;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
            font-size: 14px;
            color: #718096;
            margin: 8px 0;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            padding: 8px;
            background: {{SOCIAL_BACKGROUND}};
            color: white;
            border-radius: 50%;
            text-decoration: none;
            width: 40px;
            height: 40px;
            line-height: 24px;
        }
        
        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 24px 0;
        }
        
        .warning-box {
            background: #fef5e7;
            border: 1px solid #f6ad55;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
        }
        
        .warning-box p {
            color: #744210;
            font-size: 14px;
            margin: 0;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .header {
                padding: 24px 16px;
            }
            
            .content {
                padding: 24px 16px;
            }
            
            .footer {
                padding: 24px 16px;
            }
            
            .verification-code {
                font-size: 24px;
                letter-spacing: 2px;
                padding: 12px 16px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        {{CONTENT}}
    </div>
</body>
</html>`;

export const WELCOME_TEMPLATE_BRAND = `
        <div class="header">
            <h1>Welcome to WebTrend</h1>
            <p>Your Influencer Marketing Journey Starts Here</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <h2>Hello {{USER_NAME}}! 👋</h2>
                <p>Welcome to WebTrend, the premier platform connecting brands with influential creators. You're about to unlock powerful tools to grow your business through strategic influencer partnerships.</p>
            </div>
            
            <div class="verification-box">
                <h3 style="color: ${BRAND_COLORS.primary}; margin-bottom: 16px;">Verify Your Account</h3>
                <p style="margin-bottom: 16px;">Please use this verification code to activate your account:</p>
                <div class="verification-code">{{VERIFICATION_CODE}}</div>
                <p style="color: #718096; font-size: 14px; margin-top: 16px;">This code expires in 10 minutes</p>
            </div>
            
            <div class="features">
                <h3 style="color: #2d3748; margin-bottom: 20px; text-align: center;">What you can do with WebTrend:</h3>
                
                <div class="feature-item">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-content">
                        <h3>Find Perfect Influencers</h3>
                        <p>Discover creators that align with your brand values and target audience</p>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div class="feature-content">
                        <h3>Campaign Management</h3>
                        <p>Create, manage, and track your influencer marketing campaigns</p>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">💰</div>
                    <div class="feature-content">
                        <h3>ROI Tracking</h3>
                        <p>Monitor performance and measure the success of your campaigns</p>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">🤝</div>
                    <div class="feature-content">
                        <h3>Seamless Collaboration</h3>
                        <p>Communicate directly with influencers and manage partnerships</p>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{PLATFORM_URL}}" class="button">Get Started Now</a>
            </div>
            
            <div class="warning-box">
                <p><strong>Security Note:</strong> Never share your verification code with anyone. WebTrend staff will never ask for your login credentials via email.</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="#">📘</a>
                <a href="#">📸</a>
                <a href="#">🐦</a>
                <a href="#">💼</a>
            </div>
            <p>© 2024 WebTrend. All rights reserved.</p>
            <p>Building the future of influencer marketing</p>
            <p style="font-size: 12px; margin-top: 16px;">
                You received this email because you created a WebTrend account.
                <br><a href="#" style="color: ${BRAND_COLORS.primary};">Unsubscribe</a> | <a href="#" style="color: ${BRAND_COLORS.primary};">Privacy Policy</a>
            </p>
        </div>`;

export const WELCOME_TEMPLATE_INFLUENCER = `
        <div class="header">
            <h1>Welcome to WebTrend</h1>
            <p>Your Creator Journey Begins Now</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <h2>Hey {{USER_NAME}}! ✨</h2>
                <p>Welcome to WebTrend, where creators like you connect with amazing brands and turn your passion into profit. Get ready to take your influence to the next level!</p>
            </div>
            
            <div class="verification-box">
                <h3 style="color: ${INFLUENCER_COLORS.primary}; margin-bottom: 16px;">Verify Your Account</h3>
                <p style="margin-bottom: 16px;">Please use this verification code to activate your creator account:</p>
                <div class="verification-code">{{VERIFICATION_CODE}}</div>
                <p style="color: #718096; font-size: 14px; margin-top: 16px;">This code expires in 10 minutes</p>
            </div>
            
            <div class="features">
                <h3 style="color: #2d3748; margin-bottom: 20px; text-align: center;">What awaits you on WebTrend:</h3>
                
                <div class="feature-item">
                    <div class="feature-icon">💎</div>
                    <div class="feature-content">
                        <h3>Premium Brand Partnerships</h3>
                        <p>Connect with top brands looking for creators like you</p>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">🎨</div>
                    <div class="feature-content">
                        <h3>Creative Freedom</h3>
                        <p>Maintain your authentic voice while creating sponsored content</p>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">📈</div>
                    <div class="feature-content">
                        <h3>Grow Your Influence</h3>
                        <p>Access tools and insights to expand your reach and engagement</p>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">💸</div>
                    <div class="feature-content">
                        <h3>Fair Compensation</h3>
                        <p>Get paid what you're worth with transparent pricing</p>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{PLATFORM_URL}}" class="button">Start Creating</a>
            </div>
            
            <div class="warning-box">
                <p><strong>Pro Tip:</strong> Complete your profile and connect your social media accounts to get discovered by brands faster!</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="#">📘</a>
                <a href="#">📸</a>
                <a href="#">🐦</a>
                <a href="#">🎵</a>
            </div>
            <p>© 2024 WebTrend. All rights reserved.</p>
            <p>Empowering creators worldwide</p>
            <p style="font-size: 12px; margin-top: 16px;">
                You received this email because you joined WebTrend as a creator.
                <br><a href="#" style="color: ${INFLUENCER_COLORS.primary};">Unsubscribe</a> | <a href="#" style="color: ${INFLUENCER_COLORS.primary};">Privacy Policy</a>
            </p>
        </div>`;

export const PASSWORD_RESET_TEMPLATE = `
        <div class="header">
            <h1>Password Reset Request</h1>
            <p>Secure Your Account</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <h2>Password Reset 🔐</h2>
                <p>You requested to reset your password. Use the verification code below to proceed with resetting your password.</p>
            </div>
            
            <div class="verification-box">
                <h3 style="color: {{THEME_COLOR}}; margin-bottom: 16px;">Your Reset Code</h3>
                <div class="verification-code">{{RESET_CODE}}</div>
                <p style="color: #718096; font-size: 14px; margin-top: 16px;">This code expires in 1 minute for security</p>
            </div>
            
            <div class="warning-box" style="background: #fed7d7; border-color: #fc8181;">
                <p style="color: #822727;"><strong>Security Alert:</strong> If you didn't request this password reset, please ignore this email or contact our support team immediately.</p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{RESET_URL}}" class="button">Reset Password</a>
            </div>
            
            <div class="divider"></div>
            
            <div style="text-align: center; color: #718096;">
                <p>Need help? Contact our support team</p>
                <p><a href="mailto:support@webtrend.com" style="color: {{THEME_COLOR}};">support@webtrend.com</a></p>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 WebTrend. All rights reserved.</p>
            <p style="font-size: 12px; margin-top: 16px;">
                This is an automated security email from WebTrend.
                <br><a href="#" style="color: {{THEME_COLOR}};">Privacy Policy</a> | <a href="#" style="color: {{THEME_COLOR}};">Security Center</a>
            </p>
        </div>`;

export const ACCOUNT_ACTIVATION_TEMPLATE = `
        <div class="header">
            <h1>Account Activated! 🎉</h1>
            <p>Welcome to the WebTrend Community</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <h2>You're All Set! ✅</h2>
                <p>Congratulations! Your WebTrend account has been successfully activated. You now have full access to all platform features.</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
                <h3 style="margin-bottom: 16px; font-size: 20px;">🚀 Your Journey Starts Now!</h3>
                <p style="opacity: 0.9; margin: 0;">Explore campaigns, connect with {{USER_TYPE}}s, and start building meaningful partnerships.</p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{PLATFORM_URL}}" class="button">Explore Platform</a>
            </div>
            
            <div class="features">
                <h3 style="color: #2d3748; margin-bottom: 20px; text-align: center;">Quick Start Guide:</h3>
                
                <div class="feature-item">
                    <div class="feature-icon">1️⃣</div>
                    <div class="feature-content">
                        <h3>Complete Your Profile</h3>
                        <p>Add your details, portfolio, and preferences to get discovered</p>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">2️⃣</div>
                    <div class="feature-content">
                        <h3>{{STEP_2_TITLE}}</h3>
                        <p>{{STEP_2_DESCRIPTION}}</p>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">3️⃣</div>
                    <div class="feature-content">
                        <h3>{{STEP_3_TITLE}}</h3>
                        <p>{{STEP_3_DESCRIPTION}}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="#">📘</a>
                <a href="#">📸</a>
                <a href="#">🐦</a>
                <a href="#">💼</a>
            </div>
            <p>© 2024 WebTrend. All rights reserved.</p>
            <p style="font-size: 12px; margin-top: 16px;">
                Questions? We're here to help!
                <br><a href="mailto:support@webtrend.com" style="color: {{THEME_COLOR}};">support@webtrend.com</a>
            </p>
        </div>`;

// Template generation functions
export function generateWelcomeEmail(
  userType: 'brand' | 'influencer',
  userName: string,
  verificationCode: string,
  platformUrl: string
): string {
  const isInfluencer = userType === 'influencer';
  const colors = isInfluencer ? INFLUENCER_COLORS : BRAND_COLORS;
  const template = isInfluencer
    ? WELCOME_TEMPLATE_INFLUENCER
    : WELCOME_TEMPLATE_BRAND;

  return BASE_TEMPLATE.replace(
    '{{TITLE}}',
    `Welcome to WebTrend - ${isInfluencer ? 'Creator' : 'Brand'} Account`
  )
    .replace(
      '{{HEADER_BACKGROUND}}',
      isInfluencer ? INFLUENCER_COLORS.gradient : BRAND_COLORS.primary
    )
    .replace('{{BOX_BACKGROUND}}', colors.light)
    .replace('{{BOX_BORDER}}', colors.primary)
    .replace('{{CODE_COLOR}}', colors.primary)
    .replace(
      '{{BUTTON_BACKGROUND}}',
      isInfluencer ? INFLUENCER_COLORS.gradient : BRAND_COLORS.primary
    )
    .replace('{{ICON_BACKGROUND}}', colors.light)
    .replace('{{SOCIAL_BACKGROUND}}', colors.primary)
    .replace(
      '{{CONTENT}}',
      template
        .replace('{{USER_NAME}}', userName)
        .replace('{{VERIFICATION_CODE}}', verificationCode)
        .replace('{{PLATFORM_URL}}', platformUrl)
    );
}

export function generatePasswordResetEmail(
  userType: 'brand' | 'influencer',
  resetCode: string,
  resetUrl: string
): string {
  const isInfluencer = userType === 'influencer';
  const themeColor = isInfluencer
    ? INFLUENCER_COLORS.primary
    : BRAND_COLORS.primary;

  return BASE_TEMPLATE.replace('{{TITLE}}', 'Password Reset - WebTrend')
    .replace(
      '{{HEADER_BACKGROUND}}',
      isInfluencer ? INFLUENCER_COLORS.gradient : BRAND_COLORS.primary
    )
    .replace('{{BOX_BACKGROUND}}', '#fef5e7')
    .replace('{{BOX_BORDER}}', '#f6ad55')
    .replace('{{CODE_COLOR}}', themeColor)
    .replace(
      '{{BUTTON_BACKGROUND}}',
      isInfluencer ? INFLUENCER_COLORS.gradient : BRAND_COLORS.primary
    )
    .replace('{{ICON_BACKGROUND}}', '#fef5e7')
    .replace('{{SOCIAL_BACKGROUND}}', themeColor)
    .replace(
      '{{CONTENT}}',
      PASSWORD_RESET_TEMPLATE.replace(/{{THEME_COLOR}}/g, themeColor)
        .replace('{{RESET_CODE}}', resetCode)
        .replace('{{RESET_URL}}', resetUrl)
    );
}

export function generateAccountActivationEmail(
  userType: 'brand' | 'influencer',
  platformUrl: string
): string {
  const isInfluencer = userType === 'influencer';
  const themeColor = isInfluencer
    ? INFLUENCER_COLORS.primary
    : BRAND_COLORS.primary;

  const step2Title = isInfluencer
    ? 'Browse Campaigns'
    : 'Create Your First Campaign';
  const step2Description = isInfluencer
    ? 'Discover brand partnerships that match your niche and audience'
    : 'Launch your first influencer marketing campaign';

  const step3Title = isInfluencer ? 'Start Collaborating' : 'Find Influencers';
  const step3Description = isInfluencer
    ? 'Apply to campaigns and start creating amazing content'
    : 'Discover and connect with creators who align with your brand';

  return BASE_TEMPLATE.replace('{{TITLE}}', 'Account Activated - WebTrend')
    .replace(
      '{{HEADER_BACKGROUND}}',
      isInfluencer ? INFLUENCER_COLORS.gradient : BRAND_COLORS.primary
    )
    .replace('{{BOX_BACKGROUND}}', '#f0fff4')
    .replace('{{BOX_BORDER}}', '#48bb78')
    .replace('{{CODE_COLOR}}', themeColor)
    .replace(
      '{{BUTTON_BACKGROUND}}',
      isInfluencer ? INFLUENCER_COLORS.gradient : BRAND_COLORS.primary
    )
    .replace('{{ICON_BACKGROUND}}', '#f0fff4')
    .replace('{{SOCIAL_BACKGROUND}}', themeColor)
    .replace(
      '{{CONTENT}}',
      ACCOUNT_ACTIVATION_TEMPLATE.replace(/{{THEME_COLOR}}/g, themeColor)
        .replace('{{PLATFORM_URL}}', platformUrl)
        .replace('{{USER_TYPE}}', isInfluencer ? 'brand' : 'influencer')
        .replace('{{STEP_2_TITLE}}', step2Title)
        .replace('{{STEP_2_DESCRIPTION}}', step2Description)
        .replace('{{STEP_3_TITLE}}', step3Title)
        .replace('{{STEP_3_DESCRIPTION}}', step3Description)
    );
}
