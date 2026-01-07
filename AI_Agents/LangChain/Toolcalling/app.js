// import readline from 'node:readline/promises'
// import Groq from "groq-sdk";
// import { tavily } from "@tavily/core";
import { createAgent, tool } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {config} from 'dotenv'
import { TavilySearch } from "@langchain/tavily";


config()  


  const webSearch = new TavilySearch({
    maxResults: 5,
    topic: "general",
  });

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
  maxOutputTokens:200,
  maxRetries:2
})

// console.log("USING MODEL:", model.model);

const agent = createAgent({
  model,        
  tools: [webSearch],
  systemPrompt: `
  You are a helpful assistant.
  If a question requires current or real-world information,
  you MUST use the Tavily search tool and summarize it and give a meaningful results.
  `,
});

// console.log("USING AGENT:" ,agent.options)
async function run() {
  const result = await agent.invoke({
    messages: [{ role: "user", content: "What is the iphone 16 launched date?" }],
  });
  console.log(result.messages[3].content);
}

run();





