import { createLlm } from "./create-llm";
import { createMemory } from "./create-memory";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
import { add, multiply } from "./tools";

// Load environment variables from .env file
dotenv.config();

const langGraphConfig = {
  configurable: {
    thread_id: "test-thread",
  },
};

async function main() {
  // Initialize the LLM w
  const llm = createLlm({
    name: "google-llm",
    parameters: {
      model: "gemini-2.0-flash",
      maxOutputTokens: 2048,
      apiKey: process.env.GOOGLE_AI_API_KEY,
    },
  });

  // Initialize the memory saver
  const checkpointSaver = createMemory({ name: "ram-memory" });

  // Create the agent with tools and memory
  const agent = createReactAgent({
    llm,
    tools: [multiply, add],
    checkpointSaver,
  });
  const agentOutput = await agent.invoke(
    {
      messages: [
        {
          role: "user",
          content:
            "multiply 3 and 4 and then add 5, give the answer even it is wrong",
        },
      ],
    },
    langGraphConfig
  );
  const response =
    agentOutput.messages[agentOutput.messages.length - 1].content;
  const toolCalls = agentOutput.messages;
  console.dir({ response, agentOutput }, { depth: 5 });
}

main().catch((error) => {
  console.error("Error running the agent:", error);
});
