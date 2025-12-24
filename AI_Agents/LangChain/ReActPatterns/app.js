// import readline from 'node:readline/promises'
// import Groq from "groq-sdk";
// import { tavily } from "@tavily/core";
import { createAgent, DynamicStructuredTool, tool } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "dotenv";
import { z } from "zod";
// import { TavilySearch } from "@langchain/tavily";

config();

const calculatorTool = new DynamicStructuredTool({
  name: "calculator",
  description:
    "Useful for performing mathematical calculations. Input should be a math expression.",
  schema: z.object({
    expression: z
      .string()
      .describe(
        "The mathematical expression to evaluate, e.g., '2 + 2' or '10 * 5'"
      ),
  }),
  func: async ({ expression }) => {
    try {
      // Safe evaluation (in production, use math.js)
      const result = Function(`'use strict'; return (${expression})`)();
      return `The result of ${expression} is ${result}`;
    } catch (error) {
      return `Error: Invalid expression "${expression}"`;
    }
  },
});

const searchDatabase = new DynamicStructuredTool({
  name: "searchDatabase",
  description:
    "Search for products in the database. Returns product information including name, price, and stock.",
  schema: z.object({
    query: z.string().describe("The search query to find products"),
  }),
  func: async ({ query }) => {

        const database = {
            "laptop": { name: "Pro Laptop", price: 1299, stock: 15 },
            "mouse": { name: "Wireless Mouse", price: 29, stock: 50 },
            "keyboard": { name: "Mechanical Keyboard", price: 89, stock: 30 },
            "monitor": { name: "4K Monitor", price: 499, stock: 8 }
          };

      const searchTerm = query.toLowerCase();
      const result=[]

      for(const [key,value] of Object.entries(database)){
         if(key.includes(searchTerm)  || value.name.toLowerCase().includes(searchTerm)){
            result.push(value)
         }
      }


      if (result.length === 0) {
        return "No matching products found in the database.";
      }
      
      return JSON.stringify(result, null, 2);

  },
});

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
  maxOutputTokens: 1200,
  maxRetries: 2,
});

const agent = createAgent({
  model,
  tools: [calculatorTool,searchDatabase],
  systemPrompt: `You are a helpful AI agent. Use the available tools to answer user questions.
Think step by step and use tools when needed. Be precise and complete.`,
});

async function main() {
  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content: "Check if we have keyboard in stock. If yes, calculate 20% discount on 10 keyboard.",
      },
    ],
  });

  // console.log(result.messages[3].content);
  console.log(result);
  const length = result.messages.length - 1;
  console.log(result.messages[length].content);
  // console.log(result);
}

main();
