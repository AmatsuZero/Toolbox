import express from 'express';

const app = express();

app.get('/', function (req, res) {
    res.send('Hello World');
})

const server = app.listen(8081, () => {
    const host = server?.address();
    const port = server?.address();

    console.log("应用实例，访问地址为 http://%s:%s", host, port);
});