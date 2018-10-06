'use strict';

class Logger
{
  constructor(prefix) { this.prefix = prefix; }
  info ()  { console.info(this.prefix, ...arguments); }
  log ()   { console.log(this.prefix, ...arguments); }
  warn ()  { console.warn(this.prefix, ...arguments); }
  error () { console.error(this.prefix, ...arguments); }
}

module.exports = Logger;
