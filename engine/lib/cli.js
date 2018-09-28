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
    INTERVAL  end date. Formatted as ISO 8601 (e.g.: 2018-08-02 10:44:20)
    -i        interval (e.g.: 1m, 5m, 15m, 1h, 4h, 1d, 1w)
    -h        print usage information
    -v        print version
  `);
}

module.exports = {
  hero: hero
}
