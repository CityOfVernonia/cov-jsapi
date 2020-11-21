import cov = __cov;

import esri = __esri;

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import { tsx } from 'esri/widgets/support/widget';

import SymbolEditor, { CSS } from './support/SymbolEditor';

import ColorPicker from './support/ColorPicker';

@subclass('cov.widgets.symbolEditors.SimpleLineEditor')
export default class SimpleLineEditor extends SymbolEditor {
  @property({
    aliasOf: 'graphic.symbol'
  })
  symbol: esri.SimpleLineSymbol;
  
  @property()
  colorPicker = new ColorPicker();

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
  }

  render(): tsx.JSX.Element {
    const sym = this.symbol;
    return (
      <div class={CSS.base}>
        {/* row one */}
        <div class={CSS.inputRow}>
          {/* line color */}
          <div>
            <label class={CSS.label}>Line Color</label>
            <div
              bind={this}
              afterCreate={(div: HTMLDivElement) => {
                this.colorPicker.container = div;
                this.colorPicker.value = sym.color;
              }}
            ></div>
          </div>
          {/* line style */}
          <div>
            <label class={CSS.label}>Line Style</label>
            <select
              class={CSS.select}
              value={sym.style}
              bind={this}
              onchange={this.setSymbolProperty.bind(this, 'style')}
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
          {/* line width */}
          <div>
            <label class={CSS.label}>Line Width</label>
            <input
              type="range"
              class={CSS.slider}
              value={sym.width}
              min="1"
              max="5"
              step="1"
              bind={this}
              onchange={this.setSymbolProperty.bind(this, 'width')}
            />
            <div class={CSS.sliderLabels}>
              <span>Thin</span>
              <span>Wide</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
