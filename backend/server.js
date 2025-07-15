import express from 'express'
import cors from 'cors'
import 'dotenv/config'

//App config
const app = express()
const port = process.env.PORT || 3000

//middlewares
app.use(express.json())
app.use(cors())

//appi endpoints
app.get('/',(req,res)=>{
    res.send("API Working")
})

app.listen(port,()=> console.log("server on port : " +port))