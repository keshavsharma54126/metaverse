import  express from "express"
import {router} from "./routes/v1/index"
const app =  express()

app.use(express.json())

app.use("/api/v1",router)


app.listen(3006,()=>{
    console.log("server started at http://localhost:3000")
})