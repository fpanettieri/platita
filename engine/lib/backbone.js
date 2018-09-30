'use strict';

const EventEmitter = require('events');

class Backbone extends EventEmitter
{
  constructor() {
    super();
  }

  emit (e) {
    // TODO: log to a file / stream?
    console.log('>', ...arguments);
    super.emit(...arguments);
  }
}

module.exports = Backbone;
