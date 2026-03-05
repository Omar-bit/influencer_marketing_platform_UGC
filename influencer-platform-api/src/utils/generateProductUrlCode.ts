import { customAlphabet } from 'nanoid';
import InfluencerApplication from '../models/influencerApplication';

// Create a custom nanoid generator that uses only alphanumeric characters
const generateCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

export async function generateUniqueProductUrlCode(): Promise<string> {
  let code: string;
  let isUnique = false;

  // Keep generating codes until we find a unique one
  while (!isUnique) {
    code = generateCode();
    // Check if the code already exists in the database
    const existingApplication = await InfluencerApplication.findOne({ productUrlCode: code });
    if (!existingApplication) {
      isUnique = true;
      return code;
    }
  }

  // This should never be reached due to the while loop, but TypeScript needs it
  throw new Error('Failed to generate unique product URL code');
} 