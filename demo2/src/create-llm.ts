import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogle } from "@langchain/google-gauth";

const supportedLlmTypes = ["ollama-llm", "openai-llm", "google-llm"] as const;

type TLLm = {
  name: (typeof supportedLlmTypes)[number];
  parameters: Record<string, unknown>;
};

export function createLlm(data: TLLm) {
  if (!supportedLlmTypes.includes(data.name)) {
    throw new Error(`LLM type ${data.name} is not supported`);
  }
  if (data.name === "ollama-llm") return new ChatOllama(data.parameters);
  else if (data.name === "openai-llm") return new ChatOpenAI(data.parameters);
  else if (data.name === "google-llm") {
    return new ChatGoogle(data.parameters);
  }
  return new ChatGoogle(data.parameters);
}
