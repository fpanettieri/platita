'use strict';

const mongodb = require('mongodb');
const cfg = require('../cfg/mongo.json');

const LOG_PREFIX = '[lib/mongo]';

function connect (cb)
{
  let url = `${cfg.prefix}${cfg.credentials}${cfg.host}:${cfg.port}${cfg.database}${cfg.options}`;
  console.log(`${LOG_PREFIX} connecting to ${url}`);
  mongodb.MongoClient.connect(url, { useNewUrlParser: true }).then(cb).catch(handleErrors);
}

function handleErrors (err)
{
  console.error(`${LOG_PREFIX} connection failed`);
}

module.exports = {
  connect: connect
}
