// import readline from 'node:readline/promises'
// import Groq from "groq-sdk";
// import { tavily } from "@tavily/core";
import { createAgent, tool } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "dotenv";
import { TavilySearch } from "@langchain/tavily";

config();

const data = {
  configurable: { thread_id: "1" },
  context: { user_id: "1" },
};

const webSearch = new TavilySearch({
  maxResults: 5,
  topic: "general",
  name: "webSearch",
  description: "Search Real time data based on input",
  systemPrompt: `You are a helpful assistant.
  If a question requires current or real-world information,
  you MUST use the Tavily search tool and summarize it and give a meaningful results`,
});

const getLocation = tool(
  (_, data) => {
    const { user_id } = data.context;
    return user_id === "1" ? "Florida" : "SF";
  },
  {
    name: "getLocation",
    description: "Retrieve user information based on user ID",
  }
);

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
  maxOutputTokens: 200,
  maxRetries: 2,
});

// console.log("USING MODEL:", model.model);

const agent = createAgent({
  model,
  tools: [webSearch, getLocation],
});

// console.log("USING AGENT:" ,agent.options)
async function run() {
  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: "Where is my Location?" }],
    },
    data
  );
//   console.log(result);
  console.log(result.messages[3].content);
}

run();
