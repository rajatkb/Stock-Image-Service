import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import * as dotenv from 'dotenv-safe';
import { UndefinedEnvironmentVariable } from './errors/server';

dotenv.config({
    example: './.env'
});

if(process.env.FILE_SERVER_PORT === undefined )
    throw new UndefinedEnvironmentVariable(`FILE_SERVER_PORT not defined`)
    
if(process.env.STORAGE_LOCATION === undefined )
    throw new UndefinedEnvironmentVariable(`STORAGE_LOCATION not defined`)

if(process.env.APPLICATION_LOCATION === undefined )
    throw new UndefinedEnvironmentVariable(`APPLICATION_LOCATION not defined`)

const uploads = process.env.STORAGE_LOCATION
const port  = Number.parseInt(process.env.FILE_SERVER_PORT)
const application = process.env.APPLICATION_LOCATION


const app = express()

app.use(cors())
// disabled compression control calculations
app.set('etag' , false)
// for security purposes
app.use(helmet())

app.use('/uploads', express.static(uploads))
app.use(express.static(application))
app.get("*" , (req , res) => {
    res.status(400).json({
        status:400,
        payload: " (ノಠ益ಠ)ノ彡┻━┻ "
    })
})

app.listen(port , () => {
    console.log(`Server listening at port : ${port}`)
})