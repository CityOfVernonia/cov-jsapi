import cov = __cov;

import esri = __esri;

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import { tsx } from 'esri/widgets/support/widget';

import SymbolEditor, { CSS } from './support/SymbolEditor';

import ColorPicker from './support/ColorPicker';

@subclass('cov.widgets.symbolEditors.SimpleFillEditor')
export default class SimpleFillEditor extends SymbolEditor {
  @property()
  colorPicker = new ColorPicker();

  @property()
  outlineColorPicker = new ColorPicker();

  constructor(properties: cov.SymbolEditorProperties) {
    super(properties);
  }

  postInitialize(): void {
    this.colorPicker.on('change', (color: esri.Color) => {
      const symbol = this.symbol.clone();
      symbol.color = color;
      color.a = this.symbol.color.a;
      this.graphic.symbol = symbol;
    });
    this.outlineColorPicker.on('change', (color: esri.Color) => {
      const symbol = this.symbol.clone();
      symbol.outline.color = color;
      color.a = this.symbol.outline.color.a;
      this.graphic.symbol = symbol;
    });
  }

  render(): tsx.JSX.Element {
    const sym = this.symbol;
    return (
      <div class={CSS.base}>
        {/* row one */}
        <div class={CSS.inputRow}>
          {/* outline color */}
          <div>
            <label class={CSS.label}>Outline Color</label>
            <div
              bind={this}
              afterCreate={(div: HTMLDivElement) => {
                this.outlineColorPicker.container = div;
                this.outlineColorPicker.value = sym.outline.color;
              }}
            ></div>
          </div>
          {/* outline style */}
          <div>
            <label class={CSS.label}>Outline Style</label>
            <select
              class={CSS.select}
              value={sym.outline.style}
              bind={this}
              onchange={this.setSymbolProperty.bind(this, 'outline.style')}
            >
              <option value="solid">Solid</option>
              <option value="dash-dot">Dash Dot</option>
              <option value="dot">Dot</option>
              <option value="long-dash">Long Dash</option>
              <option value="long-dash-dot">Long Dash Dot</option>
              <option value="long-dash-dot-dot">Long Dash Dot Dot</option>
              <option value="short-dash">Short Dash</option>
              <option value="short-dash-dot">Short Dash Dot</option>
              <option value="short-dash-dot-dot">Short Dash Dot Dot</option>
            </select>
          </div>
          {/* outline width */}
          <div>
            <label class={CSS.label}>Outline Width</label>
            <input
              type="range"
              class={CSS.slider}
              value={sym.outline.width}
              min="1"
              max="5"
              step="1"
              bind={this}
              onchange={this.setSymbolProperty.bind(this, 'outline.width')}
            />
            <div class={CSS.sliderLabels}>
              <span>Thin</span>
              <span>Wide</span>
            </div>
          </div>
        </div>
        {/* row two */}
        <div class={CSS.inputRow}>
          {/* fill color */}
          <div>
            <label class={CSS.label}>Fill Color</label>
            <div
              bind={this}
              afterCreate={(div: HTMLDivElement) => {
                this.colorPicker.container = div;
                this.colorPicker.value = sym.color;
              }}
            ></div>
          </div>
          {/* fill opacity */}
          <div>
            <label class={CSS.label}>Fill Opacity</label>
            <input
              type="range"
              class={CSS.slider}
              value={sym.color.a * 100}
              min="0"
              max="100"
              step="5"
              bind={this}
              onchange={(evt: Event) => {
                const target = evt.target as HTMLInputElement;
                this.setSymbolProperty('color.a', undefined, Number(target.value) / 100);
              }}
            />
            <div class={CSS.sliderLabels}>
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          {/* empty */}
          <div></div>
        </div>
      </div>
    );
  }
}
