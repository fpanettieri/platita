'use strict';

function clone (o) {
  return JSON.parse(JSON.stringify(o));
}

function humanize (size) {
  let i = size === 0 ? 0 : Math.floor( Math.log(size) / Math.log(1024) );
  return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}

module.exports = {
  clone: clone,
  humanize: humanize
}
