import esri = __esri;

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import Widget from 'esri/widgets/Widget';

import PopupTemplate from 'esri/PopupTemplate';

import CustomContent from 'esri/popup/content/CustomContent';

import Collection from 'esri/core/Collection';

import ActionButton from 'esri/support/actions/ActionButton';

import SimpleMarkerEditor from '../symbolEditors/SimpleMarkerEditor';

import SimpleLineEditor from '../symbolEditors/SimpleLineEditor';

import SimpleFillEditor from '../symbolEditors/SimpleFillEditor';

@subclass('cov.widgets.Markup.MarkupPopup')
export default class MarkupPopup extends PopupTemplate {
  @property()
  title = (evt: { graphic: esri.Graphic }) => {
    return `Markup ${evt.graphic.geometry.type}`;
  };

  @property()
  actions = new Collection<ActionButton>([
    new ActionButton({
      title: 'Edit Geometry',
      id: 'cov-markup-edit-geometry',
      className: 'esri-icon-edit',
    }),
    new ActionButton({
      title: 'Delete',
      id: 'cov-markup-edit-delete',
      className: 'esri-icon-trash',
    }),
    new ActionButton({
      title: 'Move Up',
      id: 'cov-markup-edit-move-up',
      className: 'esri-icon-up',
    }),
    new ActionButton({
      title: 'Move Down',
      id: 'cov-markup-edit-move-down',
      className: 'esri-icon-down',
    }),
  ]);

  @property()
  customContent = new CustomContent({
    creator: (evt: any): Widget => {
      const { graphic } = evt;
      // this is not same graphic that was clicked on
      switch (graphic.geometry.type) {
        case 'point':
          return new SimpleMarkerEditor({
            graphic,
          });
        case 'polyline':
          return new SimpleLineEditor({
            graphic,
          });
        case 'polygon':
          return new SimpleFillEditor({
            graphic,
          });
        default:
          return new Widget();
      }
    },
  });

  @property()
  content = [this.customContent];
}
