/**
 * A widget to switch the imagery layer of a basemap.
 */

import cov = __cov;

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import { renderable, tsx } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

import Collection from 'esri/core/Collection';

const CSS = {
  base: 'cov-basemap-imagery-selector esri-widget',
  heading: 'cov-basemap-imagery-selector--heading',
  radio: 'cov-basemap-imagery-selector--radio',
  title: 'cov-basemap-imagery-selector--title',
};

@subclass('cov.widgets.BasemapImagerySelector')
export default class BasemapImagerySelector extends Widget {
  @property()
  basemap: esri.Basemap;

  @property()
  imageryLayerIndex = 0;

  @property()
  @renderable()
  basemaps: Collection<cov.BasemapImagerySelectorBasemap> | cov.BasemapImagerySelectorBasemap[] = new Collection();

  constructor(properties: cov.BasemapImagerySelectorProperties) {
    super(properties);
  }

  postInitialize(): void {
    if (this.basemaps && Collection.isCollection(this.basemaps) === false) {
      this.basemaps = new Collection(this.basemaps);
    }
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
      .map((basemap: cov.BasemapImagerySelectorBasemap) => {
        const isCurrentLayer = basemap.layer === this.basemap.baseLayers.getItemAt(0);
        return (
          <li
            bind={this}
            onclick={() => {
              if (isCurrentLayer) {
                return;
              }
              this.basemap.baseLayers.removeAt(0);
              this.basemap.baseLayers.add(basemap.layer, 0);
            }}
          >
            <span
              class={this.classes(CSS.radio, isCurrentLayer ? 'esri-icon-radio-checked' : 'esri-icon-radio-unchecked')}
              role="checkbox"
              checked={isCurrentLayer}
            ></span>
            <span class={CSS.title}>{basemap.title}</span>
          </li>
        );
      });
  }
}
