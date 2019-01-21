'use strict';

const net  = require('net');

const Logger = new require('../lib/logger');
const logger = new Logger('[test/suite]');

class TestSuite
{
  constructor (port, host) {
    this.tests = [];
  }

  add (fn) { this.tests.push(fn); }

  connect (port, host)
  {
    const client = net.createConnection(port, host);
    client.setEncoding('utf-8');

    client.sync = async (json, expected) => {
      return new Promise( function(resolve, reject) {
        client.on('error', reject);

        client.on('data', function (data) {
          data = data.trim();
          const msg = JSON.parse(data.trim());
          if (msg.e === expected) { resolve(msg); }
        });

        json['_'] = Date.now();
        client.write(JSON.stringify(json));
      });
    };

    this.client = client;
  }

  async run ()
  {
    logger.info('running');

    let passed = 0;
    for (let i = 0; i < this.tests.length; i++) {
      logger.log(this.tests[i].name);
      try {
        await this.tests[i](this.client);
        passed++;
      } catch (err) {
        logger.error(`${this.tests[i].name} failed`, err);
      }
    }

    logger.info(`results: ${passed} / ${this.tests.length} passed`);
    this.client.end();
  }
}

module.exports = TestSuite;
