import 'dotenv/config'

import './db.js'

import cors from 'cors'
import express from 'express';


import fileRouter from './routes/files_controller.js'
import authRouter from './routes/auth_controller.js'
import bodyParser from 'body-parser';

const { json, urlencoded } = bodyParser;

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({extended: false}))

const PORT = process.env.PORT || 3000;

app.use('/files', fileRouter);
app.use('/auth', authRouter)

const server = app.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`);
})

process.on('SIGTERM', () => {
    debug('SIGTERM signal received: closing HTTP server')
    server.close(() => {
      debug('HTTP server closed')
    })
  })