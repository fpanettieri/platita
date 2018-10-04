'use strict';

function hero () {
  console.log(`
    ┌─┐┬  ┌─┐┌┬┐┬┌┬┐┌─┐
    ├─┘│  ├─┤ │ │ │ ├─┤
    ┴  ┴─┘┴ ┴ ┴ ┴ ┴ ┴ ┴
___________________v0.2.1__
  `);
}

function help () {
  console.log(`
  usage: node main SYMBOLS INTERVAL

  Options:
    SYMBOLS   Comma Separated List of supported symbols (e.g.: BTCUSDT,ETHBTC,POEBTC,AIONBTC)
    INTERVAL  Single param (e.g.: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M)
  `);
}

module.exports = {
  hero: hero
}
