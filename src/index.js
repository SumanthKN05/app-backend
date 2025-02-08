import dotenv from 'dotenv';
import {app} from './app.js'
import connectDB from './db/index.js';

dotenv.config({
  path: './env'
})



// You can add your middleware or routes here if needed
// For example, app.use() or app.get()

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB:', err);
    process.exit(1);
  });


















/*
import express from 'express'
const app=express();

;(async()=>{
  try{
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)


    app.on('error',(error)=>{
      console.error('MongoDB connection error:', error)
      throw error
    })

    app.listen(porocess.env.PORT,()=>{
      console.log(`Server is running on port ${process.env.PORT}`)
    })

  }catch(error){
    console.log("ERROR:",error)
    throw err
  }
})()
  */