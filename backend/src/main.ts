import express, {Express, NextFunction, Request, Response} from 'express';
import dotenv from 'dotenv';
import { Bilibili } from "./bilibili";
import {InitDB} from "./config/db";
import {AliNetDisk} from "./netdisk/service";

dotenv.config();
const app: Express = express();

app.use('/b', Bilibili);
app.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.type('text/html');
    res.send(`
  <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
    <title>Title</title>
    </head>
    <body>
        <img src="https://pic.re/image" alt="img">
    </body>
</html>
  `)
  } catch (e) {
      next(e);
  }
});
app.use('/ali', AliNetDisk);

const port = process.env.PORT || 8081;
app.listen(port, async () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  await InitDB();
});