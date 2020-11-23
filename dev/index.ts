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
