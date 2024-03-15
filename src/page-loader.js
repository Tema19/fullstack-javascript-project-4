import fs from 'fs';
import axios from 'axios';
import path from 'path';
import os from 'os';
import cheerio from 'cheerio';

const pageLoader = (url, dir = path.join(os.tmpdir(), `page-loader-${Date.now().toString()}`)) => {
    const urlObject = new URL(url);
    const hostName = urlObject.hostname;
    const filesDir = path.join(dir, hostName.replace(/\W/g, '-') + '_files');
    const fileName = path.join(dir, hostName.replace(/\W/g, '-') + '.html');

    return fs.promises.access(dir, fs.constants.F_OK)
        .catch(err => {
            if (err.code === 'ENOENT') {
                return fs.promises.mkdir(dir, { recursive: true });
            }
            throw err;
        })
        .then(() => {
            return fs.promises.access(filesDir, fs.constants.F_OK)
                .catch(err => {
                    if (err.code === 'ENOENT') {
                        return fs.promises.mkdir(filesDir, { recursive: true });
                    }
                    throw err;
                });
        })
        .then(() => {
            return axios({
                method: 'get',
                url: url,
                responseType: 'text'
            });
        })
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html); // Load HTML content into Cheerio

            const imageDownloads = [];
            $('img').each((index, element) => { // Iterate over image elements
                const imageUrl = new URL($(element).attr('src'), url); // Resolve relative URLs
                const imageName = path.basename(imageUrl.pathname);
                const imagePath = path.join(filesDir, imageName);
                const relativeImagePath = path.relative(dir, imagePath);
                $(element).attr('src', relativeImagePath); // Update image src attribute
                imageDownloads.push(
                    axios({
                        method: 'get',
                        url: imageUrl.href,
                        responseType: 'stream'
                    })
                    .then(response => {
                        const stream = response.data.pipe(fs.createWriteStream(imagePath));
                        return new Promise((resolve, reject) => {
                            stream.on('finish', resolve);
                            stream.on('error', reject);
                        });
                    })
                );
            });

            return Promise.all(imageDownloads)
                .then(() => {
                    fs.writeFileSync(fileName, $.html()); // Save HTML content after images are downloaded
                    console.log('Page downloaded successfully!');
                });
        })
        .catch(error => {
            console.error('Error fetching page:', error);
            throw error; // Re-throw the error to propagate it to the caller
        });
};

export default pageLoader;
