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

let socket = net.createConnection(port, host);
socket.on('data', (data) => logger.log('data received', data));
socket.on('error', (err) => logger.error('socket error', err));
socket.on('close', () => logger.log('connection closed'));

function runTest (test)
{
  switch (test.trim()) {
    case '0': { running = false; } break;
    case '1': { socket.write('<DownloadFullHistory BTCUSDT 15m>') } break;
    case '2': { socket.write('<DownloadPartialHistory BTCUSDT 15m 2018-10-01>') } break;
    default: { logger.error ('Unknown test', test); }
  }

  rl.prompt();
}

// -- Init
const prompt = `
1. DownloadFirstCandle
2. DownloadFullHistory
3. DownloadPartialHistory
> `;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: prompt
});

rl.prompt();
rl.on('line', runTest);
rl.on('close', () => { process.exit(0); });
