import Map from 'esri/Map';
import MapView from 'esri/views/MapView';
import Markup from '../src/widgets/Markup';

const view = new MapView({
  map: new Map({
    basemap: 'streets-vector',
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
