import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/configProvider';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

export const generateProposal = async (
  campaignName: string,
  campaignDescription: string,
  campaignCategory?: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Generate a professional and personalized campaign application proposal for the following campaign:
      
      Campaign Name: ${campaignName}
      ${campaignCategory ? `Campaign Category: ${campaignCategory}` : ''}
      Campaign Description: ${campaignDescription}
      
      Instructions:
      - The proposal should be 2-3 paragraphs long
      - Be personable and enthusiastic but professional
      - Mention specific details from the campaign description where relevant
      - Express interest in collaborating with the brand
      - Suggest how you (as an influencer) could add value to their campaign
      - Avoid generic statements that could apply to any campaign
      - Don't include placeholders for the influencer to fill in
      
      Format the response as a complete proposal, ready to be submitted.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error: any) {
    console.error('Error generating content with Gemini:', error);
    throw new Error(`Failed to generate proposal: ${error.message}`);
  }
};

export const generateContentSuggestions = async (
  campaignName: string,
  campaignDescription: string,
  contentRequirements: string = '',
  platforms: string[] = [],
  campaignCategory?: string,
  productDetails?: {
    name?: string;
    description?: string;
    price?: string | number;
    category?: string;
  }
): Promise<{ title: string; description: string; tips: string[] }[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const platformsText =
      platforms.length > 0
        ? `Platforms: ${platforms.join(', ')}`
        : 'Various social media platforms';

    let productDetailsText = '';
    if (productDetails) {
      productDetailsText = `
      Product Information:
      ${productDetails.name ? `Product Name: ${productDetails.name}` : ''}
      ${
        productDetails.description
          ? `Product Description: ${productDetails.description}`
          : ''
      }
      ${
        productDetails.category
          ? `Product Category: ${productDetails.category}`
          : ''
      }
      ${productDetails.price ? `Product Price: ${productDetails.price}` : ''}
      `;
    }

    const prompt = `
      Generate 5 creative content ideas for an influencer who has been accepted to work on the following campaign:
      
      Campaign Name: ${campaignName}
      ${campaignCategory ? `Campaign Category: ${campaignCategory}` : ''}
      Campaign Description: ${campaignDescription}
      ${
        contentRequirements
          ? `Content Requirements: ${contentRequirements}`
          : ''
      }
      ${platformsText}
      ${productDetailsText}
      
      Instructions:
      - Create 5 distinct content ideas that align with the campaign goals
      - Each idea should have a catchy title, brief description (2-3 sentences), and 3 practical tips for execution
      - Ideas should be platform-appropriate and match the campaign's tone
      - Include a mix of formats (e.g., videos, photos, stories, reels)
      - Be specific and actionable with each suggestion
      - Focus on authenticity and engagement potential
      ${
        productDetails
          ? '- Highlight the product features and benefits where appropriate'
          : ''
      }
      
      Format each idea as a JSON object with "title", "description", and "tips" (array of strings) fields.
      Return an array of these 5 JSON objects.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);

    if (!jsonMatch) {
      throw new Error('Failed to parse content suggestions from AI response');
    }

    try {
      const suggestions = JSON.parse(jsonMatch[0]);
      return suggestions.slice(0, 5);
    } catch (parseError) {
      console.error('Error parsing JSON from AI response:', parseError);
      throw new Error(
        'Failed to parse content suggestions: Invalid JSON format'
      );
    }
  } catch (error: any) {
    console.error('Error generating content suggestions with Gemini:', error);
    throw new Error(`Failed to generate content suggestions: ${error.message}`);
  }
};
