import readline from 'node:readline/promises'
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

let messages = [
  {
    role: "system",
    content: "You are smart assistant,Answer the below Question ",
  },
//   {
//     role: "user",
//     content: "When was iphone 16 luanched?",
//   },
];

const rl=readline.createInterface({input:process.stdin,output:process.stdout})

while(true){
     const question=await rl.question('You:')

     if(question==="bye"){
        break;
     }
     messages.push({
        role:"user",
        content:question
     })

    while (true) {
  
        const chatCompletion = await getGroqChatCompletion();
        //   console.log(chatCompletion.choices[0]?.message.tool_calls,null,2);
    
        messages.push(chatCompletion.choices[0]?.message);
    
        const toolCalls = chatCompletion.choices[0]?.message.tool_calls;
    
        if (!toolCalls) {
          console.log(chatCompletion.choices[0]?.message.content || " ");
           break;
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
}

rl.close()


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


