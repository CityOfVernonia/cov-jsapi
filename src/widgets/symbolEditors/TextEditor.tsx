import cov = __cov;

import esri = __esri;

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import { tsx } from 'esri/widgets/support/widget';

import SymbolEditor, { CSS } from './support/SymbolEditor';

import ColorPicker from './support/ColorPicker';

@subclass('cov.widgets.symbolEditors.TextEditor')
export default class TextEditor extends SymbolEditor {
  @property({
    aliasOf: 'graphic.symbol',
  })
  symbol: esri.TextSymbol;

  @property()
  colorPicker = new ColorPicker();

  constructor(properties: cov.SymbolEditorProperties) {
    super(properties);
  }

  postInitialize(): void {
    this.colorPicker.on('change', (color: esri.Color) => {
      this.setSymbolProperty('color', undefined, color);
    });
  }

  render(): tsx.JSX.Element {
    const sym = this.symbol;
    return (
      <div class={CSS.base}>
        {/* row one */}
        <div class={CSS.inputRow}>
          {/* text */}
          {/* <div> */}
          {/* <label class={CSS.label}>Text</label> */}
          <input
            style="width:100%;"
            class={CSS.input}
            type="text"
            value={sym.text}
            placeholder="Text"
            bind={this}
            onkeyup={(evt: Event) => {
              const target = evt.target as HTMLInputElement;
              const { value } = target;
              this.setSymbolProperty('text', undefined, value ? value : 'New Text');
            }}
          />
          {/* </div> */}
        </div>

        <div class={CSS.inputRow}>
          {/* text color */}
          <div>
            <label class={CSS.label}>Color</label>
            <div
              bind={this}
              afterCreate={(div: HTMLDivElement) => {
                this.colorPicker.container = div;
                this.colorPicker.value = sym.color;
              }}
            ></div>
          </div>
          {/* size */}
          <div>
            <label class={CSS.label}>Size</label>
            <input
              type="range"
              class={CSS.slider}
              value={sym.font.size}
              min="8"
              max="14"
              step="1"
              bind={this}
              onchange={this.setSymbolProperty.bind(this, 'font.size')}
            />
            <div class={CSS.sliderLabels}>
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
