const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.port || 3000;

const redisClient = require('./redis-client');

app.get('/api/store/:key', async (req, res) => {
    const { key } = req.params;
    const value = req.query;
    redisClient.setAsync(key, JSON.stringify(value));
    return res.send('Success');
});
app.get('/api/get/:key', async (req, res) => {
    const { key } = req.params;
    const rawData = await redisClient.getAsync(key);
    return res.json(JSON.parse(rawData));
});

app.get('/api',(req,res) => {
    res.send("Hello world");    
});

app.get('/api/inspect', async (req,res,next) => {
    try {
        const url = req.query.url;
        const redisData = await redisClient.getAsync(url);
        if (redisData){
            res.json({
                status: 1,
                data: JSON.parse(redisData),
            });
        } else {
            const {data} = await axios.get(`http://sharkcop-webinspector:8080/api/check?url=${url}`);
            redisClient.setAsync(url, JSON.stringify(data));
            
            res.json({
                status: 1,
                data: data,
            });
        }
    } catch (e) {
        res.status(200).json({
            status: 0,
            error: e,
        })
    }
})

app.listen(PORT, () => {console.log("Server runing on port",PORT)});