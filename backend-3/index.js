require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connecttodatabase = require('./db');
const initSockets = require('./socket');
const app = express();
const userroutes = require('./routes/userroutes')
const canvasroutes = require('./routes/canvasroutes')


app.use(cors({ origin: process.env.CLIENT_URL }));
const PORT = process.env.PORT ;

app.use(express.json({ limit: '10mb' }));
connecttodatabase();

app.use('/users', userroutes);
app.use('/canvas', canvasroutes);

const server = http.createServer(app);
initSockets(server);

server.listen(PORT, () => {
    console.log(`LISTENING TO PORT ${PORT}`);
})