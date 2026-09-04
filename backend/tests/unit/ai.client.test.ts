import { GeminiClient } from '../../src/modules/ai/ai.client';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Mock the GoogleGenerativeAI library
jest.mock('@google/generative-ai', () => {
  const mockGenerateContent = jest.fn();
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
    _mockGenerateContent: mockGenerateContent,
  };
});

// Extract the mock for assertions
const { _mockGenerateContent } = require('@google/generative-ai');

describe('GeminiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('initializes with provided API key', () => {
      new GeminiClient('test-key');
      expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-key');
    });

    it('initializes with MISSING_KEY when API key is not provided', () => {
      new GeminiClient(undefined);
      expect(GoogleGenerativeAI).toHaveBeenCalledWith('MISSING_KEY');
    });
  });

  describe('generateText', () => {
    it('calls the underlying generative model and returns text', async () => {
      const client = new GeminiClient('test-key');
      _mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => '{"mock": "response"}' },
      });

      const result = await client.generateText('test prompt', { jsonOutput: true, temperature: 0.5 });
      
      expect(_mockGenerateContent).toHaveBeenCalledWith('test prompt');
      expect(result).toBe('{"mock": "response"}');
    });

    it('throws error when Gemini returns empty response', async () => {
      const client = new GeminiClient('test-key');
      _mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => '' },
      });

      await expect(client.generateText('test prompt')).rejects.toThrow('Gemini returned empty response text');
    });

    it('throws error when generateContent throws', async () => {
      const client = new GeminiClient('test-key');
      _mockGenerateContent.mockRejectedValueOnce(new Error('API error'));

      await expect(client.generateText('test prompt')).rejects.toThrow('API error');
    });
  });
});
