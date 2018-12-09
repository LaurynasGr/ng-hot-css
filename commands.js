#!/usr/bin/env node

const program = require('commander');
const version = require('./package.json').version;
const server = require('./server');

program
  .version(version, '-v, --version')
  .description('Serves the Angular dev server on port 4200 (or --port if specified)')
  .option('-p, --port [port]', 'Specify a port for the Angular Dev server (Default: 4200)')
  .parse(process.argv);

server({ rootPath: process.cwd(), port: program.port });