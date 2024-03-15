import fs from 'fs/promises';
import pageLoader from '../src/page-loader.js';
import path from 'path';
import nock from 'nock';
import os from 'os';

describe('page-loader', () => {
    let tempDir;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    });

    test('access data from url', async () => {
        const expectedHtml = '<html><head></head><body>Hello World!</body></html>';
        const scope = nock('https://ru.hexlet.io')
            .get('/')
            .reply(200, expectedHtml);

        await pageLoader('https://ru.hexlet.io', tempDir);
        try {
            const fileContent = await fs.readFile(path.join(tempDir, 'ru-hexlet-io.html'), 'utf-8');
            expect(fileContent).toBe(expectedHtml);
        } catch (error) {
            expect(error).toBeNull();
        }
    });
    test('pictures download and src update', async () => {
        const originalHtml = await fs.readFile('./__fixtures__/hexletIOCourses.html', 'utf-8');
        const expectedHtml = await fs.readFile('./__fixtures__/hexletIOCoursesLocal.html', 'utf-8');
        const originalPicture = await fs.readFile('./__fixtures__/assets/professions/nodejs.png');
        const scope = nock('https://ru.hexlet.io')
            .get('/')
            .reply(200, originalHtml)
            .get('/assets/professions/nodejs.png')
            .reply(200, originalPicture);

        await pageLoader('https://ru.hexlet.io', tempDir);
        try {
            const fileContent = await fs.readFile(path.join(tempDir, 'ru-hexlet-io.html'), 'utf-8');
            expect(fileContent).toBe(expectedHtml);
        } catch (error) {
            expect(error).toBeNull();
        }
    });
});