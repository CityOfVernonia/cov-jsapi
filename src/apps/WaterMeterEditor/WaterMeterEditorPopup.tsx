import esri = __esri;

import { aliasOf, property, subclass } from 'esri/core/accessorSupport/decorators';

import { renderable, tsx } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

import PopupTemplate from 'esri/PopupTemplate';

import CustomContent from 'esri/popup/content/CustomContent';

import SketchViewModel from 'esri/widgets/Sketch/SketchViewModel';

import GraphicsLayer from 'esri/layers/GraphicsLayer';

interface ContentProperties extends esri.WidgetProperties {
  graphic: esri.Graphic;
  view: esri.MapView;
  layer: esri.FeatureLayer;
  parcelLink: string;
  meterLink: string;
}

interface WaterMeterEditorPopupProperties extends esri.PopupTemplateProperties {
  view: esri.MapView;
  parcelLink: string;
  meterLink: string;
}

const CSS = {
  base: 'esri-widget cov-water-meter-editor-popup',
  row: 'cov-water-meter-editor-popup--row',
  th: 'esri-feature__field-header',
  td: 'esri-feature__field-data',
  button: 'esri-button',
};

@subclass('cov.apps.WaterMeterEditor.WaterMeterEditorPopup.Content')
class Content extends Widget {
  @property()
  view: esri.MapView;

  @property()
  graphic: esri.Graphic;

  @property()
  parcelLink: string;

  @property()
  meterLink: string;

  // not working but why?
  // @aliasOf('graphic.layer')
  // layer: esri.FeatureLayer;

  @property()
  layer: esri.FeatureLayer;

  @aliasOf('graphic.attributes')
  @renderable()
  attributes: Record<string, string | number | null>;

  @property()
  sketch = new SketchViewModel({
    layer: new GraphicsLayer(),
  });

  constructor(properties: ContentProperties) {
    super(properties);
  }

  postInitialize(): void {
    this.sketch.view = this.view;
    this.view.map.add(this.sketch.layer);
    this.sketch.on('update', (evt: esri.SketchViewModelUpdateEvent) => {
      if (evt.state === 'complete') {
        this.sketch.layer.removeAll();
        this._updateFeature(evt.graphics[0]);
      }
    });
  }

  render(): tsx.JSX.Element {
    const attributes = this.graphic.attributes;
    return (
      <div class={CSS.base}>
        <div class={CSS.row}>
          <div>
            <p>
              <a href={this.parcelLink.replace('{MB_ID}', attributes.MB_ID)} target="_blank" rel="noopener">
                MuniBilling Parcel
              </a>
              <br />
              <a href={this.meterLink.replace('{METER_MB_ID}', attributes.METER_MB_ID)} target="_blank" rel="noopener">
                MuniBilling Meter Reads
              </a>
            </p>
            <p>
              Latitude: {attributes.LATITUDE}
              <br />
              Longitude: {attributes.LONGITUDE}
            </p>
          </div>
          <div>
            <p>
              <button class={CSS.button} bind={this} onclick={this._editGeometry}>
                Edit Location
              </button>
            </p>
            <p>
              <button class={CSS.button} bind={this} onclick={this._updateFeature.bind(this, this.graphic)}>
                Update Coordinates
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  private _editGeometry(): void {
    this.view.popup.close();
    this.sketch.layer.add(this.graphic);
    this.sketch.update(this.graphic);
  }

  private _updateFeature(graphic: esri.Graphic): void {
    graphic.attributes.LATITUDE = Number(graphic['geometry']['latitude'].toFixed(6));
    graphic.attributes.LONGITUDE = Number(graphic['geometry']['longitude'].toFixed(6));
    this.layer
      .applyEdits({
        updateFeatures: [graphic],
      })
      .then((/* applyEditsResult: any */) => {
        this.layer.refresh();
      });
  }
}

@subclass('cov.apps.WaterMeterEditor.WaterMeterEditorPopup')
export default class WaterMeterEditorPopup extends PopupTemplate {
  @property()
  view: esri.MapView;

  @property()
  parcelLink: string;

  @property()
  meterLink: string;

  @property()
  title = `{WSC_ID} - {ADDRESS}`;

  @property()
  outFields = ['*'];

  @property()
  customContent = new CustomContent({
    outFields: ['*'],
    creator: (evt: any): Widget => {
      return new Content({
        graphic: evt.graphic as esri.Graphic,
        view: this.view,
        layer: evt.graphic.layer as esri.FeatureLayer,
        parcelLink: this.parcelLink,
        meterLink: this.meterLink,
      });
    },
  });

  @property()
  content = [this.customContent];

  constructor(properties: WaterMeterEditorPopupProperties) {
    super(properties);
  }
}
