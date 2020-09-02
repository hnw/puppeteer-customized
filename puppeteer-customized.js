'use strict'
const puppeteer = require('puppeteer');

// オブジェクトをclone
// via: https://stackoverflow.com/questions/41474986/how-to-clone-a-javascript-es6-class-instance
const myPuppeteer = Object.assign(Object.create(Object.getPrototypeOf(puppeteer)), puppeteer);

const {ElementHandle, Page} = require('puppeteer/lib/cjs/api-docs-entry');

ElementHandle.prototype.isVisible = async function () {
  return this.boundingBox().then(obj => obj !== null);
}

Object.defineProperty(ElementHandle.prototype, 'visibleText', {
  async get() {
    return Promise.all(
      (await this.$x('descendant::text()')).map(async el => {
        if (!await el.isVisible()) {
          return '';
        };
        return el.evaluate(node => node.textContent.trim().replace(/\s+/g,' '));
      })
    ).then(texts => texts.filter(Boolean).join(' '));
  }
});

Object.defineProperty(ElementHandle.prototype, 'textContent', {
  async get() {
    return (await this.getProperty('textContent')).jsonValue();
  }
});

Object.defineProperty(ElementHandle.prototype, 'innerText', {
  async get() {
    return (await this.getProperty('innerText')).jsonValue();
  }
});

Object.defineProperty(ElementHandle.prototype, 'innerHTML', {
  async get() {
    return (await this.getProperty('innerHTML')).jsonValue();
  }
});

Object.defineProperty(ElementHandle.prototype, 'outerText', {
  async get() {
    return (await this.getProperty('outerText')).jsonValue();
  }
});

Object.defineProperty(ElementHandle.prototype, 'outerHTML', {
  async get() {
    return (await this.getProperty('outerHTML')).jsonValue();
  }
});

Object.defineProperty(ElementHandle.prototype, 'value', {
  async get() {
    return (await this.getProperty('value')).jsonValue();
  }
});

Page.prototype.waitForSelectors = async function (selectors, options) {
  if (!Array.isArray(selectors)) {
    return this.waitForSelector(selectors, options);
  }
  const ret = await this.waitForSelector(selectors.join(','), options);
  return Promise.all(selectors.map(async (selector) => this.$(selector)));
}

// private variables
let defaults = {};

// add new method setDefaults()
myPuppeteer.setDefaults = function (options = {}) {
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
    } else if (k === 'proxyServer') {
      if (!defaults['args']) {
        defaults['args'] = [];
      }
      defaults.args.push('--proxy-server=' + v);
    } else {
      defaults[camelCase] = v;
    }
  });
  return myPuppeteer;
};

// replace puppeteer.launch()
const origLaunch = myPuppeteer.launch;
myPuppeteer.launch = function (options = {}) {
  const merged = Object.assign({}, defaults, options);
  const browser = origLaunch.apply(myPuppeteer, [merged]);
  return browser;
}

module.exports = myPuppeteer;
