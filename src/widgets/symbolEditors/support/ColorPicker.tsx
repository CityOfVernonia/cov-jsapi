import cov = __cov;

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import { renderable, tsx } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

import Color from 'esri/Color';

const CSS = {
  base: 'cov-color-picker',
  rows: 'cov-color-picker--rows',
  row: 'cov-color-picker--row',
  color: 'cov-color-picker--color',
  selected: 'cov-color-picker--color-selected',
};

@subclass('cov.widgets.symbolEditors.support.ColorPicker')
export default class ColorPicker extends Widget {
  /**
   * Array of hex colors to display.
   *
   * @default [https://clrs.cc/]
   */
  @property()
  palette = [
    '#111111',
    '#AAAAAA',
    '#FFFFFF',
    '#001f3f',
    '#0074D9',
    '#7FDBFF',
    '#39CCCC',
    '#3D9970',
    '#2ECC40',
    '#01FF70',
    '#FFDC00',
    '#FF851B',
    '#FF4136',
    '#85144B',
    '#F012BE',
    '#B10DC9',
  ];

  /**
   * Number of colors per row.
   *
   * @default 8
   */
  @property()
  colorsPerRow = 8;

  /**
   * `esri/Color` value to init widget with.
   */
  @property()
  @renderable()
  value: Color;

  constructor(properties?: cov.ColorPickerProperties) {
    super(properties);
  }

  private _selectColor(evt: Event): void {
    this.value = new Color((evt.target as HTMLDivElement).getAttribute('data-color'));
    this.emit('change', this.value);
  }

  private _chunk(array: string[], size: number): string[][] {
    let index = 0;
    const length = array.length;
    const result = [];
    for (index = 0; index < length; index += size) {
      result.push(array.slice(index, index + size));
    }
    return result;
  }

  render(): tsx.JSX.Element {
    // chunk palette into arrays of colorsPerRow length
    const colorGroups = this._chunk(this.palette, this.colorsPerRow);

    const rows: tsx.JSX.Element[] = [];

    // create row from each chunk
    colorGroups.forEach((colors: string[]) => {
      // create tiles
      const tiles = colors.map((color: string) => {
        return (
          <div
            class={this.classes(
              CSS.color,
              this.value && this.value.toHex() === color.toLowerCase() ? CSS.selected : ``,
            )}
            data-color={color}
            style={`background-color:${color};`}
            bind={this}
            onclick={this._selectColor}
          ></div>
        );
      });
      rows.push(<div class={CSS.row}>{tiles}</div>);
    });

    return (
      <div class={CSS.base}>
        <div class={CSS.rows}>{rows}</div>
      </div>
    );
  }
}
