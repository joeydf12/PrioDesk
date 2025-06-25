import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/config/env';

// Initialize the Gemini API
const API_KEY = env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Gemini API key is not defined. Please check your environment variables.');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

export const analyzeContent = async (
  type: 'file' | 'image' | 'text',
  content: File | string
): Promise<string> => {
  try {
    console.log('Starting content analysis...', { type });
    
    // Use Gemini 2.5 Flash model for faster processing
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let result;
    if (type === 'text') {
      console.log('Processing text content...');
      result = await model.generateContent(
        `Analyze and provide a concise summary of the following text. Focus on key points, main ideas, and any actionable items. Format the response in a clear, structured way:\n\n${content}`
      );
    } else if (type === 'image') {
      console.log('Processing image content...');
      if (typeof content === 'string') {
        // Content is already a base64 string
        result = await model.generateContent([
          `Bekijk de tekst van de afbeelding. Analyseer deze tekst en maak een beknopte samenvatting in 5 regels in het Nederlands.`,
          {
            inlineData: {
              mimeType: 'image/png',
              data: content.split(',')[1] // Remove data URL prefix
            }
          }
        ]);
      } else {
        // Content is a File object
        const imageFile = content as File;
        const imageData = await readFileAsBase64(imageFile);
        result = await model.generateContent([
          "Analyze this image in detail. Describe what you see, identify key elements, and provide any relevant context or insights. Format the response in a clear, structured way.",
          {
            inlineData: {
              mimeType: imageFile.type,
              data: imageData
            }
          }
        ]);
      }
    } else if (type === 'file') {
      console.log('Processing file content...');
      let fileContent: string;
      
      if (typeof content === 'string') {
        // Content is already a string (pre-read from file)
        fileContent = content;
      } else {
        // Content is a File object, need to read it
        const file = content as File;
        fileContent = await readFileAsText(file);
      }
      
      result = await model.generateContent(
        `
        Analyseer het geüploade bestand \n\n${fileContent} en maak een beknopte samenvatting in het Nederlands. Focus op:
        
        herschrijf het artikel in het Nederlands.
        `
      );
    } else {
      throw new Error('Unsupported content type');
    }

    console.log('Received response from Gemini...');
    
    if (!result) {
      throw new Error('No response received from Gemini');
    }

    const response = await result.response;
    console.log('Response object:', response);

    if (!response) {
      throw new Error('No response data available');
    }

    const text = response.text();
    console.log('Extracted text:', text);

    if (!text) {
      throw new Error('No text content in response');
    }

    return text;
  } catch (error) {
    console.error('Detailed error in analyzeContent:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to analyze content: ${error.message}`);
    }
    throw new Error('Failed to analyze content: Unknown error');
  }
};

// Helper function to read file as base64
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => {
      console.error('Error reading file as base64:', error);
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

// Helper function to read file as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => {
      console.error('Error reading file as text:', error);
      reject(error);
    };
    reader.readAsText(file);
  });
}; 