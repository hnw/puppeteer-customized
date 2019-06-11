'use strict'
const myPuppeteer = require('puppeteer');

// private variables
let defaults = {};

// add new method setDefaults()
function setDefaults(options) {
  /* some custom behavior */
  Object.entries(options).forEach(([k, v]) => {
    const camelcase = k.replace(/([-_]+[a-z0-9])/ig, ($1) => {
      return $1.toUpperCase().replace('-', '').replace('_', '');
    });
    const result = /^(defaultViewport)([A-Z].*)/.exec(camelcase);
    if (result) {
      if (!defaults[result[1]]) {
        defaults[result[1]] = {};
      }
      defaults[result[1]][result[2].toLowerCase()] = v;
    } else {
      defaults[camelcase] = v;
    }
  });
  return myPuppeteer;
};
myPuppeteer.setDefaults = setDefaults;

// replace puppeteer.launch()
const origLaunch = myPuppeteer.launch;
function launch(options = {}) {
  const merged = Object.assign({}, defaults, options);
  const browser = origLaunch.apply(myPuppeteer, [merged]);
  return browser;
}
myPuppeteer.launch = launch;

module.exports = myPuppeteer;
