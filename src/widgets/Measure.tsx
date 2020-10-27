import esri = __esri;

import { property, subclass } from 'esri/core/accessorSupport/decorators';
import { tsx, renderable } from 'esri/widgets/support/widget';
import Widget from 'esri/widgets/Widget';
import UnitsViewModel from './../viewModels/UnitsViewModel';
import { pausable, watch, whenDefinedOnce } from 'esri/core/watchUtils';

import { Point, Polyline, Polygon } from 'esri/geometry';
import { SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, TextSymbol } from 'esri/symbols';

import Draw from 'esri/views/draw/Draw';
import Graphic from 'esri/Graphic';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import ElevationLayer from 'esri/layers/ElevationLayer';

import { load as coordinateFormatterLoad, toLatitudeLongitude } from 'esri/geometry/coordinateFormatter';
import { geodesicArea, geodesicLength, simplify } from 'esri/geometry/geometryEngine';
import { webMercatorToGeographic } from 'esri/geometry/support/webMercatorUtils';

interface MeasureProperties extends esri.WidgetProperties {
  view?: esri.MapView;
  elevationLayer: ElevationLayer | string;
}

interface MeasureState {
  action:
    | 'ready'
    | 'measuringLength'
    | 'measuringArea'
    | 'length'
    | 'area'
    | 'findingLocation'
    | 'location'
    | 'findingElevation'
    | 'elevation';
  length: number;
  area: number;
  latitude: number | string;
  longitude: number | string;
  elevation: number;
}

const CSS = {
  base: 'esri-widget cov-measure',

  tabs: 'cov-tabs',
  tabsContentWrapper: 'cov-tabs--content-wrapper',
  tabsContent: 'cov-tabs--content',
  tabsContentNoPadding: 'cov-tabs--content_no-padding',

  formRow: 'cov-form--row',
  formControl: 'cov-form--control',

  button: 'esri-button',
  select: 'esri-select',

  result: 'cov-measure--result',
};

const SYMBOL = {
  width: 4,
  opacity: 0.2,
  size: 12,
  primary: [73, 80, 87],
  secondary: [255, 255, 255],
};

let KEY = 0;

@subclass('app.widgets.Measure')
export default class Measure extends Widget {
  @property()
  view: esri.MapView;

  @property()
  elevationLayer: ElevationLayer;

  @property()
  @renderable()
  state: MeasureState = {
    action: 'ready',
    length: 0,
    area: 0,
    latitude: 0,
    longitude: 0,
    elevation: 0,
  };

  @property({
    type: UnitsViewModel,
  })
  private _units = new UnitsViewModel();

  @property()
  private _draw = new Draw();

  @property()
  private _layer = new GraphicsLayer({
    listMode: 'hide',
  });

  @property()
  private _coordCenterHandle: esri.PausableWatchHandle;
  @property()
  private _coordFormatHandle: esri.PausableWatchHandle;

  @property()
  private _elevCenterHandle: esri.PausableWatchHandle;
  @property()
  private _elevFormatHandle: esri.PausableWatchHandle;

  @property()
  @renderable()
  private _activeTab = 'data-tab-0';

  constructor(properties: MeasureProperties) {
    super(properties);

    whenDefinedOnce(this, 'view', (view: esri.MapView) => {
      this._draw.view = view;

      view.map.add(this._layer);

      // coordinate handling
      coordinateFormatterLoad();
      this._centerLocation(view.center);
      this._coordCenterHandle = pausable(view, 'center', this._centerLocation.bind(this));
      this._coordFormatHandle = pausable(this._units, 'locationUnit', this._centerLocation.bind(this, view.center));

      // elevation handling
      if (typeof this.elevationLayer === 'string') {
        this.elevationLayer = new ElevationLayer({
          url: this.elevationLayer,
        });
      }
      this._centerElevation(view.center);
      this._elevCenterHandle = pausable(view, 'center', this._centerElevation.bind(this));
      this._elevFormatHandle = pausable(this, 'elevationUnit', this._centerElevation.bind(this, view.center));

      // wire up units change events
      watch(this._units, ['lengthUnit', 'areaUnit', 'locationUnit'], (value: string, old: string, name: string) => {
        const state = this.state;
        const graphics = this._layer.graphics;
        let geometry;
        if (name === 'lengthUnit' && (state.action === 'length' || state.action === 'measuringLength')) {
          geometry = graphics.getItemAt(graphics.length - 2).geometry as Polyline;
          this._lengthEvent({
            vertices: geometry.paths,
          });
        }
        if (
          (name === 'areaUnit' || name === 'lengthUnit') &&
          (state.action === 'area' || state.action === 'measuringArea')
        ) {
          geometry = graphics.getItemAt(graphics.length - 4).geometry as Polygon;
          this._areaEvent({
            vertices: geometry.rings[0],
          });
        }
        if (name === 'locationUnit' && (state.action === 'location' || state.action === 'findingLocation')) {
          geometry = graphics.getItemAt(graphics.length - 1).geometry as Point;
          this._locationEvent({
            vertices: [[geometry.x, geometry.y]],
          });
        }
        if (name === 'elevationUnit' && (state.action === 'elevation' || state.action === 'findingElevation')) {
          geometry = graphics.getItemAt(graphics.length - 1).geometry as Point;
          this._elevationEvent({
            vertices: [[geometry.x, geometry.y]],
          });
        }
      });
    });
  }

  render() {
    const state = this.state;
    const units = this._units;

    let measureResult;
    switch (state.action) {
      case 'measuringLength':
      case 'length':
        measureResult = (
          <div class={CSS.result}>
            <p>
              <b>Length:</b> {state.length.toLocaleString()} {units.lengthUnit}
            </p>
            <button class={CSS.button} bind={this} onclick={this._clear} style="width:auto;">
              Clear
            </button>
          </div>
        );
        break;
      case 'measuringArea':
      case 'area':
        measureResult = (
          <div class={CSS.result}>
            <p key={KEY++}>
              <b>Area:</b> {state.area.toLocaleString()} {units.areaUnit}
            </p>
            <p key={KEY++}>
              <b>Perimeter:</b> {state.length.toLocaleString()} {units.lengthUnit}
            </p>
            <button class={CSS.button} bind={this} onclick={this._clear} style="width:auto;">
              Clear
            </button>
          </div>
        );
        break;
      case 'ready':
      default:
        measureResult = <div class={CSS.result}>Select a measure tool</div>;
        break;
    }

    return (
      <div class={CSS.base}>
        <ul class={CSS.tabs} role="tablist">
          <li
            data-tab-0
            id={`${this.id}_tab_0`}
            aria-selected={this._activeTab === 'data-tab-0' ? 'true' : 'false'}
            bind={this}
            onclick={() => {
              this._activeTab = 'data-tab-0';
              this._clear();
            }}
          >
            Measure
          </li>
          <li
            data-tab-1
            id={`${this.id}_tab_1`}
            aria-selected={this._activeTab === 'data-tab-1' ? 'true' : 'false'}
            bind={this}
            onclick={() => {
              this._activeTab = 'data-tab-1';
              this._clear();
            }}
          >
            Location
          </li>
          <li
            data-tab-1
            id={`${this.id}_tab_2`}
            aria-selected={this._activeTab === 'data-tab-2' ? 'true' : 'false'}
            bind={this}
            onclick={() => {
              this._activeTab = 'data-tab-2';
              this._clear();
            }}
          >
            Elevation
          </li>
        </ul>
        <main class={CSS.tabsContentWrapper}>
          {/* measure */}
          <section
            class={CSS.tabsContent}
            aria-labelledby={`${this.id}_tab_0`}
            role="tabcontent"
            style={`display:${this._activeTab === 'data-tab-0' ? 'block' : 'none'}`}
          >
            <div class={CSS.formRow}>
              <div class={CSS.formControl}>
                <button class={CSS.button} title="Measure Length" bind={this} onclick={this._measureLength}>
                  Length
                </button>
              </div>
              <div class={CSS.formControl}>{units.lengthSelect(null, 'Select Length Unit')}</div>
            </div>
            <div class={CSS.formRow}>
              <div class={CSS.formControl}>
                <button class={CSS.button} title="Measure Area" bind={this} onclick={this._measureArea}>
                  Area
                </button>
              </div>
              <div class={CSS.formControl}>{units.areaSelect(null, 'Select Area Unit')}</div>
            </div>
            {measureResult}
          </section>

          {/* coordinates */}
          <section
            class={CSS.tabsContent}
            aria-labelledby={`${this.id}_tab_1`}
            role="tabcontent"
            style={`display:${this._activeTab === 'data-tab-1' ? 'block' : 'none'}`}
          >
            <div class={CSS.formRow}>
              <div class={CSS.formControl}>
                <button class={CSS.button} title="Identify Location" bind={this} onclick={this._identifyLocation}>
                  Spot Location
                </button>
              </div>
              <div class={CSS.formControl}>{units.locationSelect(null, 'Select Coordinate Unit')}</div>
            </div>
            <div class={CSS.result}>
              <p>
                <b>Latitude:</b> {state.latitude}
              </p>
              <p>
                <b>Longitude</b> {state.longitude}
              </p>
              {state.action === 'findingLocation' || state.action === 'location' ? (
                <button class={CSS.button} bind={this} onclick={this._clear} style="width:auto;">
                  Clear
                </button>
              ) : null}
            </div>
          </section>

          {/* elevation */}
          <section
            class={CSS.tabsContent}
            aria-labelledby={`${this.id}_tab_2`}
            role="tabcontent"
            style={`display:${this._activeTab === 'data-tab-2' ? 'block' : 'none'}`}
          >
            <div class={CSS.formRow}>
              <div class={CSS.formControl}>
                <button class={CSS.button} title="Identify Elevation" bind={this} onclick={this._identifyElevation}>
                  Spot Elevation
                </button>
              </div>
              <div class={CSS.formControl}>{units.elevationSelect(null, 'Select Elevation Unit')}</div>
            </div>
            <div class={CSS.result}>
              <p>
                <b>Elevation:</b> {state.elevation.toLocaleString()} {this._units.elevationUnit}
              </p>
              {state.action === 'findingElevation' || state.action === 'elevation' ? (
                <button class={CSS.button} bind={this} onclick={this._clear} style="width:auto;">
                  Clear
                </button>
              ) : null}
            </div>
          </section>
        </main>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  //
  //    helpers
  //
  // --------------------------------------------------------------------------
  // clear/reset any active actions, graphics layer, etc
  private _clear() {
    this._coordCenterHandle.resume();
    this._coordFormatHandle.resume();
    this._elevCenterHandle.resume();
    this._elevFormatHandle.resume();
    this._draw.reset();
    this._layer.removeAll();
    this.state = {
      ...this.state,
      action: 'ready',
      length: 0,
      area: 0,
    };
  }

  // calculate the length of polyline
  private _calculateLength(polyline: Polyline): number {
    const lengthUnit = this._units.lengthUnit;
    let length = geodesicLength(polyline, lengthUnit);
    if (length < 0) {
      const simplifiedPolyline = simplify(polyline);
      if (simplifiedPolyline) {
        length = geodesicLength(simplifiedPolyline, lengthUnit);
      }
    }
    return Number(length.toFixed(2));
  }

  // return esri.Point at midpoint of polyline
  private _polylineMidpoint(polyline: Polyline): Point {
    const _distance = (a: any, b: any): number => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const _lineInterpolate = (point1: any, point2: any, distance: number): { x: number; y: number } => {
      const xabs = Math.abs(point1.x - point2.x);
      const yabs = Math.abs(point1.y - point2.y);
      const xdiff = point2.x - point1.x;
      const ydiff = point2.y - point1.y;
      const length = Math.sqrt(Math.pow(xabs, 2) + Math.pow(yabs, 2));
      const steps = length / distance;
      const xstep = xdiff / steps;
      const ystep = ydiff / steps;
      return {
        x: point1.x + xstep,
        y: point1.y + ystep,
      };
    };
    const _lineMidpoint = (lineSegments: number[]): any => {
      let totalDistance = 0;
      for (let i = 0; i < lineSegments.length - 1; i += 1) {
        totalDistance += _distance(lineSegments[i], lineSegments[i + 1]);
      }
      let distanceSoFar = 0;
      for (let i = 0; i < lineSegments.length - 1; i += 1) {
        if (distanceSoFar + _distance(lineSegments[i], lineSegments[i + 1]) > totalDistance / 2) {
          const distanceToMidpoint = totalDistance / 2 - distanceSoFar;
          return _lineInterpolate(lineSegments[i], lineSegments[i + 1], distanceToMidpoint);
        }
        distanceSoFar += _distance(lineSegments[i], lineSegments[i + 1]);
      }
      return lineSegments[0];
    };
    const segments: any = [];
    polyline.paths[0].forEach((pnt) => {
      segments.push({
        x: pnt[0],
        y: pnt[1],
      });
    });
    const midpoint = _lineMidpoint(segments);
    return new Point({
      x: midpoint.x,
      y: midpoint.y,
      spatialReference: polyline.spatialReference,
    });
  }

  // public method to call when hiding, switching, etc the widget
  onHide() {
    this._clear();
  }

  // --------------------------------------------------------------------------
  //
  //    graphics
  //
  // --------------------------------------------------------------------------
  // add marker to graphics layer
  private _addMarkerGraphic(vertex: [number, number]) {
    this._layer.add(
      new Graphic({
        geometry: new Point({
          x: vertex[0],
          y: vertex[1],
          spatialReference: this.view.spatialReference,
        }),
        symbol: new SimpleMarkerSymbol({
          color: SYMBOL.primary,
          size: SYMBOL.width * 2,
          outline: {
            type: 'simple-line',
            width: 0,
          },
        }),
      }),
    );
  }

  // add polyline to graphics layer
  private _addLineGraphic(geometry: Polyline) {
    this._layer.addMany([
      new Graphic({
        geometry,
        symbol: new SimpleLineSymbol({
          cap: 'butt',
          join: 'round',
          color: SYMBOL.primary,
          width: SYMBOL.width,
        }),
      }),
      new Graphic({
        geometry,
        symbol: new SimpleLineSymbol({
          style: 'dash',
          cap: 'butt',
          join: 'round',
          color: SYMBOL.secondary,
          width: SYMBOL.width - 2,
        }),
      }),
    ]);
  }

  // add polygon to graphics layer
  private _addFillGraphic(geometry: Polygon) {
    this._layer.add(
      new Graphic({
        geometry,
        symbol: new SimpleFillSymbol({
          style: 'solid',
          color: [...SYMBOL.primary, ...[0.2]],
          outline: {
            width: 0,
          },
        }),
      }),
    );
  }

  // add text to graphics layer
  private _addTextGraphic(geometry: Point | Polyline | Polygon, text: string) {
    switch (geometry.type) {
      case 'polyline':
        geometry = this._polylineMidpoint(geometry);
        break;
      case 'polygon':
        geometry = geometry.centroid;
        break;
      default:
        break;
    }
    this._layer.add(
      new Graphic({
        geometry,
        symbol: new TextSymbol({
          color: SYMBOL.secondary,
          haloColor: SYMBOL.primary,
          haloSize: 1.5,
          text,
          verticalAlignment: 'middle',
          horizontalAlignment: 'center',
          yoffset: 0,
          xoffset: 0,
          font: {
            size: SYMBOL.size,
            family: 'sans-serif',
            weight: 'bold',
          },
        }),
      }),
    );
  }

  // --------------------------------------------------------------------------
  //
  //    length
  //
  // --------------------------------------------------------------------------
  private _measureLength() {
    this._clear();
    this.state.action = 'measuringLength';
    const action = this._draw.create('polyline', {
      mode: 'click',
    });
    this.view.focus();
    action.on(['vertex-add', 'cursor-update', 'vertex-remove', 'draw-complete'], this._lengthEvent.bind(this));
  }
  private _lengthEvent(evt: any) {
    // polyline to calc length and for graphics
    const polyline = new Polyline({
      paths: evt.vertices,
      spatialReference: this.view.spatialReference,
    });

    // length of polyline
    const length = this._calculateLength(polyline);

    // clear graphics
    this._layer.removeAll();

    // add point and polyline graphics
    polyline.paths[0].forEach(this._addMarkerGraphic.bind(this));
    this._addLineGraphic(polyline);

    // set state
    this.state =
      evt.type === 'draw-complete'
        ? {
            ...this.state,
            action: 'length',
            length,
          }
        : {
            ...this.state,
            length,
          };

    // add text after state is updating so text graphic and results match
    this._addTextGraphic(polyline, `${length.toLocaleString()} ${this._units.lengthUnit}`);
  }

  // --------------------------------------------------------------------------
  //
  //    area
  //
  // --------------------------------------------------------------------------
  private _measureArea() {
    this._clear();
    this.state.action = 'measuringArea';
    const action = this._draw.create('polygon', {
      mode: 'click',
    });
    this.view.focus();
    action.on(['vertex-add', 'cursor-update', 'vertex-remove', 'draw-complete'], this._areaEvent.bind(this));
  }
  private _areaEvent(evt: any) {
    const spatialReference = this.view.spatialReference;

    // polyline to calc perimeter
    const polyline = new Polyline({
      paths: [...evt.vertices, ...[evt.vertices[0]]],
      spatialReference,
    });

    // length of polyline
    const length = this._calculateLength(polyline);

    // polygon to calc area
    const polygon = new Polygon({
      rings: evt.vertices,
      spatialReference,
    });

    // calc area
    const areaUnit = this._units.areaUnit;
    let area = geodesicArea(polygon, areaUnit);
    if (area < 0) {
      const simplifiedPolygon = simplify(polygon) as Polygon;
      if (simplifiedPolygon) {
        area = geodesicArea(simplifiedPolygon, areaUnit);
      }
    }
    area = Number(area.toFixed(2));

    // clear graphics
    this._layer.removeAll();

    // add point, polyline and polygon graphics
    polygon.rings[0].forEach(this._addMarkerGraphic.bind(this));
    this._addFillGraphic(polygon);
    this._addLineGraphic(polyline);

    // set state
    this.state =
      evt.type === 'draw-complete'
        ? {
            ...this.state,
            action: 'area',
            length,
            area,
          }
        : {
            ...this.state,
            length,
            area,
          };

    // add text after state is updating so text graphic and results match
    this._addTextGraphic(polygon, `${area.toLocaleString()} ${areaUnit}`);
  }

  // --------------------------------------------------------------------------
  //
  //    location
  //
  // --------------------------------------------------------------------------
  private _centerLocation(center: Point) {
    if (this._units.locationUnit === 'dec') {
      this.state = {
        ...this.state,
        latitude: Number(center.latitude.toFixed(6)),
        longitude: Number(center.longitude.toFixed(6)),
      };
    } else {
      const dms = toLatitudeLongitude(webMercatorToGeographic(center) as esri.Point, 'dms', 2);
      const index = dms.indexOf('N') !== -1 ? dms.indexOf('N') : dms.indexOf('S');
      this.state = {
        ...this.state,
        latitude: dms.substring(0, index + 1),
        longitude: dms.substring(index + 2, dms.length),
      };
    }
  }

  private _identifyLocation() {
    this._clear();
    this._coordCenterHandle.pause();
    this._coordFormatHandle.pause();
    this.state.action = 'findingLocation';
    const action = this._draw.create('point', {});
    this.view.focus();
    action.on(['cursor-update', 'draw-complete'], this._locationEvent.bind(this));
  }

  private _locationEvent(evt: any) {
    const x = evt.vertices[0][0];
    const y = evt.vertices[0][1];
    const spatialReference = this.view.spatialReference;
    const point = new Point({
      x,
      y,
      spatialReference,
    });
    this._centerLocation(point);

    // clear graphics
    this._layer.removeAll();

    // set state
    if (evt.type === 'draw-complete') {
      this.state.action = 'location';
    }

    // add graphics
    this._addMarkerGraphic([x, y]);
    this._addTextGraphic(point, `${this.state.latitude} ${this.state.longitude}`);
  }

  // --------------------------------------------------------------------------
  //
  //    elevation
  //
  // --------------------------------------------------------------------------
  private _centerElevation(center: Point) {
    const el = this.elevationLayer as ElevationLayer;
    el.queryElevation(center)
      .then((res) => {
        const point = res.geometry as Point;
        const elevation = Math.round(point.z * (this._units.elevationUnit === 'feet' ? 3.2808399 : 1) * 10) / 10;
        this.state = {
          ...this.state,
          elevation,
        };
      })
      .catch(() => {
        this.state.elevation = 0;
      });
  }

  private _identifyElevation() {
    this._clear();
    this._elevCenterHandle.pause();
    this._elevFormatHandle.pause();
    this.state.action = 'findingElevation';
    const action = this._draw.create('point', {});
    this.view.focus();
    action.on(['cursor-update', 'draw-complete'], this._elevationEvent.bind(this));
  }

  private _elevationEvent(evt: any) {
    const x = evt.vertices[0][0];
    const y = evt.vertices[0][1];
    const spatialReference = this.view.spatialReference;
    const point = new Point({
      x,
      y,
      spatialReference,
    });
    this._centerElevation(point);

    // clear graphics
    this._layer.removeAll();

    // set state
    if (evt.type === 'draw-complete') {
      this.state.action = 'elevation';
    }

    // add graphics
    this._addMarkerGraphic([x, y]);
    this._addTextGraphic(point, `${this.state.elevation.toLocaleString()} ${this._units.elevationUnit}`);
  }
}
