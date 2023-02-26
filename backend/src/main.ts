import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Bilibili } from "./bilibili";

dotenv.config();

const app: Express = express();

app.use('/b', Bilibili);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

const port = process.env.PORT || 8081;

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});