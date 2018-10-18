'use strict';

const assert   = require('assert');
const net      = require('net');
const readline = require('readline');

const Logger = new require('../lib/logger');
const logger = new Logger('[test/socket]');

// -- Socket config
assert(process.argv.length > 2);
let port = process.argv[2];
let host = process.argv[3] || '0.0.0.0';
let symbol = process.argv[4] || 'POEBTC';
let interval = process.argv[5] || '1m';

let socket = net.createConnection(port, host);
socket.on('data', (data) => logger.log('data received', data.toString('utf8')));
socket.on('error', (err) => logger.error('socket error', err));
socket.on('close', () => logger.log('connection closed'));

function runTest (test)
{
  switch (test.trim()) {
    case '0': { running = false; } break;
    case '1': { socket.write(`<DownloadMetadata ${symbol} ${interval}>`) } break;
    case '2': { socket.write(`<DownloadFullHistory ${symbol} ${interval}>`) } break;
    case '3': { socket.write(`<DownloadPartialHistory ${symbol} ${interval} 2018-10-01>`) } break;
    case '4': { socket.write(`<WatchSymbols ${symbol} ${interval}>`) } break;
    default: { logger.error ('Unknown test', test); }
  }

  rl.prompt();
}

// -- Init
const prompt = `
1. DownloadMetadata ${symbol} ${interval}
2. DownloadFullHistory ${symbol} ${interval}
3. DownloadPartialHistory ${symbol} ${interval} 2018-10-01
4. WatchSymbols ${symbol} ${interval}
> `;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: prompt
});

rl.prompt();
rl.on('line', runTest);
rl.on('close', () => { process.exit(0); });
