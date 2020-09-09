/**
 * A widget with simple print service print and view snapshotting.
 */

import cov = __cov;

import esri = __esri;

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import { tsx, renderable } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

import PrintTemplate from 'esri/tasks/support/PrintTemplate';

import PrintViewModel from 'esri/widgets/Print/PrintViewModel';

interface PrintResult extends Object {
  state: string;
  titleText: string;
  url: null | string;
}

interface SnapshotResult extends Object {
  state: string;
  titleText: string;
  dataUrl: null | string;
  contentType: string;
}

interface MaskArea extends Object {
  x: number;
  y: number;
  width: number;
  height: number;
}

const CSS = {
  base: 'esri-widget cov-print-snapshot',

  tabs: 'cov-tabs',
  tabsContentWrapper: 'cov-tabs--content-wrapper',
  tabsContent: 'cov-tabs--content',
  // tabsContentNoPadding: 'cov-tabs--content_no-padding',

  form: 'cov-form',
  formRow: 'cov-form--row',
  formControl: 'cov-form--control',

  button: 'esri-button',
  input: 'esri-input',
  select: 'esri-select',

  printResults: 'cov-print-snapshot--print-results',
  printResult: 'cov-print-snapshot--print-result',

  snapshotResults: 'cov-print-snapshot--snapshot-results',
  snapshotResult: 'cov-print-snapshot--snapshot-result',

  icon: 'cov-print-snapshot--icon',
  iconPrinting: 'esri-icon-loading-indicator esri-rotating',
  iconDownload: 'esri-icon-download',
  iconOpen: 'esri-icon-link-external',
  iconError: 'esri-icon-error',
  error: 'cov-print-snapshot--print-error',

  maskingDiv: 'cov-print-snapshot--masking-div',
};

let KEY = 0;

@subclass('cov.widgets.Print')
export default class Print extends Widget {
  @property({
    aliasOf: 'viewModel.view',
  })
  view: esri.MapView;

  @property({
    aliasOf: 'viewModel.printServiceUrl',
  })
  printServiceUrl: string;

  @property()
  defaultTitle: string;

  @property()
  layouts = [
    'Letter ANSI A Landscape',
    'Letter ANSI A Portrait',
    'Tabloid ANSI B Landscape',
    'Tabloid ANSI B Portrait',
  ];

  @property()
  formats = ['PDF', 'PNG32', 'PNG8', 'JPG', 'GIF', 'EPS', 'SVG', 'SVGZ'];

  @property()
  layoutOptions: esri.PrintTemplateLayoutOptions = {};

  @property()
  copyrightText = 'All Humanity';

  @property({
    type: PrintViewModel,
  })
  viewModel: PrintViewModel = new PrintViewModel();

  constructor(properties: cov.PrintSnapshotProperties) {
    super(properties);
  }

  postInitialize(): void {
    document.body.append(this._maskingDiv);
    this._maskingDiv.classList.add(CSS.maskingDiv);
  }

  @property()
  @renderable()
  private _printResults: Array<PrintResult> = [];

  @property()
  @renderable()
  private _snapshotResults: Array<SnapshotResult> = [];

  @property()
  private _maskingDiv = document.createElement('div');

  @property()
  @renderable()
  private _activeTab = 'data-tab-0';

  render(): tsx.JSX.Element {
    const id = this.id;

    return (
      <div class={CSS.base}>
        {/* tabs */}
        <ul class={CSS.tabs} role="tablist">
          <li
            id={`tab_${id}_tab_0`}
            aria-selected={this._activeTab === 'data-tab-0' ? 'true' : 'false'}
            bind={this}
            onclick={() => (this._activeTab = 'data-tab-0')}
          >
            Print
          </li>
          <li
            id={`tab_${id}_tab_1`}
            aria-selected={this._activeTab === 'data-tab-1' ? 'true' : 'false'}
            bind={this}
            onclick={() => (this._activeTab = 'data-tab-1')}
          >
            Snapshot
          </li>
        </ul>

        {/* content */}
        <main class={CSS.tabsContentWrapper}>
          {/* print */}
          <section
            class={CSS.tabsContent}
            aria-labelledby={`tab_${id}_tab_0`}
            role="tabcontent"
            style={`display:${this._activeTab === 'data-tab-0' ? 'block' : 'none'}`}
          >
            {/* print form */}
            <form class={CSS.form} bind={this} onsubmit={this._print}>
              <div class={CSS.formRow}>
                <div class={CSS.formControl}>
                  <label for={`print_title_${id}`}>Title</label>
                  <input
                    id={`print_title_${id}`}
                    class={CSS.input}
                    type="text"
                    name="TITLE"
                    value={this.defaultTitle}
                    placeholder="Map title"
                  />
                </div>
              </div>
              <div class={CSS.formRow}>
                <div class={CSS.formControl}>
                  <label for={`print_layout_${id}`}>Layout</label>
                  <select id={`print_layout_${id}`} class={CSS.select} name="LAYOUT">
                    {this.layouts.map((layout: string) => {
                      return <option value={layout}>{layout}</option>;
                    })}
                  </select>
                </div>
              </div>
              <div class={CSS.formRow}>
                <div class={CSS.formControl}>
                  <label for={`print_format_${id}`}>Format</label>
                  <select id={`print_format_${id}`} class={CSS.select} name="FORMAT">
                    {this.formats.map((format: string) => {
                      return <option value={format}>{format}</option>;
                    })}
                  </select>
                </div>
              </div>
              <div class={CSS.formRow}>
                <div class={CSS.formControl}>
                  <button class={CSS.button} type="submit">
                    Print
                  </button>
                </div>
              </div>
            </form>

            {/* print results */}
            <ul class={CSS.printResults}>
              {this._printResults.map((result: PrintResult) => {
                const titleText = result.titleText;
                switch (result.state) {
                  case 'printing':
                    return (
                      <li key={KEY++} class={CSS.printResult} title="Map printing">
                        <span class={this.classes(CSS.icon, CSS.iconPrinting)}></span>
                        <span>{titleText}</span>
                      </li>
                    );
                  case 'printed':
                    return (
                      <li key={KEY++} class={CSS.printResult} title={`Download ${titleText}`}>
                        <a href={result.url} target="_blank" rel="noopener">
                          <span class={this.classes(CSS.icon, CSS.iconDownload)}></span>
                          <span>{titleText}</span>
                        </a>
                      </li>
                    );
                  case 'error':
                    return (
                      <li key={KEY++} class={this.classes(CSS.printResult, CSS.error)} title="Print error">
                        <span class={this.classes(CSS.icon, CSS.iconError)}></span>
                        <span>{titleText}</span>
                      </li>
                    );
                }
              })}
            </ul>
          </section>

          {/* snapshot */}
          <section
            class={CSS.tabsContent}
            aria-labelledby={`tab_${this.id}_tab_1`}
            role="tabcontent"
            style={`display:${this._activeTab === 'data-tab-1' ? 'block' : 'none'}`}
          >
            {/* snapshot form */}
            <form class={CSS.form} bind={this} onsubmit={this._snapshot}>
              <div class={CSS.formRow}>
                <div class={CSS.formControl}>
                  <label for={`snapshot_title_${id}`}>Title</label>
                  <input
                    id={`snapshot_title_${id}`}
                    class={CSS.input}
                    type="text"
                    name="TITLE"
                    value={this.defaultTitle}
                    placeholder="Map title"
                  />
                </div>
              </div>
              <div class={CSS.formRow}>
                <div class={CSS.formControl}>
                  <label for={`snapshot_format_${id}`}>Format</label>
                  <select id={`snapshot_format_${id}`} class={CSS.select} name="FORMAT">
                    <option value="jpeg">JPG File</option>
                    <option value="png">PNG File</option>
                  </select>
                </div>
              </div>
              <div class={CSS.formRow}>
                <div class={CSS.formControl}>
                  <button class={CSS.button} type="submit">
                    Snapshot
                  </button>
                </div>
                <div class={CSS.formControl}>
                  <button class={CSS.button} type="button" bind={this} onclick={this._areaSnapshot}>
                    Area Snapshot
                  </button>
                </div>
              </div>
            </form>

            {/* snapshot results */}
            <ul class={CSS.snapshotResults}>
              {this._snapshotResults.map((result: SnapshotResult) => {
                const { dataUrl, titleText, contentType } = result;
                return (
                  <li key={KEY++} class={CSS.snapshotResult}>
                    <img src={dataUrl} title={titleText} alt={titleText} />
                    <p>
                      <a
                        href="#"
                        bind={this}
                        onclick={(evt: Event) => {
                          evt.preventDefault();
                          this._open(dataUrl || '', contentType);
                        }}
                      >
                        <span class={CSS.iconOpen}></span>&nbsp;&nbsp;Open
                      </a>
                      <br />
                      <a
                        href="#"
                        bind={this}
                        onclick={(evt: Event) => {
                          evt.preventDefault();
                          this._download(dataUrl || '', titleText);
                        }}
                      >
                        <span class={CSS.iconDownload}></span>&nbsp;&nbsp;Download
                      </a>
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        </main>
      </div>
    );
  }

  private _print(evt: Event) {
    evt.preventDefault();
    const target = evt.target as HTMLFormElement;
    const titleText = target.TITLE.value || this.defaultTitle || 'Map';
    const result: PrintResult = {
      titleText,
      state: 'printing',
      url: null,
    };
    this._printResults.push(result);
    let format = target.FORMAT.value || this.formats[0];
    format = format.toLowerCase();
    let layout = target.LAYOUT.value || this.layouts[0];
    layout = layout.split(' ').join('-').toLowerCase();
    this.viewModel
      .print(
        new PrintTemplate({
          format,
          layout,
          layoutOptions: {
            ...this.layoutOptions,
            titleText,
          },
        }),
      )
      .then((res: any) => {
        result.url = res.url;
        result.state = 'printed';
      })
      .catch((err: esri.Error) => {
        console.log(err);
        result.state = 'error';
      })
      .then(this.scheduleRender.bind(this));
  }

  private _open(base64ImageData: string, contentType: string) {
    const byteCharacters = atob(base64ImageData.substr(`data:${contentType};base64,`.length));
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: contentType });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  }

  private _download(dataUrl: string, titleText: string) {
    const a = document.createElement('a');
    a.setAttribute('href', dataUrl);
    a.setAttribute('download', titleText);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private _snapshot(evt: Event | any, area?: esri.MapViewTakeScreenshotOptionsArea) {
    if (evt.preventDefault && typeof evt.preventDefault === 'function') {
      evt.preventDefault();
    }
    const target = evt.target as HTMLFormElement;
    const titleText = target.TITLE.value || this.defaultTitle || 'Map';
    const format = target.FORMAT.value;
    const contentType = `image/${format}`;
    const result: SnapshotResult = {
      titleText,
      state: 'snapshotting',
      dataUrl: null,
      contentType,
    };
    this._snapshotResults.push(result);
    this.view
      .takeScreenshot({
        format,
        area,
      })
      .then((res: esri.Screenshot) => {
        const data = res.data;
        // canvas and context
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = data.width;
        canvas.height = data.height;
        // add image
        context.putImageData(data, 0, 0);
        // add text
        context.font = 'bold 14px Arial';
        context.strokeStyle = '#fff';
        context.strokeText(`${titleText} - ${this.copyrightText}`, 5, data.height - 5, data.width - 5);
        context.font = 'bold 14px Arial';
        context.fillStyle = '#000';
        context.fillText(`${titleText} - ${this.copyrightText}`, 5, data.height - 5, data.width - 5);
        result.dataUrl = canvas.toDataURL(contentType) as string;
        result.state = 'snapshotted';
      })
      .catch((err: esri.Error) => {
        console.log(err);
        result.state = 'error';
      })
      .then(this.scheduleRender.bind(this));
  }

  private _areaSnapshot(evt: { target: HTMLButtonElement }) {
    const view = this.view;
    const form = evt.target.parentNode?.parentNode?.parentNode as HTMLFormElement;
    const md = this._maskingDiv;

    const clamp = (value: number, from: number, to: number): number => {
      return value < from ? from : value > to ? to : value;
    };

    const mask = (maskArea: MaskArea | null): void => {
      if (maskArea) {
        md.style.display = 'block';
        md.style.left = maskArea.x + 'px';
        md.style.top = maskArea.y + 'px';
        md.style.width = maskArea.width + 'px';
        md.style.height = maskArea.height + 'px';
      } else {
        md.style.display = 'none';
      }
    };

    let area: MaskArea | null = null;
    view.container.style.cursor = 'crosshair';
    const handler = this.view.on('drag', (evt: esri.MapViewDragEvent) => {
      evt.stopPropagation();
      if (evt.action !== 'end') {
        const xmin = clamp(Math.min(evt.origin.x, evt.x), 0, view.width);
        const xmax = clamp(Math.max(evt.origin.x, evt.x), 0, view.width);
        const ymin = clamp(Math.min(evt.origin.y, evt.y), 0, view.height);
        const ymax = clamp(Math.max(evt.origin.y, evt.y), 0, view.height);
        area = {
          x: xmin,
          y: ymin,
          width: xmax - xmin,
          height: ymax - ymin,
        };
        mask(area);
      } else {
        handler.remove();
        mask(null);
        view.container.style.cursor = 'default';

        this._snapshot(
          {
            target: form,
          },
          area as MaskArea,
        );
      }
    });
  }
}
