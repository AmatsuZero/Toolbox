import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { GetPopularData } from './bilibili'

dotenv.config();

const app: Express = express();
const port = process.env.PORT ? process.env.PORT : 8081;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/popular', GetPopularData);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});