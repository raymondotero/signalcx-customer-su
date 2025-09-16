/**
 * Spark AI Utility Module
 * Provides centralized access to Spark AI features with comprehensive error handling
 */

export interface SparkAIError {
  message: string;
  details: string;
  code: 'NOT_INITIALIZED' | 'NOT_AVAILABLE' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'UNKNOWN';
  canRetry: boolean;
}

export interface SparkAIStatus {
  available: boolean;
  initialized: boolean;
  llmReady: boolean;
  promptReady: boolean;
  error?: string;
}

/**
 * Check if Spark AI is ready for use
 */
export const getSparkAIStatus = (): SparkAIStatus => {
  try {
    if (typeof window === 'undefined') {
      return {
        available: false,
        initialized: false,
        llmReady: false,
        promptReady: false,
        error: 'Server-side rendering - browser environment required'
      };
    }

    // Check if we're in the Spark environment by looking for the global spark object
    const spark = (window as any).spark;
    
    if (!spark) {
      // Check if we're in development/preview mode where Spark might not be available
      const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
      const isPreview = window.location.hostname.includes('preview') || window.location.hostname.includes('staging');
      
      return {
        available: false,
        initialized: false,
        llmReady: false,
        promptReady: false,
        error: isDev || isPreview ? 
          'Development mode - Spark runtime not available (this is normal)' : 
          'Spark runtime not initialized - please refresh the page'
      };
    }

    const llmReady = !!(spark.llm && typeof spark.llm === 'function');
    const promptReady = !!(spark.llmPrompt && typeof spark.llmPrompt === 'function');

    return {
      available: true,
      initialized: true,
      llmReady,
      promptReady,
      error: (!llmReady || !promptReady) ? 'Spark services not fully loaded' : undefined
    };
  } catch (error) {
    return {
      available: false,
      initialized: false,
      llmReady: false,
      promptReady: false,
      error: error instanceof Error ? error.message : 'Unknown error checking Spark status'
    };
  }
};

/**
 * Get Spark AI instance with proper error handling
 */
export const getSparkAI = () => {
  const status = getSparkAIStatus();
  
  if (!status.available) {
    const error: SparkAIError = {
      message: 'Spark runtime not available',
      details: status.error || 'Unknown availability issue',
      code: 'NOT_AVAILABLE',
      canRetry: true
    };
    throw error;
  }

  if (!status.initialized) {
    const error: SparkAIError = {
      message: 'Spark runtime not initialized',
      details: 'Please refresh the page to reload the AI services',
      code: 'NOT_INITIALIZED',
      canRetry: true
    };
    throw error;
  }

  if (!status.llmReady || !status.promptReady) {
    const error: SparkAIError = {
      message: 'Spark AI services not ready',
      details: status.error || 'AI prompt or language model service is not available',
      code: 'NOT_AVAILABLE',
      canRetry: true
    };
    throw error;
  }

  return (window as any).spark;
};

/**
 * Create an AI prompt with proper error handling
 */
export const createAIPrompt = (template: TemplateStringsArray, ...values: any[]): string => {
  try {
    const spark = getSparkAI();
    return spark.llmPrompt(template, ...values);
  } catch (error) {
    console.error('Error creating AI prompt:', error);
    throw error;
  }
};

/**
 * Call Spark AI with timeout and retry logic
 */
export const callSparkAI = async (
  prompt: string, 
  model: string = 'gpt-4o', 
  jsonMode: boolean = false,
  timeoutMs: number = 30000
): Promise<string> => {
  try {
    const spark = getSparkAI();
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        const error: SparkAIError = {
          message: 'AI request timeout',
          details: `Request took longer than ${timeoutMs}ms to complete`,
          code: 'TIMEOUT',
          canRetry: true
        };
        reject(error);
      }, timeoutMs);
    });

    // Race between AI call and timeout
    const response = await Promise.race([
      spark.llm(prompt, model, jsonMode),
      timeoutPromise
    ]);

    if (typeof response !== 'string') {
      const error: SparkAIError = {
        message: 'Invalid AI response',
        details: 'Expected string response from AI service',
        code: 'INVALID_RESPONSE',
        canRetry: true
      };
      throw error;
    }

    return response;
  } catch (error) {
    console.error('Spark AI call failed:', error);
    
    // If it's already a SparkAIError, re-throw it
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }
    
    // Convert other errors to SparkAIError
    const sparkError: SparkAIError = {
      message: error instanceof Error ? error.message : 'Unknown AI error',
      details: 'Please try again or check your connection',
      code: 'UNKNOWN',
      canRetry: true
    };
    throw sparkError;
  }
};

/**
 * Generate AI recommendations with comprehensive error handling
 */
export const generateAIRecommendations = async (
  prompt: string,
  timeoutMs: number = 30000
): Promise<{ recommendations: any[], analysis: any }> => {
  try {
    const response = await callSparkAI(prompt, 'gpt-4o', true, timeoutMs);
    const parsed = JSON.parse(response);
    
    return {
      recommendations: parsed.recommendations || [],
      analysis: parsed.signalAnalysis || parsed.analysis || {}
    };
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    throw error;
  }
};

/**
 * Test Spark AI connectivity
 */
export const testSparkAI = async (): Promise<boolean> => {
  try {
    const status = getSparkAIStatus();
    if (!status.available || !status.initialized || !status.llmReady || !status.promptReady) {
      return false;
    }

    const spark = getSparkAI();
    const prompt = spark.llmPrompt`Test connection for SignalCX. Respond with JSON containing: {"status": "connected", "message": "SignalCX AI ready"}`;
    const response = await spark.llm(prompt, 'gpt-4o-mini', true);
    
    const parsed = JSON.parse(response);
    return !!(parsed.status === 'connected' && parsed.message?.includes('SignalCX'));
  } catch (error) {
    console.error('Spark AI test failed:', error);
    return false;
  }
};

/**
 * Wait for Spark to be ready with polling
 */
export const waitForSpark = async (maxWaitMs: number = 10000, pollIntervalMs: number = 500): Promise<boolean> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    const status = getSparkAIStatus();
    if (status.available && status.initialized && status.llmReady && status.promptReady) {
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }
  
  return false;
};

/**
 * Format SparkAIError for user display
 */
export const formatSparkError = (error: SparkAIError | Error | unknown): { message: string; details: string; canRetry: boolean } => {
  if (error && typeof error === 'object' && 'code' in error) {
    const sparkError = error as SparkAIError;
    return {
      message: sparkError.message,
      details: sparkError.details,
      canRetry: sparkError.canRetry
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      details: 'Please try again or refresh the page',
      canRetry: true
    };
  }
  
  return {
    message: 'Unknown error occurred',
    details: 'Please try again or contact support',
    canRetry: true
  };
};