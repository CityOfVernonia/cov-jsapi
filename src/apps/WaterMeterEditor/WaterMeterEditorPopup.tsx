import esri = __esri;

import { aliasOf, property, subclass } from 'esri/core/accessorSupport/decorators';

import { renderable, tsx } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

import PopupTemplate from 'esri/PopupTemplate';

import CustomContent from 'esri/popup/content/CustomContent';

interface ContentProperties extends esri.WidgetProperties {
  graphic: esri.Graphic;
}

const CSS = {
  th: 'esri-feature__field-header',
  td: 'esri-feature__field-data',
  button: 'esri-button',
};

@subclass('cov.apps.WaterMeterEditor.WaterMeterEditorPopup.Content')
class Content extends Widget {
  @property()
  graphic: esri.Graphic;

  @aliasOf('graphic.layer')
  layer: esri.FeatureLayer;

  @aliasOf('graphic.attributes')
  @renderable()
  attributes: Record<string, string | number | null>;

  constructor(properties: ContentProperties) {
    super(properties);
  }

  render(): tsx.JSX.Element {
    // const attributes = this.graphic.attributes;

    return (
      <div>
        <button class={CSS.button}>Edit Location</button>
      </div>
    );
  }
}

@subclass('cov.apps.WaterMeterEditor.WaterMeterEditorPopup')
export default class WaterMeterEditorPopup extends PopupTemplate {
  @property()
  title = `{WSC_ID} - {ADDRESS}`;

  @property()
  outFields = ['*'];

  @property()
  customContent = new CustomContent({
    outFields: ['*'],
    creator: (evt: any): Widget => {
      const graphic = evt.graphic as esri.Graphic;
      // const layer = graphic.layer as esri.FeatureLayer;

      return new Content({
        graphic,
      });
    },
  });

  @property()
  content = [this.customContent];
}
