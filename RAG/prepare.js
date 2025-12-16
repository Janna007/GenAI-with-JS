import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";


import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

import dotenv from "dotenv";

dotenv.config();



const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "models/gemini-embedding-001"
});

const pinecone = new PineconeClient();

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

export const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
      pineconeIndex,
      // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
      maxConcurrency: 5,
      // You can pass a namespace here too
      // namespace: "foo",
    }
  );

export async function indexDocument(filepath) {
    //load document
  const loader = new PDFLoader(filepath, { splitPages: false });
  const docs = await loader.load();
  //   console.log(docs[0]);

  //chunk loaded docs
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const texts = await splitter.splitText(docs[0].pageContent);

//   console.log(texts)

const documents=texts.map((chunk)=>{
   return {
     pageContent:chunk,
     metadata:docs[0].metadata
   }
})


  console.log(documents)


  //vector embeddin using embedding models

  await vectorStore.addDocuments(documents);
  // console.log("✅ Documents indexed successfully");

}
