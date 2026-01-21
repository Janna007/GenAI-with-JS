import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import readline from "node:readline/promises";
import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import z from "zod";


//in memory
const checkpointer = new MemorySaver();


//define state
const State = new StateSchema({
  messages: MessagesValue,
});


//define model

const model = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0.2,
  maxTokens: 200,
  maxRetries: 2,
});


//define tools

const add = tool((a, b) => { return a + b }, {
  name:"add",
  description: "Add two numbers",
  schema: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
})

// Augment the LLM with tools

const toolsByName = {
  [add.name]: add,
};
 
const tools = Object.values(toolsByName);
const modelWithTools = model.bindTools(tools);

//define nodes

//define tool node(tool)
const callTool=async(state)=>{
  console.log("call Tool node")
  const lastMessage = state.messages.at(-1);
  
  if (lastMessage == null) {
    return { messages: [] };
  }

  const result=[]

  for(const toolCall of lastMessage.tool_calls ?? []){
     const tool=toolsByName[toolCall.name]
     const observation=await tool.invoke(toolCall)
     result.push(observation)
  }

  return { messages: result };
}

//define node( agent)

const callModel = async (state) => {
  console.log("call agent node")
  //call LLM
  const response = await modelWithTools.invoke(state.messages)
  return { messages: [response] }
}


const shouldContinue=(state)=>{
  console.log("called ShouldContinue")
  const lastMessage = state.messages.at(-1);

    // Check if it's an AIMessage before accessing tool_calls
    if (!lastMessage) {
      return END;
    }
 
    if (lastMessage.tool_calls?.length) {
      return "tool";
    }

     
    // Otherwise, we stop (reply to the user)
    return END;

}
//build graph
//compilr and invoke the graph

const graph = new StateGraph(State)
  .addNode("agent", callModel)
  .addNode("tool",callTool)
  .addEdge(START, "agent")
  .addConditionalEdges("agent",shouldContinue, ["tool", END])
  .addEdge("tool", "agent")
  .compile({checkpointer})


async function main() {

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {

    const userInput = await rl.question("You:");

    if (userInput === "bye") break;
    // console.log(userInput);

    const finalState = await graph.invoke({
      messages: [
        {
          role: "user",
          content: userInput
        },
      ]
    },
    {
      configurable: {
        thread_id: "1"
      }
    })

    const lastMessage = finalState.messages.at(-1)
    console.log("AI:", lastMessage.content)

  }

  rl.close();
}

main();
