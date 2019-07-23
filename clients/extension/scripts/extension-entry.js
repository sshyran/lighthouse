/**
 * @license Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const defaultCategories = [{
  id: 'performance',
  title: 'Performance',
}, {
  id: 'accessibility',
  title: 'Accessibility',
}, {
  id: 'best-practices',
  title: 'Best Practices',
}, {
  id: 'seo',
  title: 'SEO',
}, {
  id: 'pwa',
  title: 'Progressive Web App',
}];

/** @typedef {import('../../../lighthouse-core/gather/connections/connection.js')} Connection */
/** @typedef {{selectedCategories: string[], device: string}} Settings */

const STORAGE_KEY = 'lighthouse_audits';
const SETTINGS_KEY = 'lighthouse_settings';

/**
 * Returns list of top-level categories from the default config.
 * @return {Array<{title: string, id: string}>}
 */
function getDefaultCategories() {
  return defaultCategories;
}

/**
 * Save currently selected set of category categories to local storage.
 * @param {Settings} settings
 */
function saveSettings(settings) {
  const storage = {
    /** @type {Record<string, boolean>} */
    [STORAGE_KEY]: {},
    /** @type {Record<string, string>} */
    [SETTINGS_KEY]: {},
  };

  // Stash selected categories.
  getDefaultCategories().forEach(category => {
    storage[STORAGE_KEY][category.id] = settings.selectedCategories.includes(category.id);
  });

  // Stash device setting.
  storage[SETTINGS_KEY].device = settings.device;

  // Save object to chrome local storage.
  chrome.storage.local.set(storage);
}

/**
 * Load selected category categories from local storage.
 * @return {Promise<Settings>}
 */
function loadSettings() {
  return new Promise(resolve => {
    // Protip: debug what's in storage with:
    //   chrome.storage.local.get(['lighthouse_audits'], console.log)
    chrome.storage.local.get([STORAGE_KEY, SETTINGS_KEY], result => {
      // Start with list of all default categories set to true so list is
      // always up to date.
      /** @type {Record<string, boolean>} */
      const defaultCategories = {};
      getDefaultCategories().forEach(category => {
        defaultCategories[category.id] = true;
      });

      // Load saved categories and settings, overwriting defaults with any
      // saved selections.
      const savedCategories = Object.assign(defaultCategories, result[STORAGE_KEY]);

      const defaultSettings = {
        device: 'mobile',
      };
      const savedSettings = Object.assign(defaultSettings, result[SETTINGS_KEY]);

      resolve({
        device: savedSettings.device,
        selectedCategories: Object.keys(savedCategories).filter(cat => savedCategories[cat]),
      });
    });
  });
}

// Run when in extension context, but not in unit tests.
if (typeof window !== 'undefined' && 'chrome' in window && chrome.runtime) {
  chrome.runtime.onInstalled.addListener(details => {
    if (details.previousVersion) {
      // eslint-disable-next-line no-console
      console.log('previousVersion', details.previousVersion);
    }
  });
}

if (typeof module !== 'undefined' && module.exports) {
  // Export for importing types into popup.js and require()ing into unit tests.
  module.exports = {
    getDefaultCategories,
    saveSettings,
    loadSettings,
  };
}

// Expose on window for extension (popup.js), other browser-residing consumers of file.
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.getDefaultCategories = getDefaultCategories;
  // @ts-ignore
  window.loadSettings = loadSettings;
  // @ts-ignore
  window.saveSettings = saveSettings;
}
