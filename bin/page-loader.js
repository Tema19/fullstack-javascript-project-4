#!/usr/bin/env node
import { program } from 'commander';
import pageLoader from '../src/page-loader.js';

program
  .name('pageLoader')
  .description('Download web-pages to derictory')
  .version('1.0.0')
  .arguments('<url>')
  .option('-o, --output [dir]', 'output dir (default: "/home/user/current-dir")')
  .action((url) => {
    pageLoader(url);
  });

program.parse();