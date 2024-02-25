import fs from 'fs';
import axios from 'axios';
import path from 'path';
import os from 'os';

const pageLoader = (url, dir = os.homedir()) => {
    const urlObject = new URL(url);
    const fileName = path.join(dir, urlObject.host.replace(/\W/g, '-') + '.html');

    return fs.promises.access(dir, fs.constants.F_OK)
        .catch(err => {
            if (err.code === 'ENOENT') {
                return fs.promises.mkdir(dir, { recursive: true });
            }
            throw err;
        })
        .then(() => {
            return axios({
                method: 'get',
                url: url,
                responseType: 'stream'
            });
        })
        .then(response => {
            return new Promise((resolve, reject) => {
                const stream = response.data.pipe(fs.createWriteStream(fileName));
                stream.on('finish', () => {
                    console.log('Page downloaded successfully!');
                    resolve();
                });
                stream.on('error', error => {
                    console.error('Error writing file:', error);
                    reject(error);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching page:', error);
            throw error; 
        });
};

export default pageLoader;
