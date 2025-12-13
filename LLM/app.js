import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const chatCompletion = await getGroqChatCompletion();
  // Print the completion returned by the LLM.
  //      
  console.log(chatCompletion.choices[0]?.message?.content || "");
}

export async function getGroqChatCompletion() {
  return groq.chat.completions.create({
      temperature:1,
      messages: [
        {  
          role: "system",
          content: "You are janna,Analysis the below review ",
        },
      {
        role: "user",
        content: "Who are you?",
      },
    ],
    model: "openai/gpt-oss-20b",
  });
}

main()
