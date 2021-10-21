# Project Archived

See https://github.com/CityOfVernonia/core.

***

[![Build Status](https://travis-ci.com/CityOfVernonia/cov-jsapi.svg?branch=master)](https://travis-ci.com/CityOfVernonia/cov-jsapi) [![npm version](https://badge.fury.io/js/cov-jsapi.svg)](https://badge.fury.io/js/cov-jsapi)

# cov-jsapi

City of Vernonia widgets, CSS and more for use with [Esri's JavaScript API](https://developers.arcgis.com/javascript/).

## Install and Setup

```shell
npm install cov-jsapi
```

### TypeScript

Definitions in [index.d.ts](https://github.com/CityOfVernonia/cov-jsapi/blob/master/src/index.d.ts);

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

## Development

```shell
npm start
```

## CSS and Theming

This package uses [Sass](https://sass-lang.com/). The included widgets rely on shared CSS for tabs, forms, etc., as well as `arcgis-js-api` Sass variables.

The [City of Vernonia](https://www.vernonia-or.gov/) uses the [Sandstone](https://bootswatch.com/sandstone/) theme for its websites and apps. An application's `main.scss` should look something like...

```scss
// bootswatch sandstone theme
@import "~bootswatch/dist/sandstone/variables";

// arcgis calcite color variables
// don't need calcite colors for this theme
// @import "~arcgis-js-api/themes/base/colors/scss/variables.scss";

// arcgis sass theme functions
@import "~arcgis-js-api/themes/base/functions";

// arcgis color variables
// overrides defaults in @import "~arcgis-js-api/themes/base/_color";
$font-color: $gray-800 !default;
$interactive-font-color: $blue !default;
$background-color: $white !default;
$interactive-font-color--inverse: $white !default;
$background-color--inverse: $gray-700 !default;
$interactive-font-color--hover: offset-foreground-color($interactive-font-color, 25%) !default;
$background-color--hover: offset-background-color($background-color, 6%) !default;
$border-color--hover: offset-foreground-color($interactive-font-color, 50%) !default;
$border-color--active: lighten($interactive-font-color, 31.25%) !default;
$background-color--active: lighten($interactive-font-color, 62.5%) !default;
$background-color--offset: offset-background-color($background-color, 4%);
$background-color--offset-subtle: offset-background-color($background-color, 2.75%);
$button-color: $primary !default;
$button-color--bright: $teal !default;
$button-color--hover: darken($button-color, 10%) !default;
$button-color--inverse: $interactive-font-color--inverse !default;
$heading-color: $font-color !default;
$background-color--overlay: rgba(0, 0, 0, 0.7) !default;
$opacity--disabled: 0.4 !default;
$opacity--sortable: 0.75 !default;
$interactive-font-color--disabled: rgba($interactive-font-color, $opacity--disabled) !default;
$font-color--placeholder: rgba($font-color, $opacity--disabled) !default;
$border-color: rgba($interactive-font-color, 0.3) !default;
$border-color--subtle: rgba($interactive-font-color, 0.15) !default;
$border-color--contrast: rgba($interactive-font-color, 0.4) !default;
$border-color--error: $red !default;
$font-color--error: darken($red, 15%) !default;
$background-color--error: rgba($font-color--error, 0.1);
$smartmapping-slider__thumb-background-color: $interactive-font-color !default;
$smartmapping-slider__ramp-stroke-color: $interactive-font-color !default;

// widgets to include
// set to `false` here by default
// comment out widgets to include
// overrides defaults in @import "~arcgis-js-api/themes/base/_core.scss";
$include_AreaMeasurement2D: false !default;
$include_AreaMeasurement3D: false !default;
// $include_Attachments: false !default;
// $include_Attribution: false !default;
$include_BasemapGallery: false !default;
$include_BasemapLayerList: false !default;
// $include_BasemapToggle: false !default;
$include_Bookmarks: false !default;
$include_BuildingExplorer: false !default;
$include_ButtonMenu: false !default;
$include_ClassedColorSlider: false !default;
$include_ClassedSizeSlider: false !default;
$include_Compass: false !default;
$include_ColorSizeSlider: false !default;
$include_ColorSlider: false !default;
$include_CoordinateConversion: false !default;
$include_DatePicker: false !default;
$include_Daylight: false !default;
$include_Directions: false !default;
$include_DirectLineMeasurement3D: false !default;
$include_DistanceMeasurement2D: false !default;
$include_Editor: false !default;
$include_Expand: false !default;
$include_Feature: false !default;
$include_FeatureContent: false !default;
$include_FeatureForm: false !default;
$include_FeatureTable: false !default;
$include_FeatureTemplates: false !default;
$include_Grid: false !default;
$include_HeatmapSlider: false !default;
$include_Histogram: false !default;
$include_HistogramRangeSlider: false !default;
$include_IdentityForm: false !default;
$include_IdentityModal: false !default;
$include_ItemList: false !default;
// $include_LayerList: false !default;
// $include_Legend: false !default;
$include_LineOfSight: false !default;
$include_Measurement: false !default;
$include_NavigationToggle: false !default;
$include_OpacitySlider: false !default;
$include_Print: false !default;
// $include_Popup: false !default;
// $include_ScaleBar: false !default;
$include_ScaleRangeSlider: false !default;
// $include_Search: false !default;
$include_SizeSlider: false !default;
$include_Sketch: false !default;
$include_Slice: false !default;
$include_Slider: false !default;
$include_Spinner: false !default;
$include_Swipe: false !default;
$include_TableList: false !default;
$include_TimePicker: false !default;
$include_TimeSlider: false !default;
$include_Zoom: false !default;

// font
@import url("https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap");
$font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif,
  "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" !default;

// arcgis core will handle the rest
@import "~arcgis-js-api/themes/base/core";

// basic styles
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: $font-family;
  line-height: 1.55rem;
  font-feature-settings: "liga" 1, "calt" 0;
  background-color: $background-color;
  font-size: 14px;
}

$link: $interactive-font-color;
$link-hover: $interactive-font-color--hover;

a {
  color: $link;
  &:hover {
    color: $link-hover;
  }
}

// Because Pro sets anchor colors on the elements themselves
// in popup content and will probably clash with your theme.
.esri-feature a {
  color: $link !important;
  &:hover {
    color: $link-hover !important;
  }
}

// cov shared styles
@import "~cov-jsapi/src/css/cov";

// cov widgets
@import "~cov-jsapi/src/widgets/Disclaimer/styles/Disclaimer";
@import "~cov-jsapi/src/widgets/LayerListLegend/styles/LayerListLegend";
```

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
