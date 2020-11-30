/**
 * A widget to switch the imagery layer of a basemap.
 */

import cov = __cov;

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import { renderable, tsx } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

import Collection from 'esri/core/Collection';

import { whenOnce } from 'esri/core/watchUtils';

const CSS = {
  base: 'cov-basemap-imagery-selector esri-widget',
  heading: 'cov-basemap-imagery-selector--heading',
  radio: 'cov-basemap-imagery-selector--radio',
  title: 'cov-basemap-imagery-selector--title',
};

@subclass('cov.widgets.BasemapImagerySelector')
export default class BasemapImagerySelector extends Widget {
  @property()
  view: esri.MapView | esri.SceneView;

  @property()
  basemap: esri.Basemap;

  @property()
  imageryLayerIndex = 0;

  @property()
  defaultImageryTitle = 'Imagery';

  @property()
  @renderable()
  basemaps: Collection<cov.BasemapImagerySelectorBasemap> | cov.BasemapImagerySelectorBasemap[];

  constructor(properties: cov.BasemapImagerySelectorProperties) {
    super(properties);
  }

  postInitialize(): void {
    const { basemap, basemaps, defaultImageryTitle, imageryLayerIndex } = this;
    // cast array of basemaps as collection
    if (basemaps && Collection.isCollection(basemaps) === false) {
      // must set `this.basemaps` directly - let deconstruction will not work
      this.basemaps = new Collection(basemaps);
    }
    // add default layer to collection
    whenOnce(basemap, 'loaded', () => {
      (this.basemaps as Collection<cov.BasemapImagerySelectorBasemap>).add(
        {
          layer: basemap.baseLayers.getItemAt(imageryLayerIndex) as
            | esri.ImageryLayer
            | esri.ImageryTileLayer
            | esri.TileLayer
            | esri.BingMapsLayer,
          title: defaultImageryTitle,
        },
        0,
      );
    });
  }

  render(): tsx.JSX.Element {
    return (
      <div class={CSS.base}>
        <div class={CSS.heading}>Select basemap imagery</div>
        <ul>{this._createOptions()}</ul>
      </div>
    );
  }

  private _createOptions(): tsx.JSX.Element[] {
    return (this.basemaps as Collection<cov.BasemapImagerySelectorBasemap>)
      .toArray()
      .map((selectorBasemap: cov.BasemapImagerySelectorBasemap) => {
        const {
          // view: { map },
          basemap,
          imageryLayerIndex,
        } = this;
        const isCurrentLayer = selectorBasemap.layer === basemap.baseLayers.getItemAt(imageryLayerIndex);
        return (
          <li
            bind={this}
            onclick={() => {
              if (isCurrentLayer) {
                return;
              }
              // this may not work if imagery layer isn't at index 0 but when would that ever be the case?
              basemap.baseLayers.removeAt(imageryLayerIndex);
              basemap.baseLayers.add(selectorBasemap.layer, imageryLayerIndex);

              // TODO: handle BasemapToggle setting basemap if basemap is nextBasemap
              // set map's basemap if not this basemap
              // if (map.basemap !== basemap) map.set('basemap', basemap);
            }}
          >
            <span
              class={this.classes(CSS.radio, isCurrentLayer ? 'esri-icon-radio-checked' : 'esri-icon-radio-unchecked')}
              role="checkbox"
              checked={isCurrentLayer}
            ></span>
            <span class={CSS.title}>{selectorBasemap.title}</span>
          </li>
        );
      });
  }
}
