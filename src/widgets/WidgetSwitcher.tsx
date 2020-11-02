import cov = __cov;

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import { tsx } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

interface SwitcherWidget extends esri.Widget {
  onHide?: () => void;
  onShow?: () => void;
}

const CSS = {
  base: 'cov-widget-switcher',
  container: 'cov-widget-switcher--container',
  buttons: 'cov-widget-switcher--buttons',

  // buttons
  button: 'esri-widget--button',
  activeButton: 'cov-widget-switcher--button-active',
  icon: 'esri-icon',
  fallback: 'esri-icon-font-fallback-text',

  // widgets
  panel: 'esri-widget--panel',
  component: 'esri-component',
};

@subclass('app.widgets.WidgetSwitcher')
export default class WidgetSwitcher extends Widget {
  @property()
  view: esri.MapView;

  @property()
  widgets: cov.WidgetSwitcherWidgetProperties[] = [];

  @property()
  private _buttons: tsx.JSX.Element[] = [];

  @property()
  private _container: HTMLDivElement;

  @property()
  private _activeWidget: SwitcherWidget | null = null;

  constructor(properties?: cov.WidgetSwitcherProperties) {
    super(properties);
  }

  postInitialize(): void {
    this.widgets.forEach(this._add.bind(this));
  }

  render(): tsx.JSX.Element {
    return (
      <div class={CSS.base}>
        <div
          class={CSS.container}
          bind={this}
          afterCreate={(div: HTMLDivElement) => {
            this._container = div;
          }}
        ></div>
        <div class={CSS.buttons}>{this._buttons}</div>
      </div>
    );
  }

  add(switcherWidget: cov.WidgetSwitcherWidgetProperties): void {
    this.widgets.push(switcherWidget);
    this._add(switcherWidget);
  }

  private _add(switcherWidget: cov.WidgetSwitcherWidgetProperties): void {
    const icon = switcherWidget.iconClass || 'esri-icon-checkbox-unchecked';
    const title = switcherWidget.title || 'Expand';
    const widget = switcherWidget.widget;
    const container = document.createElement('div');

    widget.view = this.view;

    container.classList.add(CSS.component);
    if (switcherWidget.nonPanel !== true) {
      container.classList.add(CSS.panel);
    }
    widget.container = container;

    const button = (
      <div
        // no work ???
        // class={this.classes(CSS.button, this._activeWidget && this._activeWidget.id === widget.id ? CSS.activeButton : '')}
        class={CSS.button}
        role="button"
        title={title}
        bind={this}
        onclick={() => {
          this._switchWidget(widget, button);
        }}
      >
        <span class={this.classes(CSS.icon, icon)} aria-hidden="true"></span>
        <span class={CSS.fallback}>{title}</span>
      </div>
    );

    this._buttons.push(button);
  }

  private _switchWidget(widget: SwitcherWidget, button: any): void {
    // work around for buttons not get rerendered ???
    this._buttons.forEach((_button: any) => {
      (_button.domNode as HTMLDivElement).classList.remove(CSS.activeButton);
    });

    if (!this._activeWidget) {
      // no widget showing
      this._container.append(widget.container);
      this._activeWidget = widget;
      // check for and call onShow()
      if (this._activeWidget.onShow && typeof this._activeWidget.onShow === 'function') {
        this._activeWidget.onShow();
      }
      // work around for buttons not get rerendered ???
      (button.domNode as HTMLDivElement).classList.add(CSS.activeButton);
    } else if (this._activeWidget && this._activeWidget.id === widget.id) {
      // check for and call onHide()
      if (this._activeWidget.onHide && typeof this._activeWidget.onHide === 'function') {
        this._activeWidget.onHide();
      }
      // hide active widget
      this._container.removeChild(widget.container as HTMLDivElement);
      this._activeWidget = null;
    } else {
      // check for and call onHide()
      if (this._activeWidget.onHide && typeof this._activeWidget.onHide === 'function') {
        this._activeWidget.onHide();
      }
      // switch active widget
      this._container.removeChild(this._activeWidget.container as HTMLDivElement);
      this._container.append(widget.container);
      this._activeWidget = widget;
      // check for and call onShow()
      if (this._activeWidget.onShow && typeof this._activeWidget.onShow === 'function') {
        this._activeWidget.onShow();
      }
      // work around for buttons not get rerendered ???
      (button.domNode as HTMLDivElement).classList.add(CSS.activeButton);
    }
    this.scheduleRender();
  }
}
