/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/** @typedef {import('../../../lighthouse-core/lib/lh-error.js')} LighthouseError */

const VIEWER_ORIGIN = isDevMode() ? 'http://localhost:8000' : 'https://googlechrome.github.io';
const VIEWER_PATH = isDevMode() ? '/' : '/lighthouse/viewer/';

function isDevMode() {
  return !('update_url' in chrome.runtime.getManifest());
}

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
 * Click event handler for Generate Report button.
 * @param {string} siteURL
 */
async function onGenerateReportButtonClick(siteURL) {
  // resetting status message
  const statusMsg = find('.status__msg');
  statusMsg.textContent = 'Starting...';

  window.open(`${VIEWER_ORIGIN}${VIEWER_PATH}?url=${siteURL}`);
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
    // Show the user what URL is going to be tested.
    find('header h2').textContent = siteURL ? new URL(siteURL).origin : '';
  });

  // bind Generate Report button
  const generateReportButton = find('#generate-report');
  generateReportButton.addEventListener('click', () => {
    if (siteURL) {
      onGenerateReportButtonClick(siteURL);
    }
  });
}

initPopup();
