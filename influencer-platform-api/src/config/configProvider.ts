// filepath: c:\Users\bouas\code\webtrend\influencer-platform\influencer-platform-api\src\config\configProvider.ts
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Gemini API configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
};

// Validate required configurations
const validateConfig = () => {
  const requiredConfigs = ['GEMINI_API_KEY'];
  const missingConfigs = requiredConfigs.filter(
    (configKey) => !config[configKey as keyof typeof config]
  );

  if (missingConfigs.length > 0) {
    console.warn(
      `Warning: Missing required configuration(s): ${missingConfigs.join(', ')}`
    );
  }
};

// Run validation on startup
validateConfig();
