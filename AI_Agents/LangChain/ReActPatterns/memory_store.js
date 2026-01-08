import { ChatGroq } from "@langchain/groq";
import { createAgent, createMiddleware, tool, ToolMessage } from "langchain";
import { InMemoryStore } from "@langchain/langgraph";

import { config } from "dotenv";
import z from "zod";

config();

const store=new InMemoryStore()

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


const saveUserInfo=tool(async ({userId,name,age})=>{
     console.log(`Saving user info: ${userId}, ${name}, ${age}`);
      try {
          await store.put(["users"],userId,{name,age})
          return "Successfully saved user info."
      } catch (error) {
        console.error("❌ Error saving:", error);
        return `Error saving user: ${error.message}`;
      }
},{
    name: "save_user_info",
    description: "Save user info.",
    schema: z.object({
      userId: z.string(),
      name: z.string(),
      age: z.number(),
    }),

})


const getUserInfo=tool(async({userId})=>{
    const user=await store.get(["users"],userId)
    return user
},{
    name: "get_user_info",
    description: "Look up user info.",
    schema: z.object({
      userId: z.string(),
    }),
})


const model = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    maxTokens: 2000,
    maxRetries: 2,
    // config:{
    //     recursionLimit:40
    // }
  });
  
  const agent = createAgent({
    model,
    tools: [saveUserInfo,getUserInfo],
    middleware: [handleToolErros],
  });
  
 

  await agent.invoke({
    messages: [
      {
        role: "user",
        content: "Save the following user: userId: abc123, name: Foo, age: 25"
      },
    ],
  });

  async function run (){
    const result = await agent.invoke({
        messages: [
          { role: "user", content: "Get user info for user with id 'abc123'" },
        ],
      });
    
      console.log(result)
  }
  
run()