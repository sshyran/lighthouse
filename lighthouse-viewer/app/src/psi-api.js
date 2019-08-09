/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/** @typedef {{lighthouseResult: LH.Result}} PSIResponse */

const PSI_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const PSI_KEY = 'AIzaSyAjcDRNN9CX9dCazhqI4lGR7yyQbkd_oYE';
const PSI_DEFAULT_CATEGORIES = [
  'performance',
  'accessibility',
  'seo',
  'best-practices',
  'pwa',
];

/**
 * Wrapper around the PSI API for fetching LHR.
 */
class PSIApi {
  /**
   * @param {PSIParams} params
   * @return {Promise<PSIResponse>}
   */
  fetchPSI(params) {
    params = Object.assign({
      key: PSI_KEY,
      strategy: 'mobile',
    }, params);

    const apiUrl = new URL(PSI_URL);
    Object.entries(params).forEach(([key, value]) => {
      if (key === 'category') return;
      if (value) apiUrl.searchParams.append(key, value);
    });
    for (const singleCategory of (params.category || PSI_DEFAULT_CATEGORIES)) {
      apiUrl.searchParams.append('category', singleCategory);
    }

    return fetch(apiUrl.href).then(res => res.json());
  }
}

// node export for testing.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PSIApi;
}
