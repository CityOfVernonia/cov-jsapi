import esri = __esri;

import Accessor from 'esri/core/Accessor';

import { property, subclass } from 'esri/core/accessorSupport/decorators';

// import { whenDefinedOnce } from 'esri/core/watchUtils';

@subclass('cov.widgets.Markup.MarkupViewModel')
export default class MarkupViewModel extends Accessor {
  @property() view: esri.MapView | esri.SceneView;

  constructor(properties?: any) {
    super(properties);
    // whenDefinedOnce(this, 'view', this.init.bind(this));
  }

  // init(view: esri.MapView | esri.SceneView): void {}
}
