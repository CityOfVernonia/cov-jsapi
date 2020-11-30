

// TaxMapPopup
import esriConfig from 'esri/config';
import FeatureLayer from 'esri/layers/FeatureLayer';
import MapImageLayer from 'esri/layers/MapImageLayer';
import Map from 'esri/Map';
import PortalItem from 'esri/portal/PortalItem';
import MapView from 'esri/views/MapView';

import TaxMapPopup from '../src/popups/TaxMapPopup';

esriConfig.portalUrl = 'https://gisportal.vernonia-or.gov/portal';

const maps = new MapImageLayer({
  portalItem: new PortalItem({
    id: '9c3b13af5a0b4fe7b57316d14259f893',
  }),
});

const bndys = new FeatureLayer({
  portalItem: new PortalItem({
    id: '446df7b4f963459f901dbf6f37865c17',
  }),
  popupTemplate: new TaxMapPopup({
    taxMapsLayer: maps, 
  }),
});



console.log(bndys, maps);

const view = new MapView({
  map: new Map({
    basemap: 'streets-vector',
    layers: [
      maps,
      bndys,
    ],
  }),
  center: [-123.183, 45.862],
  zoom: 14,
  container: document.querySelector('div[data-cov-app]') as HTMLDivElement,
});

/*
// Markup dev
import esriConfig from 'esri/config';
import FeatureLayer from 'esri/layers/FeatureLayer';
import Map from 'esri/Map';
import PortalItem from 'esri/portal/PortalItem';
import MapView from 'esri/views/MapView';
import Markup from '../src/widgets/Markup';

esriConfig.portalUrl = 'https://gisportal.vernonia-or.gov/portal';

const view = new MapView({
  map: new Map({
    basemap: 'streets-vector',
    layers: [
      new FeatureLayer({
        title: 'Oregon Wetlands',
        portalItem: new PortalItem({
          id: 'fa8d00ea829c40979b882d2af3b6ae76',
        }),
      }),
    ],
  }),
  center: [-123.183, 45.862],
  zoom: 14,
  container: document.querySelector('div[data-cov-app]') as HTMLDivElement,
});

view.when(() => {
  view.ui.add(new Markup({
    view,
  }), 'top-right');
});
*/