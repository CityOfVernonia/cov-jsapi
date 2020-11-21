import esri = __esri;

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import Widget from 'esri/widgets/Widget';

export const CSS = {
  base: 'esri-widget cov-symbol-editor',
  inputRow: 'cov-symbol-editor--input-row',
  label: 'cov-symbol-editor--label',
  select: 'esri-select',
  slider: 'cov-slider',
  sliderLabels: 'cov-slider--labels',
};

@subclass('cov.widgets.symbolEditors.support.SymbolEditor')
export default class SymbolEditor extends Widget {
  @property()
  graphic: esri.Graphic;

  @property({
    aliasOf: 'graphic.symbol',
  })
  symbol: esri.Symbol2D3D;

  /**
   * Sets any symbol property.
   * @param property the property to set in dot notation, e.g. 'color.a'
   * @param evt onchange or oninput event
   * @param value property value to set
   */
  setSymbolProperty(property: string, evt?: Event, value?: string | number): void {
    const symbol = this.symbol.clone();
    if (!evt && !value) return;
    if (evt && !value) value = (evt.target as HTMLSelectElement | HTMLInputElement).value;
    symbol.set({
      [property]: value,
    });
    this.graphic.symbol = symbol;
  }
}
