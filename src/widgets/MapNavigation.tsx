/**
 * A map nav widget to replace the default zoom control.
 * Including optional compass, home, locate and fullscreen controls.
 */

import cov = __cov;

import esri = __esri;

import { aliasOf, property, subclass } from 'esri/core/accessorSupport/decorators';

import { whenOnce } from 'esri/core/watchUtils';

import { renderable, tsx } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

import ZoomViewModel from 'esri/widgets/Zoom/ZoomViewModel';

import HomeViewModel from 'esri/widgets/Home/HomeViewModel';

import LocateViewModel from 'esri/widgets/Locate/LocateViewModel';

import FullscreenViewModel from 'esri/widgets/Fullscreen/FullscreenViewModel';

const CSS = {
  base: 'cov-map-navigation',
  button: 'cov-map-navigation--button',
  buttonDisabled: 'cov-map-navigation--button disabled',
  compass: 'cov-map-navigation--compass',
  icon: 'esri-icon',
  fallback: 'esri-icon-font-fallback-text',
};

@subclass('cov.widgets.MapNavigation')
export default class MapNavigation extends Widget {
  /**
   * Map view.
   */
  @property()
  view: esri.MapView | esri.SceneView;

  /**
   * Include compass.
   *
   * @default true
   */
  @property()
  compass = true;

  /**
   * Include home.
   *
   * @default true
   */
  @property()
  home = true;

  /**
   * Include locate.
   *
   * @default true
   */
  @property()
  locate = true;

  /**
   * Include fullscreen.
   *
   * @default true
   */
  @property()
  fullscreen = true;

  /**
   * Fullscreen HTML element.
   * An element or a querySelector string.
   */
  @property()
  fullscreenElement: string | HTMLElement;

  /**
   * Include button to switch between 2D/3D.
   *
   * @default false
   */
  viewSwitcher = false;

  /**
   * Function to go 2D.
   */
  go2D: () => void;

  /**
   * Function to go 23D.
   */
  go3D: () => void;

  @property()
  protected zoomViewModel = new ZoomViewModel();

  @property()
  protected homeViewModel = new HomeViewModel();

  @property()
  protected locateViewModel = new LocateViewModel();

  @property()
  protected fullscreenViewModel = new FullscreenViewModel();

  @aliasOf('view.rotation')
  @renderable()
  private _viewRotation: number;

  @aliasOf('fullscreenViewModel.state')
  @renderable()
  private _fullscreenState: 'active' | 'ready' | 'feature-unsupported' | 'disabled';

  constructor(properties?: cov.MapNavigationProperties) {
    super(properties);
  }

  postInitialize(): void {
    whenOnce(this, 'view', (): void => {
      const view = this.view;
      this.zoomViewModel.view = view;
      this.homeViewModel.view = view;
      this.locateViewModel.view = view;
      this.fullscreenViewModel.view = view;
      if (this.fullscreenElement) {
        this.fullscreenViewModel.element =
          typeof this.fullscreenElement === 'string'
            ? (document.querySelector(this.fullscreenElement) as HTMLElement)
            : this.fullscreenElement;
      }
    });
  }

  render(): tsx.JSX.Element {
    return (
      <div class={CSS.base}>
        {/* zoom in */}
        <div
          class={this.zoomViewModel.canZoomIn ? CSS.button : CSS.buttonDisabled}
          role="button"
          title="Zoom In"
          bind={this}
          onclick={() => this.zoomViewModel.zoomIn()}
        >
          <span class={this.classes(CSS.icon, 'esri-icon-plus')} aria-hidden="true"></span>
          <span class={CSS.fallback}>Zoom In</span>
        </div>

        {/* zoom out */}
        <div
          class={this.zoomViewModel.canZoomOut ? CSS.button : CSS.buttonDisabled}
          role="button"
          title="Zoom Out"
          bind={this}
          onclick={() => this.zoomViewModel.zoomOut()}
        >
          <span class={this.classes(CSS.icon, 'esri-icon-minus')} aria-hidden="true"></span>
          <span class={CSS.fallback}>Zoom Out</span>
        </div>

        {/* compass */}
        {this.compass &&
        this.view.type === '2d' &&
        (this.view.constraints as esri.MapViewConstraints).rotationEnabled ? (
          <div
            class={CSS.button}
            role="button"
            title="Reset Orientation"
            bind={this}
            onclick={() => {
              (this.view as esri.MapView).rotation = 0;
            }}
          >
            <span class={CSS.compass}>
              <span
                class={this.classes(CSS.icon, 'esri-icon-compass')}
                style={`transform: rotate(${this._viewRotation}deg)`}
                aria-hidden="true"
              ></span>
            </span>
            <span class={CSS.fallback}>Reset Orientation</span>
          </div>
        ) : null}

        {/* home */}
        {this.home ? (
          <div class={CSS.button} role="button" title="Default Extent" bind={this} onclick={this.homeViewModel.go}>
            <span class={this.classes(CSS.icon, 'esri-icon-home')} aria-hidden="true"></span>
            <span class={CSS.fallback}>Default Extent</span>
          </div>
        ) : null}

        {/* locate */}
        {this.locate ? (
          <div
            class={CSS.button}
            role="button"
            title="Zoom To Location"
            bind={this}
            onclick={this.locateViewModel.locate}
          >
            <span class={this.classes(CSS.icon, 'esri-icon-locate')} aria-hidden="true"></span>
            <span class={CSS.fallback}>Zoom To Location</span>
          </div>
        ) : null}

        {/* fullscreen */}
        {this.fullscreen && this._fullscreenState !== 'feature-unsupported' && this._fullscreenState !== 'disabled' ? (
          <div
            class={CSS.button}
            role="button"
            title={this._fullscreenState === 'ready' ? 'Enter Fullscreen' : 'Exit Fullscreen'}
            bind={this}
            onclick={() => this.fullscreenViewModel.toggle()}
          >
            <span
              class={this.classes(
                CSS.icon,
                this._fullscreenState === 'ready' ? 'esri-icon-zoom-out-fixed' : 'esri-icon-zoom-in-fixed',
              )}
              aria-hidden="true"
            ></span>
            <span class={CSS.fallback}>
              {this._fullscreenState === 'ready' ? 'Enter Fullscreen' : 'Exit Fullscreen'}
            </span>
          </div>
        ) : null}

        {/* view switcher */}
        {this.viewSwitcher ? (
          <div
            class={CSS.button}
            role="button"
            title={this.view.type === '2d' ? 'Go 3D' : 'Go 2D'}
            bind={this}
            onclick={() => {
              this.emit('view-switch', this.view.type === '2d' ? '3d' : '2d');
              switch (this.view.type) {
                case '2d':
                  if (this.go3D && typeof this.go3D === 'function') {
                    this.go3D();
                  }
                  break;
                case '3d':
                  if (this.go2D && typeof this.go2D === 'function') {
                    this.go2D();
                  }
                  break;
                default:
                  break;
              }
            }}
          >
            <span
              class={this.classes(CSS.icon, this.view.type === '2d' ? 'esri-icon-globe' : 'esri-icon-maps')}
              aria-hidden="true"
            ></span>
            <span class={CSS.fallback}>{this.view.type === '2d' ? 'Go 3D' : 'Go 2D'}</span>
          </div>
        ) : null}
      </div>
    );
  }
}
