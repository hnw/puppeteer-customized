'use strict'
const puppeteer = require('puppeteer');
// オブジェクトをclone
// via: https://stackoverflow.com/questions/41474986/how-to-clone-a-javascript-es6-class-instance
const myPuppeteer = Object.assign(Object.create(Object.getPrototypeOf(puppeteer)), puppeteer);
const {ElementHandle, Page} = require('puppeteer/lib/api');

// via: https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom/21696585
ElementHandle.prototype.isVisible = async function () {
  return await this.executionContext().evaluate(el => {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (!style) return false;
    if (style.display === 'none') return false;
    if (style.visibility !== 'visible') return false;
    if (style.opacity < 0.1) return false;
    const bRect = el.getBoundingClientRect();
    if (el.offsetWidth + el.offsetHeight + bRect.height + bRect.width === 0) {
        return false;
    }
    return true;
  }, this);
};

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
