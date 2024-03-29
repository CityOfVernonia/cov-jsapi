import esri = __esri;

import { whenOnce } from 'esri/core/watchUtils';

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import { renderable, tsx } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

import PopupTemplate from 'esri/PopupTemplate';

import CustomContent from 'esri/popup/content/CustomContent';

interface ContentProperties extends esri.WidgetProperties {
  graphic: esri.Graphic;
}

let KEY = 0;

const CSS = {
  th: 'esri-feature__field-header',
  td: 'esri-feature__field-data',
};

@subclass('cov.popups.TaxLotPopup.Content')
class Content extends Widget {
  @property()
  graphic: esri.Graphic;

  @property()
  @renderable()
  accessorValues: tsx.JSX.Element[] = [];

  constructor(properties: ContentProperties) {
    super(properties);
  }

  postInitialize() {
    whenOnce(this, 'graphic', this.getAccessorValues.bind(this));
  }

  getAccessorValues(): void {
    const { graphic, accessorValues } = this;
    const { layer, attributes } = graphic;

    const objectId = attributes[(layer as esri.FeatureLayer).objectIdField] as number;

    (layer as esri.FeatureLayer)
      .queryRelatedFeatures({
        outFields: ['*'],
        relationshipId: 0,
        objectIds: [objectId],
      })
      .then((result: any) => {
        const features = result[objectId].features;

        if (features.length) {
          features.forEach((feature: any): void => {
            const { attributes } = feature;

            accessorValues.push(
              <tr key={KEY++}>
                <td class={CSS.td}>
                  <strong>Tax Account {attributes.ACCOUNT_ID}</strong>
                </td>
                <td>Land / Improvement Values</td>
              </tr>,
            );

            accessorValues.push(
              <tr key={KEY++}>
                <th class={CSS.th}>Assessed Value</th>
                <td class={CSS.td}>
                  ${attributes.AV_LAND.toLocaleString('en')} / ${attributes.AV_IMPR.toLocaleString('en')}
                </td>
              </tr>,
            );

            accessorValues.push(
              <tr key={KEY++}>
                <th class={CSS.th}>Real Market Value</th>
                <td class={CSS.td}>
                  ${attributes.RMV_LAND.toLocaleString('en')} / ${attributes.RMV_IMPR.toLocaleString('en')}
                </td>
              </tr>,
            );
          });
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  }

  render(): tsx.JSX.Element {
    const attributes = this.graphic.attributes;

    if (attributes.BNDY_CLIPPED) {
      return (
        <p>
          Note: This tax lot is clipped to the City of Vernonia area spatial extent. No tax lot data is provided here.
          Please visit the{' '}
          <a href="https://www.columbiacountyor.gov/departments/Assessor" target="_blank" rel="noopener">
            Columbia County Assessor's
          </a>{' '}
          web site for tax lot information.
        </p>
      );
    }

    return (
      <table class="esri-widget__table">
        {/* tax lot id */}
        <tr>
          <th class={CSS.th}>Tax Lot</th>
          {attributes.VERNONIA === 1 ? (
            <td class={CSS.td}>
              <a href={`https://www.vernonia-or.gov/tax-lot/${attributes.TAXLOT_ID}/`} target="_blank">
                {attributes.TAXLOT_ID}
              </a>
            </td>
          ) : (
            <td class={CSS.td}>{attributes.TAXLOT_ID}</td>
          )}
        </tr>
        {/* tax map */}
        <tr>
          <th class={CSS.th}>Tax Map</th>
          <td class={CSS.td}>
            <a
              href={`http://65.122.151.216/geomoose2/taxlots_map_images/${attributes.TAXMAP}`}
              target="_blank"
              rel="noopener"
            >
              {`${attributes.TOWN}${attributes.TOWN_DIR}${attributes.RANGE}${attributes.RANGE_DIR} ${attributes.SECTION} ${attributes.QTR}${attributes.QTR_QTR}`}
            </a>
          </td>
        </tr>
        {/* owner */}
        <tr>
          <th class={CSS.th}>Owner</th>
          <td class={CSS.td}>{attributes.OWNER}</td>
        </tr>
        {/* address */}
        {attributes.ADDRESS ? (
          <tr>
            <th class={CSS.th}>Address (Primary Situs)</th>
            <td class={CSS.td}>
              <a
                href={`https://www.google.com/maps/place/${attributes.ADDRESS.split(' ').join('+')}+${
                  attributes.CITY
                }=${attributes.STATE}+${attributes.ZIP}/data=!3m1!1e3`}
                target="_blank"
                rel="noopener"
              >
                {attributes.ADDRESS}
              </a>
            </td>
          </tr>
        ) : null}
        {/* area */}
        <tr>
          <th class={CSS.th}>Area</th>
          <td class={CSS.td}>
            <span style="margin-right:0.75rem;">{`${attributes.ACRES} acres`}</span>
            <span>{`${attributes.SQ_FEET.toLocaleString()} sq ft`}</span>
          </td>
        </tr>
        {/* tax accounts */}
        <tr>
          <th class={CSS.th}>Tax Account(s)</th>
          <td class={CSS.td}>
            {attributes.ACCOUNT_IDS
              ? attributes.ACCOUNT_IDS.split(',').map((accountId: string) => {
                  return (
                    <a
                      style="margin-right:0.75rem;"
                      href={`https://propertyquery.columbiacountyor.gov/columbiaat/MainQueryDetails.aspx?AccountID=${accountId}&QueryYear=2021&Roll=R`}
                      target="_blank"
                      rel="noopener"
                    >
                      {accountId}
                    </a>
                  );
                })
              : 'No related tax account'}
          </td>
        </tr>
        {/* assessor values */}
        {this.accessorValues}
      </table>
    );
  }
}

@subclass('cov.popups.TaxLotPopup')
export default class TaxLotPopup extends PopupTemplate {
  @property()
  title = `{TAXLOT_ID}`;

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
