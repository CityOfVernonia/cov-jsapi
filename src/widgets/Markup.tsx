import cov = __cov;

// core modules
import { whenOnce, watch } from 'esri/core/watchUtils';
import { property, subclass } from 'esri/core/accessorSupport/decorators';
import { renderable, tsx } from 'esri/widgets/support/widget';
import Widget from 'esri/widgets/Widget';

// view models
// import MarkupViewModel from './Markup/MarkupViewModel';
import UnitsViewModel from '../viewModels/UnitsViewModel';
import SketchViewModel from 'esri/widgets/Sketch/SketchViewModel';

// layers and graphic
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import GroupLayer from 'esri/layers/GroupLayer';
import Graphic from 'esri/Graphic';

// popup templates and content
import PopupTemplate from 'esri/PopupTemplate';
import Collection from 'esri/core/Collection';
import ActionButton from 'esri/support/actions/ActionButton';
import CustomContent from 'esri/popup/content/CustomContent';
import TextEditor from './symbolEditors/TextEditor';
import SimpleMarkerEditor from './symbolEditors/SimpleMarkerEditor';
import SimpleLineEditor from './symbolEditors/SimpleLineEditor';
import SimpleFillEditor from './symbolEditors/SimpleFillEditor';
import { TextSymbol } from 'esri/symbols';

// tools
import { load as projectionLoad, isLoaded as projectionIsLoaded, project } from 'esri/geometry/projection';
import { geodesicBuffer, offset } from 'esri/geometry/geometryEngine';
import SpatialReference from 'esri/geometry/SpatialReference';

// icons
import { textLarge16 } from '@esri/calcite-ui-icons/js/textLarge16.js';

// widget styles
const CSS = {
  base: 'esri-widget cov-markup',
  tabs: 'cov-tabs',
  tabsContentWrapper: 'cov-tabs--content-wrapper',
  tabsContent: 'cov-tabs--content',
  buttonGroup: 'cov-markup--button-group',
  buttonDisabled: 'cov-markup--button-disabled',
  textGroup: 'cov-markup--text-group',
  icons: {
    point: 'esri-icon-map-pin',
    polyline: 'esri-icon-polyline',
    polygon: 'esri-icon-polygon',
    rectangle: 'esri-icon-checkbox-unchecked',
    circle: 'esri-icon-radio-unchecked',
    plus: 'esri-icon-plus',
    edit: 'esri-icon-edit',
    trash: 'esri-icon-trash',
    up: 'esri-icon-up',
    down: 'esri-icon-down',
  },
  icon: 'esri-icon',
  svg: 'cov-markup--svg',
  fallbackText: 'esri-icon-font-fallback-text',
  button: 'esri-button',
  widgetButton: 'esri-widget--button',
  input: 'esri-input',
  select: 'esri-select',
  form: 'cov-form',
  formDisabled: 'disabled',
  formRow: 'cov-form--row',
  formControl: 'cov-form--control',
};

@subclass('cov.widgets.Markup')
export default class Markup extends Widget {
  /**
   * Constructor properties.
   */
  @property()
  view: esri.MapView | esri.SceneView;

  @property()
  textSymbol = new TextSymbol({
    text: 'New Text',
    haloSize: 1,
    haloColor: 'white',
    font: {
      size: 10,
    },
  });

  @property({
    type: SketchViewModel,
  })
  sketchViewModel: SketchViewModel = new SketchViewModel({
    layer: new GraphicsLayer({
      listMode: 'hide',
    }),
  });

  @property()
  offsetProjectionWkid = 26910;

  @property()
  projectsWidget: any;

  /**
   * Layers.
   */
  @property({
    type: GroupLayer,
  })
  readonly layers = new GroupLayer({
    listMode: 'hide',
  });

  @property({
    type: GraphicsLayer,
  })
  readonly text = new GraphicsLayer({
    listMode: 'hide',
  });

  @property({
    type: GraphicsLayer,
  })
  readonly point = new GraphicsLayer({
    listMode: 'hide',
  });

  @property({
    type: GraphicsLayer,
  })
  readonly polyline = new GraphicsLayer({
    listMode: 'hide',
  });

  @property({
    type: GraphicsLayer,
  })
  readonly polygon = new GraphicsLayer({
    listMode: 'hide',
  });

  @property({
    type: GraphicsLayer,
    aliasOf: 'sketchViewModel.layer',
  })
  readonly sketch: GraphicsLayer;

  /**
   * Private widget properties.
   */
  // view/popup selected feature
  @property({
    aliasOf: 'view.popup.selectedFeature',
  })
  @renderable()
  private _selectedFeature: Graphic | null;

  // flag create point as text
  @property()
  private _text = false;

  // UVM for tools selects
  @property({
    type: UnitsViewModel,
  })
  private _units = new UnitsViewModel();

  // active tab
  @property()
  @renderable()
  private _activeTab = 0;

  constructor(properties?: cov.MarkupProperties) {
    super(properties);
  }

  postInitialize(): void {
    whenOnce(this, 'view', this._initialize.bind(this));
  }

  /**
   * Adds feature layer feature to proper markup layer.
   * Will use selected feature if `graphic` is not provided and feature is selected and popup is open.
   * @param graphic
   */
  addGraphicToMarkup(graphic?: Graphic): void {
    const { view, _selectedFeature } = this;
    if (!graphic && view.popup.visible && _selectedFeature) {
      graphic = _selectedFeature as Graphic;
    } else if (!graphic || this._isMarkup(graphic) || !graphic.layer || graphic.layer.type !== 'feature') {
      return;
    }
    // query feature to get exact geometry
    const layer = graphic.layer as esri.FeatureLayer;
    (layer as esri.FeatureLayer)
      .queryFeatures({
        objectIds: [graphic.attributes[layer.objectIdField]],
        outFields: [layer.objectIdField],
        returnGeometry: true,
      })
      .then((result: esri.FeatureSet) => {
        if (!result.features[0]) return;
        this._add(result.features[0]);
      });
  }

  /**
   * Courtesy method to cancel SVM when a parent widget hides/closes this widget.
   */
  onHide(): void {
    const { sketchViewModel } = this;
    if (sketchViewModel.state !== 'ready') sketchViewModel.cancel();
  }

  private _initialize(): void {
    const { view, sketchViewModel, projectsWidget, layers, point, polyline, polygon, text } = this;
    let { sketch } = this;
    const { map } = view;

    // ensure sketch if SVM provided to constructor
    if (!sketch) {
      sketch = new GraphicsLayer({
        listMode: 'hide',
      });
    }

    // set project widget properties
    if (projectsWidget) {
      projectsWidget.text = text;
      projectsWidget.point = point;
      projectsWidget.polygon = polygon;
      projectsWidget.polyline = polyline;
    }

    // widget layers
    layers.addMany([polygon, polyline, point, text, sketch]);
    // add layers to map
    map.add(layers);
    // watch `layers` and stick group layer as top layer
    watch(map, 'layers.length', (value: number) => {
      const index = value - 1;
      if (map.layers.indexOf(layers) !== index) map.layers.reorder(layers, index);
    });

    // sketch view model
    sketchViewModel.view = view;
    // wire up create event
    sketchViewModel.on('create', (createEvent: esri.SketchViewModelCreateEvent) => {
      const { state, graphic } = createEvent;
      // clear text flag
      if (state === 'cancel') this._text = false;
      if (state !== 'complete') return;
      this._add(graphic);
      // clear text flag
      this._text = false;
    });
    // wire up update event
    sketchViewModel.on('update', this._update.bind(this));

    // wire up popup actions
    view.popup.on('trigger-action', (triggerEvent: esri.PopupTriggerActionEvent) => {
      switch (triggerEvent.action.id) {
        // delete graphic
        case 'cov-markup-edit-delete':
          this._delete();
          break;
        // edit geometry
        case 'cov-markup-edit-geometry':
          this._editGeometry();
          break;
        // move up on layer
        case 'cov-markup-edit-move-up':
          this._up();
          break;
        // move down on layer
        case 'cov-markup-edit-move-down':
          this._down();
          break;
        default:
          break;
      }
    });

    // load projection
    if (!projectionIsLoaded()) {
      projectionLoad();
    }
  }

  /**
   * Is a graphic markup or not.
   * @param graphic
   */
  private _isMarkup(graphic: Graphic): boolean {
    const { layer } = graphic;
    const { text, point, polyline, polygon } = this;
    return layer === text || layer === point || layer === polyline || layer === polygon ? true : false;
  }

  /**
   * Cause SVM to create.
   * @param tool
   * @param text
   */
  private _create(tool: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle', text?: boolean): void {
    const { view, sketchViewModel } = this;
    view.popup.close();
    sketchViewModel.create(tool);
    this._text = text ? true : false;
  }

  /**
   * Add new sketched graphic to appropriate layer after setting popup and the appropriate symbol.
   * @param createEvent
   */
  private _add(graphic: Graphic): void {
    const { textSymbol, sketchViewModel, _text, text, point, polyline, polygon } = this;
    const type = graphic.geometry.type;

    // bad graphic returned by creator()
    // graphic.popupTemplate = new MarkupPopup();
    // popup template
    graphic.popupTemplate = new PopupTemplate({
      title: `Markup ${_text ? 'text' : type}`,
      actions: new Collection<ActionButton>([
        new ActionButton({
          title: 'Edit Geometry',
          id: 'cov-markup-edit-geometry',
          className: CSS.icons.edit,
        }),
        new ActionButton({
          title: 'Delete',
          id: 'cov-markup-edit-delete',
          className: CSS.icons.trash,
        }),
        new ActionButton({
          title: 'Move Up',
          id: 'cov-markup-edit-move-up',
          className: CSS.icons.up,
        }),
        new ActionButton({
          title: 'Move Down',
          id: 'cov-markup-edit-move-down',
          className: CSS.icons.down,
        }),
      ]),
      content: [
        new CustomContent({
          creator: (): Widget => {
            switch (type) {
              case 'point':
                return _text
                  ? new TextEditor({
                      graphic,
                    })
                  : new SimpleMarkerEditor({
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
        }),
      ],
    });

    // handle text
    if (_text) {
      graphic.symbol = textSymbol.clone();
      (graphic.symbol as TextSymbol).text =
        (document.querySelector('input[data-cov-markup-text-input]') as HTMLInputElement).value || 'New Text';
      text.add(graphic);
      return;
    }

    // symbol
    graphic.symbol = sketchViewModel[`${type}Symbol`];
    // add to layer
    switch (type) {
      case 'point':
        point.add(graphic);
        break;
      case 'polyline':
        polyline.add(graphic);
        break;
      case 'polygon':
        polygon.add(graphic);
        break;
      default:
        break;
    }
  }

  /**
   * Begin editing the geometry of a selected markup graphic.
   */
  private _editGeometry() {
    const { view, _selectedFeature: graphic, sketchViewModel } = this;
    if (!graphic || !this._isMarkup(graphic)) return;
    view.popup.close();
    (graphic.layer as GraphicsLayer).remove(graphic);
    sketchViewModel.layer.add(graphic);
    sketchViewModel.update(graphic);
  }

  /**
   * Add updated graphic to appropriate layer.
   * @param updateEvent
   */
  private _update(updateEvent: esri.SketchViewModelUpdateEvent): void {
    const { point, polyline, polygon } = this;
    const { state, graphics } = updateEvent;
    // methinks there's a way to deconstruct this...
    const graphic = graphics[0];
    if (state !== 'complete') return;
    switch (graphic.geometry.type) {
      case 'point':
        point.add(graphic);
        break;
      case 'polyline':
        polyline.add(graphic);
        break;
      case 'polygon':
        polygon.add(graphic);
        break;
      default:
        break;
    }
  }

  /**
   * Delete selected markup graphic.
   */
  private _delete(): void {
    const { view, _selectedFeature: graphic } = this;
    if (!graphic || !this._isMarkup(graphic)) return;
    view.popup.close();
    (graphic.layer as GraphicsLayer).remove(graphic);
  }

  /**
   * Move selected markup graphic up on its layer.
   */
  private _up(): void {
    const { _selectedFeature: graphic } = this;
    if (!graphic || !this._isMarkup(graphic)) return;
    const collection = graphic.get('layer.graphics') as esri.Collection<esri.Graphic>;
    const idx = collection.indexOf(graphic);
    if (idx < collection.length - 1) {
      collection.reorder(graphic, idx + 1);
    }
  }

  /**
   * Move selected markup graphic down on its layer.
   */
  private _down(): void {
    const { _selectedFeature: graphic } = this;
    if (!graphic || !this._isMarkup(graphic)) return;
    const collection = graphic.get('layer.graphics') as esri.Collection<esri.Graphic>;
    const idx = collection.indexOf(graphic);
    if (idx > 0) {
      collection.reorder(graphic, idx - 1);
    }
  }

  /**
   * Buffer selected graphic.
   * @param evt
   */
  private _buffer(evt: Event) {
    evt.preventDefault();
    const target = evt.target as HTMLFormElement;
    const {
      DIST: { value: distance },
      UNIT: { value: unit },
    } = target;
    const { view, _selectedFeature: feature } = this;
    if (!feature || !view.popup.visible) return;
    const {
      layer,
      layer: { type: layerType },
      geometry,
    } = feature;
    if (layerType === 'graphics') {
      this._add(
        new Graphic({
          geometry: geodesicBuffer(geometry, target.DIST.value, target.UNIT.value) as esri.Polygon,
        }),
      );
    } else if (layerType === 'feature') {
      (layer as esri.FeatureLayer)
        .queryFeatures({
          objectIds: [feature.attributes[(layer as esri.FeatureLayer).objectIdField]],
          outFields: [(layer as esri.FeatureLayer).objectIdField],
          returnGeometry: true,
          outSpatialReference: view.spatialReference,
        })
        .then((result: esri.FeatureSet) => {
          if (!result.features[0]) return;
          this._add(
            new Graphic({
              geometry: geodesicBuffer(result.features[0].geometry, distance, unit) as esri.Polygon,
            }),
          );
        });
    }
  }

  /**
   * Offset selected graphic.
   * @param evt
   */
  private _offset(evt: Event) {
    evt.preventDefault();
    const target = evt.target as HTMLFormElement;
    const {
      DIST: { value: distance },
      UNIT: { value: unit },
      SIDE: { value: side },
      JOIN: { value: join },
    } = target;
    const {
      view,
      view: { spatialReference },
      _selectedFeature: feature,
    } = this;
    if (!feature || !view.popup.visible) return;
    const {
      layer,
      layer: { type: layerType },
      geometry,
    } = feature;
    if (layerType === 'graphics') {
      this._offsetGeometry(geometry as esri.Polyline, distance, unit, side, join);
    } else if (layerType === 'feature') {
      (layer as esri.FeatureLayer)
        .queryFeatures({
          objectIds: [feature.attributes[(layer as esri.FeatureLayer).objectIdField]],
          outFields: [(layer as esri.FeatureLayer).objectIdField],
          returnGeometry: true,
          outSpatialReference: spatialReference,
        })
        .then((result: esri.FeatureSet) => {
          if (!result.features[0]) return;
          this._offsetGeometry(result.features[0].geometry as esri.Polyline, distance, unit, side, join);
        });
    }
  }

  /**
   * Complete offset.
   * @param geometry
   * @param distance
   * @param unit
   * @param side
   * @param join
   */
  private _offsetGeometry(
    geometry: esri.Polyline,
    distance: number,
    unit: number | 'meters' | 'feet' | 'kilometers' | 'miles' | 'nautical-miles' | 'yards',
    side: 'both' | 'right' | 'left',
    join: 'round' | 'bevel' | 'miter' | 'square',
  ): void {
    let left;
    let right;
    const {
      view: { spatialReference },
      offsetProjectionWkid,
    } = this;

    const projectedGeometry = project(
      geometry,
      new SpatialReference({
        wkid: offsetProjectionWkid,
      }),
    );

    switch (side) {
      case 'both':
        left = offset(projectedGeometry, distance * -1, unit, join);
        right = offset(projectedGeometry, distance, unit, join);
        break;
      case 'right':
        right = offset(projectedGeometry, distance, unit, join);
        break;
      case 'left':
        left = offset(projectedGeometry, distance * -1, unit, join);
        break;
    }

    if (left) {
      this._add(
        new Graphic({
          geometry: project(left, spatialReference) as esri.Polyline,
        }),
      );
    }

    if (right) {
      this._add(
        new Graphic({
          geometry: project(right, spatialReference) as esri.Polyline,
        }),
      );
    }
  }

  render(): tsx.JSX.Element {
    const { id, view, _selectedFeature, _units } = this;

    // add feature button enabled/disabled
    const addButtonClasses = this.classes(
      CSS.widgetButton,
      _selectedFeature && view.popup.visible && !this._isMarkup(_selectedFeature) ? '' : CSS.buttonDisabled,
    );

    // edit markup buttons enabled/disabled
    const editButtonClasses = this.classes(
      CSS.widgetButton,
      _selectedFeature && view.popup.visible && this._isMarkup(_selectedFeature) ? '' : CSS.buttonDisabled,
    );

    // offset form enabled/disabled (fieldset)
    // const offsetFormClasses = _selectedFeature && _selectedFeature.geometry.type === 'polyline' && view.popup.visible ? '' : CSS.formDisabled;

    return (
      <div class={CSS.base}>
        {/* tabs */}
        <ul class={CSS.tabs} role="tablist">
          <li
            id={`tab_${id}_tab_0`}
            aria-selected={this._activeTab === 0 ? 'true' : 'false'}
            bind={this}
            onclick={() => (this._activeTab = 0)}
          >
            Markup
          </li>
          <li
            id={`tab_${id}_tab_1`}
            aria-selected={this._activeTab === 1 ? 'true' : 'false'}
            bind={this}
            onclick={() => (this._activeTab = 1)}
          >
            Tools
          </li>
          <li
            id={`tab_${id}_tab_0`}
            aria-selected={this._activeTab === 2 ? 'true' : 'false'}
            bind={this}
            onclick={() => (this._activeTab = 2)}
          >
            Projects
          </li>
        </ul>
        {/* content */}
        <main class={CSS.tabsContentWrapper}>
          {/* create and edit */}
          <section
            class={CSS.tabsContent}
            aria-labelledby={`tab_${id}_tab_0`}
            role="tabcontent"
            style={`display:${this._activeTab === 0 ? 'block' : 'none'}`}
          >
            {/* create buttons */}
            <div>Create</div>
            <div class={CSS.buttonGroup}>
              {/* sketch buttons */}
              {['point', 'polyline', 'polygon', 'rectangle', 'circle'].map(
                (tool: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle') => {
                  return (
                    <div
                      class={CSS.widgetButton}
                      role="button"
                      bind={this}
                      onclick={() => this._create(tool)}
                      title={`Sketch ${tool}`}
                    >
                      <span class={this.classes(CSS.icon, CSS.icons[tool])} aria-hidden="true"></span>
                      <span class={CSS.fallbackText}>Sketch {tool}</span>
                    </div>
                  );
                },
              )}
              {/* add text button */}
              <div
                class={CSS.widgetButton}
                role="button"
                bind={this}
                onclick={() => this._create('point', true)}
                title="Add text"
              >
                <svg class={this.classes(CSS.icon, CSS.svg)} height="16" width="16">
                  <path d={textLarge16} />
                </svg>
                <span class={CSS.fallbackText}>Add text</span>
              </div>
            </div>
            {/* text input */}
            <div class={CSS.textGroup}>
              <input class={CSS.input} type="text" placeholder="Text to add (optional)" data-cov-markup-text-input="" />
            </div>
            {/* edit buttons */}
            <div>Edit</div>
            <div class={CSS.buttonGroup}>
              <div
                class={addButtonClasses}
                role="button"
                bind={this}
                onclick={() => this.addGraphicToMarkup()}
                title="Add selected feature as markup"
              >
                <span class={this.classes(CSS.icon, CSS.icons.plus)} aria-hidden="true"></span>
                <span class={CSS.fallbackText}>Add selected feature as markup</span>
              </div>
              <div
                class={editButtonClasses}
                role="button"
                bind={this}
                onclick={() => this._editGeometry()}
                title="Edit markup geometry"
              >
                <span class={this.classes(CSS.icon, CSS.icons.edit)} aria-hidden="true"></span>
                <span class={CSS.fallbackText}>Edit markup geometry</span>
              </div>
              <div
                class={editButtonClasses}
                role="button"
                bind={this}
                onclick={() => this._delete()}
                title="Delete markup"
              >
                <span class={this.classes(CSS.icon, CSS.icons.trash)} aria-hidden="true"></span>
                <span class={CSS.fallbackText}>Delete markup</span>
              </div>
              <div
                class={editButtonClasses}
                role="button"
                bind={this}
                onclick={() => this._up()}
                title="Move markup up"
              >
                <span class={this.classes(CSS.icon, CSS.icons.up)} aria-hidden="true"></span>
                <span class={CSS.fallbackText}>Move markup up</span>
              </div>
              <div
                class={editButtonClasses}
                role="button"
                bind={this}
                onclick={() => this._down()}
                title="Move markup down"
              >
                <span class={this.classes(CSS.icon, CSS.icons.down)} aria-hidden="true"></span>
                <span class={CSS.fallbackText}>Move markup down</span>
              </div>
            </div>
            {/* end edit buttons */}
          </section>
          {/* tools */}
          <section
            class={CSS.tabsContent}
            aria-labelledby={`tab_${id}_tab_1`}
            role="tabcontent"
            style={`display:${this._activeTab === 1 ? 'block' : 'none'}`}
          >
            {/* buffer */}
            <div>Buffer</div>
            <form class={CSS.form} bind={this} onsubmit={(evt: Event) => this._buffer(evt)}>
              <fieldset disabled={!(_selectedFeature && view.popup.visible)}>
                <div class={CSS.formRow}>
                  <div class={CSS.formControl}>
                    <label>Distance</label>
                    <input
                      class={CSS.input}
                      type="number"
                      name="DIST"
                      required
                      value="250"
                      step="0.1"
                      placeholder="Distance"
                    />
                  </div>
                  <div class={CSS.formControl}>
                    <label>Unit</label>
                    {_units.lengthSelect('UNIT')}
                  </div>
                </div>
                <div class={CSS.formRow}>
                  <button class={CSS.button} type="submit">
                    Buffer
                  </button>
                </div>
              </fieldset>
            </form>
            {/* offset */}
            <div>Offset</div>
            <form class={CSS.form} bind={this} onsubmit={(evt: Event) => this._offset(evt)}>
              <fieldset
                disabled={!(_selectedFeature && _selectedFeature.geometry?.type === 'polyline' && view.popup.visible)}
              >
                <div class={CSS.formRow}>
                  <div class={CSS.formControl}>
                    <label>Distance</label>
                    <input
                      class={CSS.input}
                      type="number"
                      name="DIST"
                      required
                      value="30"
                      step="1"
                      placeholder="Distance"
                    />
                  </div>
                  <div class={CSS.formControl}>
                    <label>Unit</label>
                    {_units.lengthSelect('UNIT')}
                  </div>
                </div>
                <div class={CSS.formRow}>
                  <div class={CSS.formControl}>
                    <label>Sides</label>
                    <select class={CSS.select} name="SIDE">
                      <option value="both">Both</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div class={CSS.formControl}>
                    <label>Join</label>
                    <select class={CSS.select} name="JOIN">
                      <option value="miter">Miter</option>
                      <option value="round">Round</option>
                      <option value="bevel">Bevel</option>
                      <option value="square">Square</option>
                    </select>
                  </div>
                </div>
                <div class={CSS.formRow}>
                  <button class={CSS.button} type="submit">
                    Offset
                  </button>
                </div>
              </fieldset>
            </form>
          </section>
          {/* project */}
          <section
            class={CSS.tabsContent}
            aria-labelledby={`tab_${id}_tab_2`}
            role="tabcontent"
            style={`display:${this._activeTab === 2 ? 'block' : 'none'}`}
          >
            {this.projectsWidget ? (
              <div
                afterCreate={(div: HTMLDivElement) => {
                  this.projectsWidget.container = div;
                }}
              ></div>
            ) : (
              <p>No projects interface available.</p>
            )}
          </section>
        </main>
      </div>
    );
  }
}
