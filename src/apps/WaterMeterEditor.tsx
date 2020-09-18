/**
 * A widget to display a disclaimer.
 */

import cov = __cov;

import { aliasOf, property, subclass } from 'esri/core/accessorSupport/decorators';
import { watch, whenTrueOnce } from 'esri/core/watchUtils';

import { renderable, tsx } from 'esri/widgets/support/widget';
import Widget from 'esri/widgets/Widget';

import Map from 'esri/Map';
import MapView from 'esri/views/MapView';

import Basemap from 'esri/Basemap';
import FeatureLayer from 'esri/layers/FeatureLayer';
import PortalItem from 'esri/portal/PortalItem';

import FormTemplate from 'esri/form/FormTemplate';
import FieldElement from 'esri/form/elements/FieldElement';
import FeatureForm from 'esri/widgets/FeatureForm';
import CodedValueDomain from 'esri/layers/support/CodedValueDomain';

import Search from 'esri/widgets/Search';
import LayerSearchSource from 'esri/widgets/Search/LayerSearchSource';

import WaterMeterEditorPopup from './WaterMeterEditor/WaterMeterEditorPopup';

const CSS = {
  base: 'cov-water-meter-editor',
  hidden: 'cov-water-meter-editor--hidden',
  header: 'cov-water-meter-editor--header',
  view: 'cov-water-meter-editor--view',
  side: 'esri-widget cov-water-meter-editor--side',

  tabs: 'cov-tabs',
  tabsContentWrapper: 'cov-tabs--content-wrapper',
  tabsContent: 'cov-tabs--content',
  tabsContentNoPadding: 'cov-tabs--content_no-padding',

  success: 'cov-water-meter-editor--success',
  error: 'cov-water-meter-editor--error',

  button: 'esri-button',
};

@subclass('cov.apps.WaterMeterEditor')
export default class WaterMeterEditor extends Widget {
  @property()
  layerPortalItemId: string;

  @property()
  layers: FeatureLayer[] = [];

  @property()
  @renderable()
  layer: FeatureLayer;

  @property()
  view = new MapView({
    map: new Map({
      basemap: new Basemap({
        portalItem: new PortalItem({
          id: 'b6130a13beb74026b89960fbd424021f',
        }),
      }),
    }),
    center: [-123.183, 45.862],
    zoom: 16,
    popup: {
      // autoOpenEnabled: false,
      dockEnabled: true,
      dockOptions: {
        position: 'bottom-right',
        breakpoint: false,
      },
    },
    constraints: {
      rotationEnabled: false,
    },
  });

  @aliasOf('view.popup.selectedFeature')
  @renderable()
  feature: esri.Graphic;

  @property()
  serviceForm = new FeatureForm({
    formTemplate: new FormTemplate({
      elements: [
        new FieldElement({
          fieldName: 'WSC_ID',
          label: 'Service Id',
          description: 'MuniBilling parcel number',
        }),
        new FieldElement({
          fieldName: 'ADDRESS',
          label: 'Address',
        }),
        new FieldElement({
          fieldName: 'WSC_TYPE',
          label: 'Service Type',
        }),
        new FieldElement({
          fieldName: 'ACCT_TYPE',
          label: 'Account Type',
        }),
        new FieldElement({
          fieldName: 'TAXLOT',
          label: 'Tax Lot Id',
        }),
        new FieldElement({
          fieldName: 'SEWER',
          label: 'Sewer Connection',
        }),
        new FieldElement({
          fieldName: 'IN_CITY',
          label: 'Inside City Limits',
        }),
        new FieldElement({
          fieldName: 'PLACENAME',
          label: 'Place',
          description: 'Non-residential only',
        }),
        new FieldElement({
          fieldName: 'MB_ID',
          label: 'MuniBilling Parcel Id',
          description: 'This value should only change in very rare instances',
        }),
      ],
    }),
  });

  @aliasOf('serviceForm.container')
  serviceFormContainer: HTMLDivElement;

  @property()
  meterForm = new FeatureForm({
    formTemplate: new FormTemplate({
      elements: [
        new FieldElement({
          fieldName: 'METER_MB_ID',
          label: 'MuniBilling Meter Id',
        }),
        new FieldElement({
          fieldName: 'METER_SIZE_D',
          label: 'Size',
          domain: new CodedValueDomain({
            codedValues: [
              {
                name: '3/4',
                code: 0.75,
              },
              {
                name: '1',
                code: 1,
              },
              {
                name: '1 1/2',
                code: 1.5,
              },
              {
                name: '2',
                code: 2,
              },
              {
                name: '3',
                code: 3,
              },
              {
                name: '4',
                code: 4,
              },
            ],
          }),
        }),
        new FieldElement({
          fieldName: 'METER_MFR',
          label: 'Manufacture Date (YYYY-MM)',
          description: 'Enter 9999-99 for unknown meter manufacture date',
        }),
        new FieldElement({
          fieldName: 'METER_SN',
          label: 'Serial Number',
        }),
        new FieldElement({
          fieldName: 'METER_REG_SN',
          label: 'Transmitter',
          description: 'Leave blank for non-radio meters',
        }),
      ],
    }),
  });

  @aliasOf('meterForm.container')
  meterFormContainer: HTMLDivElement;

  @property()
  @renderable()
  private _activeTab = 'data-tab-0';

  constructor(properties: cov.WaterMeterEditorProperties) {
    super(properties);
  }

  postInitialize(): void {
    const view = this.view;
    const serviceForm = this.serviceForm;
    const meterForm = this.meterForm;

    setTimeout(() => {
      view.container = document.querySelector('div[data-view-div]') as HTMLDivElement;
      serviceForm.container = document.querySelector('div[data-service-form-div]') as HTMLDivElement;
      meterForm.container = document.querySelector('div[data-meter-form-div]') as HTMLDivElement;
    }, 0);

    whenTrueOnce(view.map.basemap, 'loaded', () => {
      (view.map.basemap.baseLayers.getItemAt(0) as esri.ImageryTileLayer).interpolation = 'bilinear';
    });

    if (this.layers.length) {
      view.map.addMany(this.layers);
    }

    const layer = (this.layer = new FeatureLayer({
      portalItem: new PortalItem({
        id: this.layerPortalItemId,
      }),
      minScale: 24000,
      labelsVisible: false,
      popupTemplate: new WaterMeterEditorPopup({
        view,
      }),
    }));
    view.map.add(layer);

    serviceForm.layer = layer;
    meterForm.layer = layer;

    watch(view.popup, ['selectedFeature', 'visible'], this._setFormFeature.bind(this));

    // form.on('value-change', (evt: any) => {
    //   console.log(evt);
    // });

    // water meter search
    view.ui.add(
      new Search({
        view,
        includeDefaultSources: false,
        locationEnabled: false,
        sources: [
          new LayerSearchSource({
            layer: layer,
            outFields: ['*'],
            searchFields: ['WSC_ID', 'ADDRESS'],
            suggestionTemplate: '{WSC_ID} - {ADDRESS}',
            placeholder: 'Service Id or Address',
            name: 'Water meters',
            zoomScale: 3000,
          }),
        ],
      }),
      'top-right',
    );
  }

  private _setFormFeature() {
    const visible = this.view.popup.visible;
    this.serviceForm.set('feature', visible === true && this.feature.layer === this.layer ? this.feature : undefined);
    this.meterForm.set('feature', visible === true && this.feature.layer === this.layer ? this.feature : undefined);
    if (visible) {
      this.meterForm.formTemplate.title = `${this.feature.attributes.WSC_ID} - ${this.feature.attributes.ADDRESS}`;
    }
    this._serviceUpdateMessage = null;
    this._meterUpdateMessage = null;
  }

  render(): tsx.JSX.Element {
    return (
      <main class={CSS.base}>
        {/* header */}

        <div class={CSS.header}>
          <h1>Water Meter Editor</h1>
        </div>

        {/* view */}
        <div class={CSS.view} data-view-div=""></div>

        {/* side */}
        <div class={CSS.side}>
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
              Service Info
            </li>
            <li
              id={`tab_${this.id}_tab_1`}
              aria-selected={this._activeTab === 'data-tab-1' ? 'true' : 'false'}
              bind={this}
              onclick={() => {
                this._activeTab = 'data-tab-1';
              }}
            >
              Meter Info
            </li>
            {/* <li
              id={`tab_${this.id}_tab_2`}
              aria-selected={this._activeTab === 'data-tab-2' ? 'true' : 'false'}
              bind={this}
              onclick={() => {
                this._activeTab = 'data-tab-2';
              }}
            >
              New Meter
            </li> */}
          </ul>

          {/* tab content */}
          <main class={CSS.tabsContentWrapper}>
            {/* edit service */}
            <section
              class={CSS.tabsContent}
              aria-labelledby={`tab_${this.id}_tab_0`}
              role="tabcontent"
              style={`display:${this._activeTab === 'data-tab-0' ? 'block' : 'none'}`}
            >
              <p class={this.serviceForm.feature ? CSS.hidden : ''}>Select a water meter to edit service info.</p>
              <div class={this.serviceForm.feature ? '' : CSS.hidden}>
                <div data-service-form-div=""></div>
                <button
                  type="button"
                  class={CSS.button}
                  bind={this}
                  onclick={this._updateAttributes.bind(this, this.serviceForm, 'service')}
                >
                  Update Service Info
                </button>
                {this._serviceUpdateMessage}
              </div>
            </section>

            {/* edit meter */}
            <section
              class={CSS.tabsContent}
              aria-labelledby={`tab_${this.id}_tab_1`}
              role="tabcontent"
              style={`display:${this._activeTab === 'data-tab-1' ? 'block' : 'none'}`}
            >
              <p class={this.meterForm.feature ? CSS.hidden : ''}>Select a water meter to edit meter info.</p>
              <div class={this.meterForm.feature ? '' : CSS.hidden}>
                <div data-meter-form-div=""></div>
                <button
                  type="button"
                  class={CSS.button}
                  bind={this}
                  onclick={this._updateAttributes.bind(this, this.meterForm, 'meter')}
                >
                  Update Meter Info
                </button>
                {this._meterUpdateMessage}
              </div>
            </section>

            {/* new meter */}
            {/* <section
              class={CSS.tabsContent}
              aria-labelledby={`tab_${this.id}_tab_2`}
              role="tabcontent"
              style={`display:${this._activeTab === 'data-tab-2' ? 'block' : 'none'}`}
            >
              <button class={CSS.button}>New Meter</button>
            </section> */}
          </main>
        </div>
      </main>
    );
  }

  private _disableForms(disable: boolean): void {
    this.serviceFormContainer.querySelectorAll('fieldset').forEach((fieldset: HTMLFieldSetElement) => {
      disable ? fieldset.setAttribute('disabled', 'disabled') : fieldset.removeAttribute('disabled');
    });
    this.meterFormContainer.querySelectorAll('fieldset').forEach((fieldset: HTMLFieldSetElement) => {
      disable ? fieldset.setAttribute('disabled', 'disabled') : fieldset.removeAttribute('disabled');
    });
  }

  @property()
  @renderable()
  private _serviceUpdateMessage: tsx.JSX.Element | null = null;

  @property()
  @renderable()
  private _meterUpdateMessage: tsx.JSX.Element | null = null;

  // update feature attributes
  private _updateAttributes(featureForm: FeatureForm, source: 'service' | 'meter') {
    const { getValues, feature, layer } = featureForm;
    const values = getValues();

    // disable form
    this._disableForms(true);

    // clear messages
    this._serviceUpdateMessage = null;
    this._meterUpdateMessage = null;

    Object.keys(values).forEach((fieldName: string) => {
      feature.attributes[fieldName] = values[fieldName];
    });

    layer
      .applyEdits({
        updateFeatures: [feature],
      })
      .then((applyEditsResult: any) => {
        this._disableForms(false);
        if (!applyEditsResult.updateFeatureResults[0] || applyEditsResult.updateFeatureResults[0].error) {
          if (source === 'service') {
            this._serviceUpdateMessage = <p class={CSS.error}>An error occurred</p>;
          } else {
            this._meterUpdateMessage = <p class={CSS.error}>An error occurred</p>;
          }
          return;
        }
        this.layer.refresh();
        if (source === 'service') {
          this._serviceUpdateMessage = <p class={CSS.success}>Successfully updated</p>;
        } else {
          this._meterUpdateMessage = <p class={CSS.success}>Successfully updated</p>;
        }
      })
      .catch((applyEditsError: esri.Error) => {
        console.log(applyEditsError);
        this._disableForms(false);
        if (source === 'service') {
          this._serviceUpdateMessage = <p class={CSS.error}>An error occurred</p>;
        } else {
          this._meterUpdateMessage = <p class={CSS.error}>An error occurred</p>;
        }
      });
  }
}
