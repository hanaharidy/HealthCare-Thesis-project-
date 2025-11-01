const express = require('express')
const cors = require("cors")
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()

const UserRoutes = require('./Routes/UserRoutes.js')
const InquiryRoutes = require('./Routes/InquiryRoutes.js')
const HistoryRoutes = require('./Routes/HistoryRoutes.js')
const ChatRoutes = require('./Routes/ChatRoutes.js')
const MessageRoutes = require('./Routes/MessageRoutes.js')
const authenticate = require('./Middleware/index.js')


const app = express()

//middleware
//app.use(authenticate)
app.use(cors({origin:"*"}))
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true
  }));

//routes
app.use('/users', UserRoutes)
app.use('/inquiry', InquiryRoutes)
app.use('/history', HistoryRoutes)
app.use('/chat', ChatRoutes)
app.use('/message', MessageRoutes)

//launch app
app.listen(process.env.PORT, ()=>{
    console.log("app started on port 8000")
})

mongoose.connect(process.env.dbURI, {})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Failed to connect to MongoDB", err));
