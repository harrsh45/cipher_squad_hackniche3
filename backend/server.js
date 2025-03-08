import dotenv from 'dotenv/config'
import app from './app.js'
import jwt from 'jsonwebtoken'

import http from 'http'
import lotterymodel from './model/lottery.model.js'
import mongoose from 'mongoose';



const port = process.env.PORT || 3000


const server = http.createServer(app)


server.listen(port, () => {
    console.log(`server is running on ${port}`)
})