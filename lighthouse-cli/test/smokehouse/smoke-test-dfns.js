/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const assert = require('assert');
const path = require('path');

/**
 * @param {string} filePath
 */
function pathRelativeToProjectRoot(filePath) {
  const projectRoot = path.join(__dirname, '../../../');
  return path.relative(projectRoot, filePath);
}

/**
 * Attempt to resolve a path relative to the smokehouse folder.
 * If this fails, attempts to locate the path
 * relative to the project root.
 * @param {string} payloadPath
 * @return {string}
 */
function resolveLocalOrProjectRoot(payloadPath) {
  let resolved;
  try {
    resolved = require.resolve(__dirname + '/' + payloadPath);
  } catch (e) {
    const cwdPath = path.resolve(__dirname + '/../../../', payloadPath);
    resolved = require.resolve(cwdPath);
  }

  return resolved;
}

/** @type {Array<Smokehouse.Test>} */
const smokeTests = [{
  id: 'a11y',
  expectations: require('./a11y/expectations.js'),
  config: {
    path: './a11y/a11y-config.js',
    value: require('./a11y/a11y-config.js'),
  },
  batch: 'parallel-first',
}, {
  id: 'errors',
  expectations: require('./error-expectations.js'),
  config: {
    path: './error-config.js',
    value: require('./error-config.js'),
  },
  batch: 'errors',
}, {
  id: 'oopif',
  expectations: require('./oopif-expectations.js'),
  config: {
    path: './oopif-config.js',
    value: require('./oopif-config.js'),
  },
  batch: 'parallel-first',
}, {
  id: 'pwa',
  expectations: require('./pwa-expectations.js'),
  config: {
    path: './pwa-config.js',
    value: require('./pwa-config.js'),
  },
  batch: 'parallel-second',
}, {
  id: 'pwa2',
  expectations: require('./pwa2-expectations.js'),
  config: {
    path: './pwa-config.js',
    value: require('./pwa-config.js'),
  },
  batch: 'parallel-second',
}, {
  id: 'pwa3',
  expectations: require('./pwa3-expectations.js'),
  config: {
    path: './pwa-config.js',
    value: require('./pwa-config.js'),
  },
  batch: 'parallel-first',
}, {
  id: 'dbw',
  expectations: require('./dobetterweb/dbw-expectations.js'),
  config: {
    path: './dbw-config.js',
    value: require('./dbw-config.js'),
  },
  batch: 'parallel-second',
}, {
  id: 'redirects',
  expectations: require('./redirects/expectations.js'),
  config: {
    path: './redirects-config.js',
    value: require('./redirects-config.js'),
  },
  batch: 'parallel-first',
}, {
  id: 'seo',
  expectations: require('./seo/expectations.js'),
  config: {
    path: './seo-config.js',
    value: require('./seo-config.js'),
  },
  batch: 'parallel-first',
}, {
  id: 'offline',
  expectations: require('./offline-local/offline-expectations.js'),
  config: {
    path: './offline-config.js',
    value: require('./offline-config.js'),
  },
  batch: 'offline',
}, {
  id: 'byte',
  expectations: require('./byte-efficiency/expectations.js'),
  config: {
    path: './byte-config.js',
    value: require('./byte-config.js'),
  },
  batch: 'perf-opportunity',
}, {
  id: 'perf',
  expectations: require('./perf/expectations.js'),
  config: {
    path: './perf/perf-config.js',
    value: require('./perf/perf-config.js'),
  },
  batch: 'perf-metric',
}, {
  id: 'lantern',
  expectations: require('./perf/lantern-expectations.js'),
  config: {
    path: './lantern-config.js',
    value: require('./lantern-config.js'),
  },
  batch: 'parallel-first',
}, {
  id: 'metrics',
  expectations: require('./tricky-metrics/expectations.js'),
  config: {
    path: '../../../lighthouse-core/config/perf-config.js',
    value: require('../../../lighthouse-core/config/perf-config.js'),
  },
  batch: 'parallel-second',
}];

// Convert `config.path` from a path relative to this directory, to one relative to the project
// root. This makes it possible to pass a path to Lighthouse via the CLI interface in
// `smokehouse.js`. Not needed and not possible in a browser context.
if (typeof window === 'undefined') {
  for (const test of smokeTests) {
    // Sanity check that the path is the same as the string used in `require`;
    assert(require(test.config.path) === test.config.value);

    test.config.path = resolveLocalOrProjectRoot(test.config.path);
    test.config.path = pathRelativeToProjectRoot(test.config.path);
  }
}

module.exports = smokeTests;
