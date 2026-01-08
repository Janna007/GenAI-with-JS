
// LLM tokens
// To stream tokens as they are produced by the LLM, use streamMode: "messages":

import { ChatGroq } from "@langchain/groq";
import { createAgent, createMiddleware, dynamicSystemPromptMiddleware, tool } from "langchain";
import { config } from "dotenv";
import z from "zod";

config();

const getWeather = tool(({}) => {}, {
  name: "Get_weather",
  description: "Get current weather information of the given location.",
  schema: z.object({
    location: z.string().describe("the location to get weather for"),
  }),
});

const handleToolErros = createMiddleware({
  name: "HandleToolErrors",
  wrapToolCall: async (request, handler) => {
    try {
      return await handler(request);
    } catch (error) {
      // Return a custom error message to the model
      return new ToolMessage({
        content: `Tool error: Please check your input and try again. (${error})`,
        tool_call_id: request.toolCall.id,
      });
    }
  },
});

const dynamicSystemPrompt= dynamicSystemPromptMiddleware((state,runtime)=>{
    const userRole = runtime.context.userRole || "user";
    const basePrompt = "You are a helpful assistant.";
  
    if (userRole === "expert") {
      return `${basePrompt} Provide detailed technical responses.`;
    } else if (userRole === "beginner") {
      return `${basePrompt} Explain concepts simply in bullet points.`;
    }
    return basePrompt;
  })

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: 1000,
  maxRetries: 2,
  streaming:true
});

const agent = createAgent({
  model,
  tools: [getWeather],
  middleware: [handleToolErros,dynamicSystemPrompt],
});


async function run() {

    const stream=await agent.stream(
        {
          messages: [
            { role: "user", content: "Tell me a story " },
          ],
        },
        {
           streamMode: "messages" ,
           context:{
            userRole:"expert"
           }
        },
      )

 let finalAnswer=""
  for await (const chunk of stream ) {
     
        // console.log(chunk)
        

        for(const c of chunk){
          if (c.constructor.name === "AIMessageChunk" && c.content) {
                        process.stdout.write(c.content);
                        finalAnswer += c.content;
                      }
        }

      
  }

  // console.log("✅ AI RESPONSE:\n", finalAnswer);
}



run();
