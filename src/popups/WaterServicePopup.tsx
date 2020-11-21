import esri = __esri;

import { aliasOf, property, subclass } from 'esri/core/accessorSupport/decorators';

import { tsx } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

import PopupTemplate from 'esri/PopupTemplate';

import CustomContent from 'esri/popup/content/CustomContent';

interface ContentProperties extends esri.WidgetProperties {
  graphic: esri.Graphic;
}

const CSS = {
  th: 'esri-feature__field-header',
  td: 'esri-feature__field-data',
};

@subclass('cov.popups.WaterServicePopup.Content')
class Content extends Widget {
  @property()
  graphic: esri.Graphic;

  @aliasOf('graphic.layer')
  layer: esri.FeatureLayer;

  constructor(properties: ContentProperties) {
    super(properties);
  }

  render(): tsx.JSX.Element {
    const attributes = this.graphic.attributes;

    return (
      <div class="esri-feature">
        <div class="esri-feature__size-container">
          <div class="esri-feature__main-container">
            <div>
              <div class="esri-feature__fields esri-feature__content-element">
                <table class="esri-widget__table">
                  <tr>
                    <th class={CSS.th}>Service Type</th>
                    <td class={CSS.td}></td>
                  </tr>
                  <tr>
                    <th class={CSS.th}>Size</th>
                    <td class={CSS.td}></td>
                  </tr>
                  <tr>
                    <th class={CSS.th}>Meter S/N</th>
                    <td class={CSS.td}></td>
                  </tr>
                  <tr>
                    <th class={CSS.th}>Transmitter No.</th>
                    <td class={CSS.td}></td>
                  </tr>
                  <tr>
                    <th class={CSS.th}>MuniBilling Parcel</th>
                    <td class={CSS.td}>
                      <a href={`https://secvre.munibilling.com/parcels/${attributes.MB_ID}/edit`} target></a>
                    </td>
                  </tr>
                  <tr>
                    <th class={CSS.th}></th>
                    <td class={CSS.td}></td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

@subclass('cov.popups.WaterServicePopup')
export default class WaterServicePopup extends PopupTemplate {
  @property()
  title = `{WSC_ID} - {ADDRESS}`;

  @property()
  outFields = ['*'];

  @property()
  customContent = new CustomContent({
    outFields: ['*'],
    creator: (evt: any): Widget => {
      return new Content({
        graphic: evt.graphic,
      });
    },
  });

  @property()
  content = [this.customContent];
}
