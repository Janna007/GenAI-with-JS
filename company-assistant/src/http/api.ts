import { useMutation } from "@tanstack/react-query";
import { api } from "./client";

const chat=({question})=>{
    return api.post('/chat',{question})
    
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
