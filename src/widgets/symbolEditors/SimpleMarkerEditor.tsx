import cov = __cov;

import esri = __esri;

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import { tsx } from 'esri/widgets/support/widget';

import SymbolEditor, { CSS } from './support/SymbolEditor';

import ColorPicker from './support/ColorPicker';

@subclass('cov.widgets.symbolEditors.SimpleMarkerEditor')
export default class SimpleMarkerEditor extends SymbolEditor {
  @property({
    aliasOf: 'graphic.symbol'
  })
  symbol: esri.SimpleMarkerSymbol;

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
          {/* point color */}
          <div>
            <label class={CSS.label}>Point Color</label>
            <div
              bind={this}
              afterCreate={(div: HTMLDivElement) => {
                this.colorPicker.container = div;
                this.colorPicker.value = sym.color;
              }}
            ></div>
          </div>
          {/* point style */}
          <div>
            <label class={CSS.label}>Point Style</label>
            <select
              class={CSS.select}
              value={sym.style}
              bind={this}
              onchange={this.setSymbolProperty.bind(this, 'style')}
            >
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>
          {/* point size */}
          <div>
            <label class={CSS.label}>Point Size</label>
            <input
              type="range"
              class={CSS.slider}
              value={sym.size}
              min="4"
              max="20"
              step="1"
              bind={this}
              onchange={this.setSymbolProperty.bind(this, 'size')}
            />
            <div class={CSS.sliderLabels}>
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>
        </div>
        {/* row two */}
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
          {/* outline width */}
          <div>
            <label class={CSS.label}>Outline Width</label>
            <input
              type="range"
              class={CSS.slider}
              value={sym.outline.width}
              min="0"
              max="4"
              step="1"
              bind={this}
              onchange={this.setSymbolProperty.bind(this, 'outline.width')}
            />
            <div class={CSS.sliderLabels}>
              <span>None</span>
              <span>Wide</span>
            </div>
          </div>
          {/* empty */}
          <div></div>
        </div>
      </div>
    );
  }
}
