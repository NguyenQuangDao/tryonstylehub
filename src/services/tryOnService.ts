export interface TryOnRequest {
  model_image: string;
  garment_image: string;
  garment_photo_type: string;
  category: string;
  mode: string;
  segmentation_free: boolean;
  seed: number;
  num_samples: number;
  api_key: string;
  model_name?: string;
}

export interface TryOnResponse {
  output: string[];
  error?: string;
  requiresApiKey?: boolean;
}

export interface TryOnService {
  generateTryOn: (request: TryOnRequest) => Promise<TryOnResponse>;
  generateComparison: (request: TryOnRequest, model1: string, model2: string) => Promise<TryOnResponse>;
}

export const tryOnService: TryOnService = {
  /**
   * Generate single try-on result
   */
  async generateTryOn(request: TryOnRequest): Promise<TryOnResponse> {
    const response = await fetch('/api/tryon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API request failed with status ${response.status}`);
    }

    return data;
  },

  /**
   * Generate comparison between two models
   */
  async generateComparison(
    baseRequest: TryOnRequest, 
    model1: string, 
    model2: string
  ): Promise<TryOnResponse> {
    // Run both selected models in parallel for comparison
    const [model1Response, model2Response] = await Promise.all([
      fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseRequest, model_name: model1 }),
      }),
      fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseRequest, model_name: model2 }),
      })
    ]);

    const [model1Data, model2Data] = await Promise.all([
      model1Response.json(),
      model2Response.json()
    ]);

    // Check for errors in either response
    if (!model1Response.ok) {
      throw new Error(`${model1} API failed: ${model1Data.error || model1Response.statusText}`);
    }
    if (!model2Response.ok) {
      throw new Error(`${model2} API failed: ${model2Data.error || model2Response.statusText}`);
    }

    // Combine results from both APIs
    const model1Results = model1Data.output || [];
    const model2Results = model2Data.output || [];
    
    return {
      output: [...model1Results, ...model2Results],
    };
  },
};
