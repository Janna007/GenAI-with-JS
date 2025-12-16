//load the document -pdf,text
//chunk the document
//vector embedding
//store vector embedding in vector database


//user input
//retrive informations/similarity search
//pass input /relevant info to LLM
//output

// import { indexDocument } from "./prepare.js";


// const filepath='./cg-internal-docs.pdf'
// indexDocument(filepath)

import express from "express"
import {config} from 'dotenv'
import cors from "cors"
import { chat } from "./chat.js"




const router=express.Router()

const app=express()
config()

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

router.get('/',(req,res)=>{
     res.send('OK')
})

router.post('/chat',async (req,res)=>{
    try {
        const {question}=req.body

        if(!question){
            return res.status(400).json({
                message:"All Fields are required!!"
            })
        }

        const response=await chat(question)
        
        return res.status(200).json({
            answer: response
          });
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


