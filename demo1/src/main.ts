import { createLlm } from "./create-llm";
import { createMemory } from "./create-memory";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
import { add, multiply } from "./tools";
import { HumanMessage } from "@langchain/core/messages";

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
  const messages = ["multiply 3 and 4", "add previous result with 5"];
  for (const message of messages) {
    console.log("message: ", message);
    // Invoke the agent with the message
    const finalState = await agent.invoke(
      {
        messages: [new HumanMessage(message)],
      },
      langGraphConfig
    );
    console.log(
      "response: ",
      finalState.messages[finalState.messages.length - 1].content
    );
  }
}

main().catch((error) => {
  console.error("Error running the agent:", error);
});
