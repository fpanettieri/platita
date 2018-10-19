'use strict';

const mongo  = require('../lib/mongo');
const socket = require('../lib/socket');
const logger = require('../lib/logger');

async function start (name, domain, dispatcher)
{
  const logger = new logger(`[${domain}/${name}]`);

  if (process.argv[2] === '-h') {
    logger.log(`\nusage: node ${name} <port> <host>\n`);
    process.exit();
    return;
  }
  logger.info (`${name} starting`);

  const db = await mongo.connect();

  const port = process.argv[2] || 0;
  const host = process.argv[3] || '0.0.0.0';
  socket.listen(port, host, dispatcher);

  return { logger: logger, db: db };
}

module.exports = {
  start: start
}
