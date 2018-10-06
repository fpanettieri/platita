'use strict';

const mongodb = require('mongodb').MongoClient;

const cfg = require('../cfg/mongo.json');

const Logger = new require('./logger').Logger;
const logger = new Logger('[lib/mongo]');

function connect (cb)
{
  let url = `${cfg.prefix}${cfg.credentials}${cfg.host}:${cfg.port}${cfg.database}${cfg.options}`;
  logger.log('connecting to', url);

  const client = new MongoClient(url);
  logger.log('client created');

  client.connect((err) => {
    if (err) { return logger.error('connection failed', err); }
    logger.log('connected successfully');
    cb(client.db(cfg.database));
  });
}

module.exports = {
  connect: connect
}
