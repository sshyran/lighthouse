/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/** @typedef {typeof import('./extension-entry.js') & {console: typeof console}} BackgroundPage */
/** @typedef {import('./extension-entry.js').Settings} Settings */
/** @typedef {import('../../../lighthouse-core/lib/lh-error.js')} LighthouseError */

const DEV = !('update_url' in chrome.runtime.getManifest());
const VIEWER_ORIGIN = DEV ? 'http://localhost:8000' : 'https://googlechrome.github.io';
const VIEWER_PATH = DEV ? '/' : '/lighthouse/viewer/';

const subpageVisibleClass = 'subpage--visible';

/** @type {?string} */
let siteURL = null;

/**
 * Guaranteed context.querySelector. Always returns an element or throws if
 * nothing matches query.
 * @param {string} query
 * @param {ParentNode=} context
 * @return {HTMLElement}
 */
function find(query, context = document) {
  /** @type {?HTMLElement} */
  const result = context.querySelector(query);
  if (result === null) {
    throw new Error(`query ${query} not found`);
  }
  return result;
}

/**
 * @param {string} text
 * @param {string} id
 * @param {boolean} isChecked
 * @return {HTMLLIElement}
 */
function createOptionItem(text, id, isChecked) {
  const input = document.createElement('input');
  input.setAttribute('type', 'checkbox');
  input.setAttribute('value', id);
  if (isChecked) {
    input.setAttribute('checked', 'checked');
  }

  const label = document.createElement('label');
  label.appendChild(input);
  label.appendChild(document.createTextNode(text));
  const listItem = document.createElement('li');
  listItem.appendChild(label);

  return listItem;
}

/**
 * Click event handler for Generate Report button.
 * @param {string} siteURL
 * @param {Settings} settings
 */
function onGenerateReportButtonClick(siteURL, settings) {
  const url = new URL(`${VIEWER_ORIGIN}${VIEWER_PATH}`);
  url.searchParams.append('url', siteURL);
  url.searchParams.append('device', settings.device);
  url.searchParams.append('categories', settings.selectedCategories.join(','));
  window.open(url.href);
}

/**
 * Generates a document fragment containing a list of checkboxes and labels
 * for the categories.
 * @param {BackgroundPage} background Reference to the extension's background page.
 * @param {Settings} settings
 */
function generateOptionsList(background, settings) {
  const frag = document.createDocumentFragment();

  background.getDefaultCategories().forEach(category => {
    const isChecked = settings.selectedCategories.includes(category.id);
    frag.appendChild(createOptionItem(category.title, category.id, isChecked));
  });

  const optionsCategoriesList = find('.options__categories');
  optionsCategoriesList.appendChild(frag);
}

/**
 * Initializes the popup's state and UI elements.
 */
async function initPopup() {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
    if (tabs.length === 0) {
      return;
    }

    siteURL = tabs[0].url || null;
    const url = siteURL ? new URL(siteURL) : null;
    const host = url ? url.host : '';
    if (host.startsWith('localhost')) {
      generateReportButton.disabled = true;
    }
  });

  const backgroundPagePromise = new Promise(resolve => chrome.runtime.getBackgroundPage(resolve));

  /**
   * Really the Window of the background page, but since we only want what's exposed
   * on window in extension-entry.js, use its module API as the type.
   * @type {BackgroundPage}
   */
  const background = await backgroundPagePromise;

  // generate checkboxes from saved settings
  background.loadSettings().then(settings => {
    generateOptionsList(background, settings);
    const selectedDeviceEl = /** @type {HTMLInputElement} */ (
      find(`.options__device input[value="${settings.device}"]`));
    selectedDeviceEl.checked = true;
  });

  const generateReportButton = /** @type {HTMLButtonElement} */ (find('#generate-report'));
  generateReportButton.addEventListener('click', () => {
    background.loadSettings().then(settings => {
      if (siteURL) {
        onGenerateReportButtonClick(siteURL, settings);
      }
    });
  });

  // bind View Options button
  const generateOptionsEl = find('#configure-options');
  const optionsEl = find('.options');
  generateOptionsEl.addEventListener('click', () => {
    optionsEl.classList.add(subpageVisibleClass);
  });

  // bind Save Options button
  const okButton = find('#ok');
  okButton.addEventListener('click', () => {
    // Save settings when options page is closed.
    const checkboxes = /** @type {NodeListOf<HTMLInputElement>} */
      (optionsEl.querySelectorAll('.options__categories input:checked'));
    const selectedCategories = Array.from(checkboxes).map(input => input.value);
    const device = /** @type {HTMLInputElement} */ (find('input[name="device"]:checked')).value;

    background.saveSettings({
      selectedCategories,
      device,
    });

    optionsEl.classList.remove(subpageVisibleClass);
  });
}

initPopup();
