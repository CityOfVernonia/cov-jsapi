// import cov = __cov;

export interface DatabaseProjectsProperties extends esri.WidgetProperties {
  text: esri.GraphicsLayer;
  point: esri.GraphicsLayer;
  polyline: esri.GraphicsLayer;
  polygon: esri.GraphicsLayer;
}

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import { tsx } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

import PouchDB = require('pouchdb-browser');

const CSS = {
  base: 'cov-local-storage-projects',
  button: 'esri-button',
  input: 'esri-input',
};

const DB_NAME = 'markup_db';

@subclass('cov.widgets.Markup.DatabaseProjects')
export default class DatabaseProjects extends Widget {
  @property()
  text: esri.GraphicsLayer;

  @property()
  point: esri.GraphicsLayer;

  @property()
  polyline: esri.GraphicsLayer;

  @property()
  polygon: esri.GraphicsLayer;

  @property()
  private _db: PouchDB.Database;

  constructor(properties?: DatabaseProjectsProperties) {
    super(properties);
  }

  postInitialize(): void {
    this._db = new PouchDB(DB_NAME);
    console.log(this._db);
  }

  private _save(evt: Event): void {
    evt.preventDefault();
    const target = evt.target as HTMLFormElement;

    this._db.post({
      title: target.TITLE,
    });
  }

  render(): tsx.JSX.Element {
    return (
      <div class={CSS.base}>
        <form bind={this} onsumbit={(evt: Event) => this._save(evt)}>
          <input class={CSS.input} name="TITLE" />
          <button class={CSS.button} type="submit">
            Save
          </button>
        </form>
      </div>
    );
  }
}
