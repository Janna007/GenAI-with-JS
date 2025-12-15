import express from "express"
import {config} from 'dotenv'
import { chatWithLlm } from "./chat.js"
import cors from "cors"




const router=express.Router()

const app=express()
config()

app.use(cors({
    origin:"*"
}))

app.use(express.json())

router.get('/',(req,res)=>{
     res.send('OK')
})

router.post('/chat',async (req,res)=>{
    try {

        const {message,threadId}=req.body

        console.log(message,threadId)

        if(!message || !threadId){
            return res.status(400).json({
                message:"All Fields are required!!"
            })
        }

        console.log(message)
        const response=await chatWithLlm(message,threadId)
        
         return res.status(201).json({
            message:response
        })
    } catch (error) {
        console.log(error.message)
         return res.status(500).json({
            message:error.message
        })
    }
})

app.use('/',router)


const startServer=()=>{
    try {
        app.listen(process.env.PORT,()=>{
            console.log(`server running on port ${process.env.PORT}`)
        }) 
    } catch (error) {
        console.log(error.message)
    }
}

startServer()


