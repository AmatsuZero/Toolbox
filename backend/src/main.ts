import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { GetPopularData, Login } from './bilibili'

dotenv.config();

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/popular', GetPopularData);

app.get('/login', Login);

const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});