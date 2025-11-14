export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelTestConfig {
  model: string;
  name: string;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
}

export interface ModelTestResult {
  model: string;
  modelName: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  success: boolean;
  error?: string;
  responseLength: number;
  responsePreview: string;
}

const MODELS_TO_TEST: ModelTestConfig[] = [
  {
    model: "openai/gpt-4o-mini",
    name: "GPT-4o Mini ⭐ RECOMMENDED",
    inputPrice: 0.15,
    outputPrice: 0.6,
    contextWindow: 128000,
  },
  {
    model: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    inputPrice: 0.25,
    outputPrice: 1.25,
    contextWindow: 200000,
  },
  {
    model: "anthropic/claude-3.5-haiku",
    name: "Claude 3.5 Haiku (Current)",
    inputPrice: 1.0,
    outputPrice: 5.0,
    contextWindow: 200000,
  },
];

export class ModelTester {
  async testModel(
    modelConfig: ModelTestConfig,
    systemPrompt: string,
    userPrompt: string,
    apiKey: string
  ): Promise<ModelTestResult> {
    const startTime = Date.now();

    try {
      // Make direct API call to OpenRouter with custom model
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelConfig.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const responseJson = await response.json();
      const content = responseJson.choices[0].message.content;
      const durationMs = Date.now() - startTime;

      // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
      const inputTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);
      const outputTokens = Math.ceil(content.length / 4);
      const totalTokens = inputTokens + outputTokens;

      const estimatedCost =
        (inputTokens / 1000000) * modelConfig.inputPrice + (outputTokens / 1000000) * modelConfig.outputPrice;

      return {
        model: modelConfig.model,
        modelName: modelConfig.name,
        durationMs,
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost,
        success: true,
        responseLength: content.length,
        responsePreview: content.slice(0, 200),
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      return {
        model: modelConfig.model,
        modelName: modelConfig.name,
        durationMs,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseLength: 0,
        responsePreview: "",
      };
    }
  }

  async testAllModels(systemPrompt: string, userPrompt: string, apiKey: string): Promise<ModelTestResult[]> {
    const results: ModelTestResult[] = [];

    for (const modelConfig of MODELS_TO_TEST) {
      console.log(`Testing model: ${modelConfig.name}...`);
      const result = await this.testModel(modelConfig, systemPrompt, userPrompt, apiKey);
      results.push(result);

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return results;
  }

  getBestModel(results: ModelTestResult[]): ModelTestResult | null {
    const successfulResults = results.filter((r) => r.success);

    if (successfulResults.length === 0) {
      return null;
    }

    return successfulResults.sort((a, b) => a.estimatedCost - b.estimatedCost)[0];
  }
}
