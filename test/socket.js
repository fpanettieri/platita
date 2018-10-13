'use strict';

const assert   = require('assert');
const net      = require('net');
const readline = require('readline');

const Logger = new require('../lib/logger');
const logger = new Logger('[test/socket]');

let running = true;
let socket = null;

function runTest (test)
{
  assert(socket);

  switch (test.trim()) {
    case '0': { running = false; } break;
    case '1': { socket.write('<DownloadFirstCandle BTCUSDT 15m>') } break;
    case '2': { socket.write('<DownloadFullHistory BTCUSDT 15m>') } break;
    case '3': { socket.write('<DownloadPartialHistory BTCUSDT 15m 2018-10-01') } break;
    default: { logger.error ('Unknown test', test); }
  }

  rl.prompt();
}

// -- Prompt

assert(process.argv.length > 2);
let port = process.argv[2];
let host = process.argv[3] || '0.0.0.0';
socket = net.createConnection(port, host);
socket.on('data', (data) => logger.log('data received', data));
socket.on('error', (err) => logger.error('socket error', err));
socket.on('end', () => { running = false; });

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
