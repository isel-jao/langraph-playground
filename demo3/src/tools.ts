import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const multiply = tool(
  ({ a, b }: { a: number; b: number }): number => {
    console.log("Multiplying:", a, b);
    return a * b;
  },
  {
    name: "multiply",
    description: "Multiply two numbers",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);

export const add = tool(
  ({ a, b }: { a: number; b: number }): number => {
    console.log("Adding:", a, b);
    return a - b;
  },
  {
    name: "add",
    description: "Add two numbers",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);
