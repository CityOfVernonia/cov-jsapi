[![Build Status](https://travis-ci.com/CityOfVernonia/cov-jsapi.svg?branch=master)](https://travis-ci.com/CityOfVernonia/cov-jsapi) [![npm version](https://badge.fury.io/js/cov-jsapi.svg)](https://badge.fury.io/js/cov-jsapi)

# cov-jsapi

City of Vernonia widgets, CSS and more for use with [Esri's JavaScript API](https://developers.arcgis.com/javascript/).

## Install and Setup

```shell
npm install cov-jsapi
```

### TypeScript

Include the `src` directory in `tsconfig.json`.

```json
{
  "include": [
    "node_modules/cov-jsapi/src/**/*"
  ]
}
```

### webpack

Add package alias in `webpack.config.js`.

```javascript
const path = require('path');

module.exports = {
  resolve: {
    alias: {
      cov: path.resolve(__dirname, 'node_modules/cov-jsapi/src/'),
    },
  },
};
```

## CSS and Theming

This package uses [Sass](https://sass-lang.com/). The included widgets rely on shared CSS for tabs, forms, etc., as well as `arcgis-js-api` Sass variables.

The [City of Vernonia](https://www.vernonia-or.gov/) uses the [Sandstone](https://bootswatch.com/sandstone/) theme for its websites and apps. For conformity the sandstone `arcgis-js-api` theme is provided via `src/css/sandstone.scss`.

Add it to a webpack application's main `*.scss` file and Bob's your uncle.

## License

MIT License

Copyright (c) 2020 City of Vernonia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
