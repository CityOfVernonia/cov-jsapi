/**
 * A widget with tabbed Esri LayerList and Legend widgets.
 */

import cov = __cov;

import esri = __esri;

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import { renderable, tsx } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

import LayerListLegendMessages from './LayerListLegend/t9n/LayerListLegend.json';

import LayerList from 'esri/widgets/LayerList';

import Legend from 'esri/widgets/Legend';

const CSS = {
  base: 'esri-widget cov-layer-list-legend',
  tabs: 'cov-tabs',
  tabsContentWrapper: 'cov-tabs--content-wrapper',
  tabsContent: 'cov-tabs--content',
  tabsContentNoPadding: 'cov-tabs--content_no-padding',
};

@subclass('cov.widgets.LayerListLegend')
export default class LayerListLegend extends Widget {
  @property()
  @renderable()
  view: esri.MapView | esri.SceneView;

  @property()
  layerListProperties: esri.LayerListProperties = {};

  @property()
  legendProperties: esri.LegendProperties = {};

  // available in 4.17?
  // @property()
  // @messageBundle('cov/widgets/LayerListLegend/t9n/LayerListLegend')
  // messages: LayerListLegendMessages = null;

  @property()
  @renderable()
  private _activeTab = 'data-tab-0';

  constructor(properties?: cov.LayerListLegendProperties) {
    super(properties);
  }

  render(): tsx.JSX.Element {
    return (
      <div class={CSS.base}>
        {/* tabs */}
        <ul class={CSS.tabs} role="tablist">
          <li
            id={`tab_${this.id}_tab_0`}
            aria-selected={this._activeTab === 'data-tab-0' ? 'true' : 'false'}
            bind={this}
            onclick={() => {
              this._activeTab = 'data-tab-0';
            }}
          >
            {LayerListLegendMessages.layerListTab}
          </li>
          <li
            id={`tab_${this.id}_tab_1`}
            aria-selected={this._activeTab === 'data-tab-1' ? 'true' : 'false'}
            bind={this}
            onclick={() => {
              this._activeTab = 'data-tab-1';
            }}
          >
            {LayerListLegendMessages.legendTab}
          </li>
        </ul>
        {/* content */}
        <main class={CSS.tabsContentWrapper}>
          {/* layer list */}
          <section
            class={this.classes(CSS.tabsContent, CSS.tabsContentNoPadding)}
            aria-labelledby={`tab_${this.id}_tab_0`}
            role="tabcontent"
            style={`display:${this._activeTab === 'data-tab-0' ? 'block' : 'none'}`}
          >
            <div
              bind={this}
              afterCreate={(layerListDiv: HTMLDivElement) => {
                new LayerList({
                  container: layerListDiv,
                  view: this.view,
                  ...this.layerListProperties,
                });
              }}
            ></div>
          </section>
          {/* legend */}
          <section
            class={this.classes(CSS.tabsContent, CSS.tabsContentNoPadding)}
            aria-labelledby={`tab_${this.id}_tab_1`}
            role="tabcontent"
            style={`display:${this._activeTab === 'data-tab-1' ? 'block' : 'none'}`}
          >
            <div
              bind={this}
              afterCreate={(legendDiv: HTMLDivElement) => {
                new Legend({
                  container: legendDiv,
                  view: this.view,
                  ...this.legendProperties,
                });
              }}
            ></div>
          </section>
        </main>
      </div>
    );
  }
}
