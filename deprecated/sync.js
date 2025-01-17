'use strict';

function mutex ()
{
  return {
    locked: true,
    locks: 0,

    lock: () => {
      this.locked = true;
      this.locks++;
    },

    unlock: () => {
      if (this.locks < 1) { throw ''; }
      if (--this.locks == 0) { this.locked = false; }
    }
  };
}

function wait (mutex)
{
  // JAVASCRIPT SUCKS
  // while (mutex.locked) { }
}

module.exports = {
  mutex: mutex,
  wait: wait
}
