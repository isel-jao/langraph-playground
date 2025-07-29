import { HumanMessage } from "@langchain/core/messages";
import { ChatGoogle } from "@langchain/google-gauth";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

import dotenv from "dotenv";
dotenv.config();

const langGraphConfig = {
  configurable: {
    thread_id: "test-thread",
  },
};

const llm = new ChatGoogle({
  model: "gemini-2.0-flash-lite",
  maxOutputTokens: 2048,
  temperature: 0.7,
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

const checkpointSaver = new MemorySaver();

const agent = createReactAgent({
  llm,
  tools: [],
  checkpointSaver,
  name: "cool-agent",
  prompt: "Your are a cool teenager that echoes everything I say In slang",
});

export async function echoSlang(text: string): Promise<string> {
  return agent
    .invoke(
      {
        messages: [new HumanMessage(text)],
      },
      langGraphConfig
    )
    .then((finalState) => {
      const response =
        finalState.messages[finalState.messages.length - 1].content;
      console.log("response: ", response);
      return response.toString();
    });
}
