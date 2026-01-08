
// 1.Agent progress
// To stream agent progress, use the stream method with streamMode: "updates". This emits an event after every agent step.
// For example, if you have an agent that calls a tool once, you should see the following updates:





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
  maxTokens: 2000,
  maxRetries: 2,
  streaming:true
});

const agent = createAgent({
  model,
  tools: [getWeather],
  middleware: [handleToolErros,dynamicSystemPrompt],
});

// async function run (){
//     const res=await agent.invoke({
//          messages:[
//             {
//                 role:"user",
//                 content:"What is the weather in bangalore"
//             }
//          ]
//     })

async function run() {
  for await (const chunk of await agent.stream(
    {
      messages: [
        { role: "user", content: "what is weather in bangalore all these years?." },
      ],
    },
    {
       context:{
        userRole:"expert"
       }
    },
    { streamMode: "updates" }
  )) {
    const [step, content] = Object.entries(chunk)[0];
    console.log(`step: ${step}`);
    console.log(`content: ${(content.messages[0])}`);
  }
}

// const toolMsg=res.messages.find((m) => m.constructor.name === "ToolMessage")

// if(toolMsg && toolMsg?.content?.length >0){
//   console.log(toolMsg.content)
// }

// const ai = res.messages.find((m) => m.constructor.name === "AIMessage");

// if (ai.tool_calls.length > 0) {
//   const aiTool = res.messages.filter(
//     (m) => m.constructor.name === "AIMessage"
//   );
//   const i = aiTool.length - 1;
//   const aimsg = aiTool[i];
//   console.log(aimsg.content);
// } else {
//   console.log(ai.content);
// }
// }

run();
