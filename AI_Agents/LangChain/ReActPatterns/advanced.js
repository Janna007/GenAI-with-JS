//static model

import {
  context,
  createAgent,
  createMiddleware,
  dynamicSystemPromptMiddleware,
  tool,
  ToolMessage,
} from "langchain";
import { ChatGroq } from "@langchain/groq";
import z from "zod";
import { config } from "dotenv";

config();

// const basicModel = new ChatOpenAI({ model: "gpt-4o-mini" });
// const advancedModel = new ChatOpenAI({ model: "gpt-4o" });

const getWeather = tool(({}) => {}, {
  name: "get_weather",
  description: "Get weather information for a location",
  schema: z.object({
    location: z.string().describe("The location to get weather for"),
  }),
});




// const dynamicModelSelection = createMiddleware({
//   name: "DynamicModelSelection",
//   wrapModelCall: (request, handler) => {
//     // Choose model based on conversation complexity
//     const messageCount = request.messages.length;

//     return handler({
//       ...request,
//       model: messageCount > 10 ? advancedModel : basicModel,
//     });
//   },
// });


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

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: 2000,
  maxRetries: 2,
});

const agent = createAgent({
  model,
  tools: [getWeather],
  middleware: [handleToolErros,dynamicSystemPrompt],
});

async function run() {
  const res = await agent.invoke({
    messages: [
      { role: "user", content: "What is machine learning?." },

    ],
  },
{
  context:{
    userRole:"expert"
  }
});


  // console.log(res)

  const toolMsg=res.messages.find((m) => m.constructor.name === "ToolMessage")
  if(toolMsg && toolMsg?.content?.length >0){
    console.log(toolMsg.content)
  }

  const ai = res.messages.find((m) => m.constructor.name === "AIMessage");

  if (ai.tool_calls.length > 0) {
    const aiTool = res.messages.filter(
      (m) => m.constructor.name === "AIMessage"
    );
    const i = aiTool.length - 1;
    const aimsg = aiTool[i];
    console.log(aimsg.content);
  } else {
    console.log(ai.content);
  }
}

run();











// const getWeather = tool(
//   async () => {
//     throw new Error("INTENTIONAL_TOOL_ERROR");
//   },
//  {
//   name: "get_weather",
//   description: "Tool that always fails for testing",
//   schema: z.object({})
// });