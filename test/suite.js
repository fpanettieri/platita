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
    this.client = net.createConnection(port, host);

    // FIXME: check if this works?
    client.on('error', (err) => { throw err; });

    client.on('data', function (data) {
      data = data.trim();
      const msg = JSON.parse(data.trim());
      logger.log('what do I do whit this', msg);
    });

    client.send = (json) => {
      json['_'] = Date.now();
      client.write(JSON.stringify(json));
    };
  }

  async run ()
  {
    logger.info('running');

    let passed = 0;
    for (let i = 0; i < this.tests.length; i++) {
      logger.log(this.tests[i].name);
      try {
        this.tests[i](this.client);
        passed++;
      } catch (err) {
        logger.log(`${this.tests[i].name} failed`);
        logger.error(err);
      }
    }

    logger.info(`results: ${passed} / ${this.tests.length} passed`);
  }
}

module.exports = TestSuite;
