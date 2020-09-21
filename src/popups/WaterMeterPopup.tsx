import esri = __esri;

import { aliasOf, property, subclass } from 'esri/core/accessorSupport/decorators';

import { tsx } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

import PopupTemplate from 'esri/PopupTemplate';

import CustomContent from 'esri/popup/content/CustomContent';

import FeatureForm from 'esri/widgets/FeatureForm';

interface ContentProperties extends esri.WidgetProperties {
  graphic: esri.Graphic;
}

// const CSS = {
//   th: 'esri-feature__field-header',
//   td: 'esri-feature__field-data',
// };

@subclass('cov.popups.WaterMeterPopup.Content')
class Content extends Widget {
  @property()
  graphic: esri.Graphic;

  @aliasOf('graphic.layer')
  layer: esri.FeatureLayer;

  constructor(properties: ContentProperties) {
    super(properties);
    console.log(this);
  }

  render(): tsx.JSX.Element {
    // const attributes = this.graphic.attributes;

    return (
      <div class="esri-feature">
        <div class="esri-feature__size-container">
          <div class="esri-feature__main-container">
            <div>
              <div class="esri-feature__fields esri-feature__content-element">
                <table class="esri-widget__table"></table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

@subclass('cov.popups.WaterMeterPopup')
export default class WaterMeterPopup extends PopupTemplate {
  @property()
  title = `{WSC_ID} - {ADDRESS}`;

  @property()
  outFields = ['*'];

  @property()
  customContent = new CustomContent({
    outFields: ['*'],
    creator: (evt: any): Widget => {
      const graphic = evt.graphic as esri.Graphic;
      const layer = graphic.layer as esri.FeatureLayer;

      return layer.capabilities.operations.supportsEditing
        ? new FeatureForm({
            feature: graphic,
          })
        : new Content({
            graphic: evt.graphic,
          });
    },
  });

  @property()
  content = [this.customContent];
}
