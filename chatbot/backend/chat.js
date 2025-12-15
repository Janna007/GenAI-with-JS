import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import {config} from 'dotenv'

import NodeCache from  "node-cache" 


const myCache = new NodeCache({stdTTL:60 * 60 * 24}); //24 hour

config()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

let baseMessages = [
  {
    role: "system",
    content: "You are smart assistant,Answer the below Question ",
  },
];

let messages;


// console.log(messages)

export async function chatWithLlm(message,threadId){
  
   messages =
  threadId && myCache.get(threadId)
    ? myCache.get(threadId)
    : baseMessages;

  
   
   messages.push({
        role:"user",
        content:message
     })

    //  console.log(messages)

    const MAX_TRY=10
    let count=0

    while (true) {
  

      if(count>MAX_TRY){
        return "I could not find the answer !! Try Agail"
      }

      count++

      
        const chatCompletion = await getGroqChatCompletion();
        //   console.log(chatCompletion.choices[0]?.message.tool_calls,null,2);
    
        messages.push(chatCompletion.choices[0]?.message);
    
        const toolCalls = chatCompletion.choices[0]?.message.tool_calls;
    
        if (!toolCalls) {
          console.log("messages",messages)
           myCache.set(threadId,messages)
          //  
          console.log(JSON.stringify(myCache.data, null, 2));
          // messages.push({
          //   role:"assistant"
          // });
           return chatCompletion.choices[0]?.message.content 
        }
    
        for (const toolCall of toolCalls) {
          let functionName = toolCall.function.name;
          let functionParam = toolCall.function.arguments;
    
          if (functionName === "webSearch") {
            const toolResult = await webSearch(JSON.parse(functionParam));
            //  console.log("toolResult:",toolResult)
            messages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              content: toolResult,
            });
          }
        }
    
        //   const chatCompletion2 = await getGroqChatCompletion();
    
        //   console.log(chatCompletion2.choices[0]?.message)
      
    }


// rl.close()

}

export async function getGroqChatCompletion() {
  return groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages: messages,
    tools: [
      {
        type: "function",
        function: {
          name: "webSearch",
          description:
            "Serch the latest information and realtime data from internet.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "search data on query ,Eg.`When was iphone 16 luanched?`",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });
}

async function webSearch({ query }) {
    console.log("calling web search")
  const response = await tvly.search(query);

  const responseContent = response.results
    .map((result) => result.content)
    .join("/n/n");

  // console.log("response",responseContent)

  return responseContent;
}


