import { useMutation } from "@tanstack/react-query";
import { api } from "./client";

const chat=(message)=>{
    return api.post('/chat',message)
    
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
