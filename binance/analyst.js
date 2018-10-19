'use strict';

const mongo   = require('../lib/mongo');
const socket  = require('../lib/socket');
const binance = require('../lib/binance');

const Logger = require('../lib/logger');
const logger = new Logger('[binance/analyst]');

// Instance holders
let Binance = null;
let db = null;

function cliHero ()
{
  logger.log(`
    _         _
__ _ _ _  __ _| |_  _ __| |_
/ _\` | ' \/ _\` | | || (_-<  _|
\\__,_|_||_\\__,_|_|\\_, /__/\\__|
      |__/
___________________________________
  `);
}

function cliHelp ()
{
  if (process.argv[2] !== '-h') { return; }
  logger.log('\nusage: node analyst <port> <host>\n');
  process.exit();
}

function dispatchMsg (msg, socket)
{
  switch (msg[0]) {

  }
}

// -- Initialization
cliHelp();
cliHero();

Binance = binance.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
mongo.connect((_db) => {
  db = _db;
  let port = process.argv[2] || 0;
  let host = process.argv[3] || '0.0.0.0';
  socket.listen(port, host, dispatchMsg);
});
