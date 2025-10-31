import type { APIRoute } from "astro";
import { ModelTester } from "../../../lib/services/ai/model-tester";

export const prerender = false;

const testPrompts = {
  short: "Plan 1-day trip to Paris with main attractions",
  medium: "Plan 5-day trip to Japan including Tokyo, Kyoto, and Osaka with daily itineraries",
  long: "Plan 10-day trip to Italy including Rome, Florence, Venice, Milan, and Amalfi Coast with detailed daily itineraries and restaurant recommendations",
  veryLong:
    "Plan 15-day trip across Europe including Paris, Amsterdam, Berlin, Prague, Vienna, and Rome with detailed daily itineraries, transportation between cities, accommodation recommendations, and estimated budget",
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const apiKey = import.meta.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OpenRouter API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const testType = body.testType || "medium";
    const userPrompt = testPrompts[testType as keyof typeof testPrompts] || testPrompts.medium;
    const systemPrompt = "You are a helpful travel planning assistant.";

    const tester = new ModelTester();
    const results = await tester.testAllModels(systemPrompt, userPrompt, apiKey);
    const bestModel = tester.getBestModel(results);

    return new Response(
      JSON.stringify(
        {
          testType,
          prompt: userPrompt,
          results: results.map((r) => ({
            model: r.model,
            modelName: r.modelName,
            success: r.success,
            durationMs: r.durationMs,
            durationS: (r.durationMs / 1000).toFixed(1),
            inputTokens: r.inputTokens,
            outputTokens: r.outputTokens,
            totalTokens: r.totalTokens,
            estimatedCost: r.estimatedCost,
            costFormatted: `$${r.estimatedCost.toFixed(4)}`,
            responseLength: r.responseLength,
            responsePreview: r.responsePreview.slice(0, 150) + "...",
            error: r.error,
          })),
          bestModel: bestModel
            ? {
                model: bestModel.model,
                name: bestModel.modelName,
                cost: bestModel.estimatedCost,
                costFormatted: `$${bestModel.estimatedCost.toFixed(4)}`,
                duration: bestModel.durationMs,
                durationS: (bestModel.durationMs / 1000).toFixed(1),
              }
            : null,
          recommendation: bestModel
            ? `Recommended: ${bestModel.modelName} - Cost: $${bestModel.estimatedCost.toFixed(4)}, Duration: ${(bestModel.durationMs / 1000).toFixed(1)}s`
            : "No successful model found",
        },
        null,
        2
      ),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Model testing error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
