import { MemorySaver } from "@langchain/langgraph";

const supportedMemoryTypes = ["ram-memory"];

type TData = {
  name: (typeof supportedMemoryTypes)[number];
};

export function createMemory(data: TData) {
  if (!supportedMemoryTypes.includes(data.name)) {
    throw new Error(`Memory type ${data.name} is not supported`);
  }
  if (data.name === "ram-memory") return new MemorySaver();
  return undefined;
}
