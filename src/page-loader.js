import fs from 'fs';
import axios from 'axios';
import path from 'path';
import os from 'os';


const pageLoader = (url, dir = '/home/user/current-dir') => { 
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
            response.data.pipe(fs.createWriteStream(fileName))
                .on('error', function(error) {
                    console.error('Error writing file:', error);
                })
                .on('finish', function() {
                    console.log('Page downloaded successfully!');
                });
        })
        .catch(error => {
            console.error('Error fetching page:', error);
        });
}

export default pageLoader; 