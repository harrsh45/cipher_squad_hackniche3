import morgan from 'morgan'
import express from 'express'
import connect from "./db/db.js"
import userRoutes from './routes/user.routes.js'

import cookieParser from 'cookie-parser'

import cors from 'cors'

connect()
const app=express()
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/users",userRoutes)

app.use(cookieParser())

app.get("/",(req,res)=>{
    res.send("hello world")
})
export default app;