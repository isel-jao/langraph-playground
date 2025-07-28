import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const urls = [
  "https://lilianweng.github.io/posts/2023-06-23-agent/",
  "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
  "https://lilianweng.github.io/posts/2023-10-25-adv-attack-llm/",
];

async function main() {
  const docs = await Promise.all(
    urls.map((url) => new CheerioWebBaseLoader(url).load())
  );
  const docsList = docs.flat();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const docSplits = await textSplitter.splitDocuments(docsList);

  // Add to vectorDB
  const vectorStore = await MemoryVectorStore.fromDocuments(
    docSplits,
    new OllamaEmbeddings({
      // apiKey: process.env.GOOGLE_AI_API_KEY,
      model: "gemini-2.0-flash",
    })
  );

  const retriever = vectorStore.asRetriever();
}

main().catch((error) => {
  console.error("Error running the main function:", error);
});
