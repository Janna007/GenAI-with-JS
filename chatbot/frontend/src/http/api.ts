import { useMutation } from "@tanstack/react-query";
import { api } from "./client";

const chat=({message,threadId})=>{
    return api.post('/chat',{message,threadId})
    
}

export const chatWithServer=()=>{
  console.log("called")
    return useMutation({
        mutationKey:["message"],
        mutationFn: chat,
        onSuccess:async()=>{
          console.log("successfully chat")
        }   
      })
}
