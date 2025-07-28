import { createLlm } from "./create-llm";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
import { add, multiply } from "./tools";
import {
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { InMemoryCache } from "@langchain/core/dist/caches/base";

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

  const tools = [add, multiply];
  const toolNode = new ToolNode(tools);

  // Define the function that determines whether to continue or not
  function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1] as AIMessage;

    // If the LLM makes a tool call, then we route to the "tools" node
    if (lastMessage.tool_calls?.length) {
      return "tools";
    }
    // Otherwise, we stop (reply to the user) using the special "__end__" node
    return "__end__";
  }

  // Define the function that calls the model
  async function callModel(state: typeof MessagesAnnotation.State) {
    const response = await llm.invoke(state.messages);

    // We return a list, because this will get added to the existing list
    return { messages: [response] };
  }

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
    .addNode("tools", toolNode)
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue);

  // Finally, we compile it into a LangChain Runnable.
  const app = workflow.compile({
    name: "agent",
    checkpointer: new MemorySaver(),
  });

  const messages = ["multiply 3 and 4", "add previous result with 5"];
  for (const message of messages) {
    console.log("message: ", message);
    // Invoke the agent with the message
    const finalState = await app.invoke(
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
