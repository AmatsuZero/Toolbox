import * as path from "path";
import {__dirname} from "../global";
import express, {NextFunction, Request, Response} from "express";
import {checkIfNeedLogin, Login} from "./users";
import {createProgram} from "./program";

const netDisk = path.join(__dirname, "aliyunpan", "index.py");

export const AliNetDisk = express.Router();

AliNetDisk.use(checkIfNeedLogin);

AliNetDisk.use('/list', async (_req: Request, res: Response, next: NextFunction) => {
    const jsonData = await createProgram(netDisk);
    res.setHeader('Content-Type', 'application/json');
    const result = JSON.parse(jsonData.toString());
    res.end(JSON.stringify(result));
});

AliNetDisk.use('/login', Login);