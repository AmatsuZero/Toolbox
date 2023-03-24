import * as fs from "fs";

export const ifFileExists = (f: string) => {
    return new Promise((resolve, reject) => {
        fs.stat(f, function(err, stat) {
            if (err == null) {
                resolve(true);
            } else if (err.code === 'ENOENT') {
                resolve(false);
            } else {
                reject(err);
            }
        });
    });
}