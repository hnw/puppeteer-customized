'use strict'
const puppeteer = require('puppeteer');
const myPuppeteer = Object.assign({}, puppeteer);

// private variables
let defaults = {};

// add new method setDefaults()
myPuppeteer.setDefaults = function(options = {}) {
  /* some custom behavior */
  Object.entries(options).forEach(([k, v]) => {
    const camelCase = k.replace(/([-_]+[a-z0-9])/ig, ($1) => {
      return $1.toUpperCase().replace('-', '').replace('_', '');
    });
    const result = /^(defaultViewport)([A-Z].*)/.exec(camelCase);
    if (result) {
      if (!defaults[result[1]]) {
        defaults[result[1]] = {};
      }
      defaults[result[1]][result[2].toLowerCase()] = v;
    } else {
      defaults[camelCase] = v;
    }
  });
  return myPuppeteer;
};

// replace puppeteer.launch()
const origLaunch = myPuppeteer.launch;
myPuppeteer.launch = function(options = {}) {
  const merged = Object.assign({}, defaults, options);
  const browser = origLaunch.apply(myPuppeteer, [merged]);
  return browser;
}

module.exports = myPuppeteer;
