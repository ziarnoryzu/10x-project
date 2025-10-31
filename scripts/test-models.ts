import { ModelTester } from "../src/lib/services/ai/model-tester.ts";
import { MessagesMapper } from "../src/lib/services/ai/messages.mapper.ts";

const API_KEY = process.env.OPENROUTER_API_KEY || "";

const testCases = [
  {
    name: "1-day trip (short)",
    prompt: "Plan 1-day trip to Paris with main attractions",
  },
  {
    name: "5-day trip (medium)",
    prompt: "Plan 5-day trip to Japan including Tokyo, Kyoto, and Osaka with daily itineraries",
  },
  {
    name: "10-day trip (long)",
    prompt:
      "Plan 10-day trip to Italy including Rome, Florence, Venice, Milan, and Amalfi Coast with detailed daily itineraries and restaurant recommendations",
  },
  {
    name: "15-day trip (very long)",
    prompt:
      "Plan 15-day trip across Europe including Paris, Amsterdam, Berlin, Prague, Vienna, and Rome with detailed daily itineraries, transportation between cities, accommodation recommendations, and estimated budget",
  },
];

interface TestSummary {
  testName: string;
  results: {
    modelName: string;
    success: boolean;
    durationS: number;
    cost: number;
    tokensIn: number;
    tokensOut: number;
    error?: string;
  }[];
  bestModel: string | null;
  bestCost: number;
}

async function runTests() {
  if (!API_KEY) {
    console.error("❌ OPENROUTER_API_KEY environment variable not set!");
    process.exit(1);
  }

  const tester = new ModelTester();
  const mapper = new MessagesMapper();
  const summaries: TestSummary[] = [];

  console.log("🚀 Starting model comparison tests...\n");
  console.log("Models to test:");
  console.log("  1. Claude 3.5 Haiku (current)");
  console.log("  2. Gemini 1.5 Flash");
  console.log("  3. GPT-4o Mini");
  console.log("  4. Claude 3 Haiku\n");

  for (const testCase of testCases) {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`📝 Test: ${testCase.name}`);
    console.log(`   Prompt: "${testCase.prompt}"`);
    console.log(`${"=".repeat(80)}\n`);

    const messages = mapper.mapToOpenRouterFormat([{ role: "user", content: testCase.prompt }]);

    const results = await tester.testAllModels(messages, API_KEY);
    const bestModel = tester.getBestModel(results);

    console.log("\n📊 Results:\n");

    const testResults = results.map((result) => {
      const status = result.success ? "✅" : "❌";
      console.log(`${status} ${result.modelName}`);

      if (result.success) {
        console.log(`   Duration: ${(result.durationMs / 1000).toFixed(1)}s`);
        console.log(`   Tokens: ${result.inputTokens} in / ${result.outputTokens} out`);
        console.log(`   Cost: $${result.estimatedCost.toFixed(4)}`);
        console.log(`   Response length: ${result.responseLength} chars`);
      } else {
        console.log(`   Error: ${result.error}`);
      }
      console.log("");

      return {
        modelName: result.modelName,
        success: result.success,
        durationS: result.durationMs / 1000,
        cost: result.estimatedCost,
        tokensIn: result.inputTokens,
        tokensOut: result.outputTokens,
        error: result.error,
      };
    });

    if (bestModel) {
      console.log(`\n🏆 Best model for this test: ${bestModel.modelName}`);
      console.log(`   Cost: $${bestModel.estimatedCost.toFixed(4)}`);
      console.log(`   Duration: ${(bestModel.durationMs / 1000).toFixed(1)}s\n`);
    }

    summaries.push({
      testName: testCase.name,
      results: testResults,
      bestModel: bestModel?.modelName || null,
      bestCost: bestModel?.estimatedCost || 0,
    });
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log("📈 FINAL SUMMARY");
  console.log(`${"=".repeat(80)}\n`);

  summaries.forEach((summary) => {
    console.log(`${summary.testName}:`);
    console.log(`  🏆 Winner: ${summary.bestModel || "None"}`);
    if (summary.bestCost > 0) {
      console.log(`  💰 Cost: $${summary.bestCost.toFixed(4)}`);
    }
    console.log("");
  });

  const allSuccessful = summaries.every((s) => s.results.some((r) => r.success));

  if (allSuccessful) {
    const winnerCounts = new Map<string, number>();
    summaries.forEach((s) => {
      if (s.bestModel) {
        winnerCounts.set(s.bestModel, (winnerCounts.get(s.bestModel) || 0) + 1);
      }
    });

    const overallWinner = Array.from(winnerCounts.entries()).sort((a, b) => b[1] - a[1])[0];

    const modelMap: Record<string, string> = {
      "Claude 3.5 Haiku (Current)": "anthropic/claude-3.5-haiku",
      "Gemini 1.5 Flash": "google/gemini-flash-1.5",
      "GPT-4o Mini": "openai/gpt-4o-mini",
      "Claude 3 Haiku": "anthropic/claude-3-haiku",
    };

    console.log("🎯 OVERALL RECOMMENDATION:\n");
    console.log(`   Model: ${overallWinner[0]}`);
    console.log(`   Won ${overallWinner[1]} out of ${summaries.length} tests`);
    console.log("\n✅ Update your .env file:");
    console.log(`   OPENROUTER_MODEL="${modelMap[overallWinner[0]] || ""}"`);
  }

  console.log("\n✨ Testing complete!");
}

runTests().catch(console.error);
