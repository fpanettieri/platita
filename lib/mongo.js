'use strict';

const MongoClient = require('mongodb').MongoClient;

const cfg = require('../cfg/mongo.json');

const Logger = require('./logger');
const logger = new Logger('[lib/mongo]');

function connect (cb)
{
  let url = `${cfg.prefix}${cfg.credentials}${cfg.host}:${cfg.port}/${cfg.database}${cfg.options}`;
  logger.info('connecting to', url);

  MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
    if (err) { return logger.error('connection failed', err); }
    logger.info('connected successfully');
    cb(client.db(cfg.database));
  });
}

module.exports = {
  connect: connect
}
