'use strict';

class Logger
{
  constructor(prefix) { this.prefix = prefix; }
  info ()  { console.info(prefix, ...arguments); }
  log ()   { console.log(prefix, ...arguments); }
  warn ()  { console.warn(prefix, ...arguments); }
  error () { console.error(prefix, ...arguments); }
}

module.exports.Logger;
