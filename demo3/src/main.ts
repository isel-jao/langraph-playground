import dotenv from "dotenv";
dotenv.config();
import { writeFileSync } from "node:fs";
import { echoSlang } from "./agent";
import { textToSpeech } from "./text-to-speech";

// Load environment variables from .env file
async function main() {
  const text = `The first move is what sets everything in motion.`;
  const response = await echoSlang(text);

  const buffer = await textToSpeech(
    response.toString(),
    "1SM7GgM6IMuvQlz2BwM3"
  );
  writeFileSync("output.mp3", buffer);
  console.log("Audio saved to output.mp3");
}

main().catch((error) => {
  console.error("Error running the agent:", error);
});
