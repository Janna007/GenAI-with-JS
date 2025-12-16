// import readline from 'node:readline/promises'
import Groq from "groq-sdk";
import { vectorStore } from './prepare.js';


import dotenv from "dotenv";

dotenv.config();


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(question) {
    // const rl=readline.createInterface({input:process.stdin,output:process.stdout})
   
    // while(true){
        // const question=await rl.question("You :")

        // if(question === "bye"){
        //     break
        // }

        //retrival information

        const relevantContext=await vectorStore.similaritySearch(question,3)
        // console.log(relevantContext)
        const context=relevantContext.map((chunk)=>chunk.pageContent).join("\n\n")


        const SYSTEM_PROMPT="You are smart assistant,Answer the Question using the given relevant context information ,if you don't know the answer just say i don't know "
        const userQuery=`user: ${question}
        context: ${context}
        Answer:

        `
        const chatCompletion = await getGroqChatCompletion(userQuery,SYSTEM_PROMPT);


        // Print the completion returned by the LLM.
        return chatCompletion.choices[0]?.message?.content || ""
}


export async function getGroqChatCompletion(userQuery,SYSTEM_PROMPT) {
  return groq.chat.completions.create({
    messages: [
        {
            role: "system",
            content: SYSTEM_PROMPT
          },
      {
        role: "user",
        content: userQuery
      },
    ],
    model: "openai/gpt-oss-20b",
  });
}

