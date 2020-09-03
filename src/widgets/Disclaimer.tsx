/**
 * A widget to display a disclaimer.
 */

import cov = __cov;

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import { tsx } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

import DisclaimerMessages from './Disclaimer/t9n/Disclaimer.json';

import Cookies from 'js-cookie';

const CSS = {
  base: 'cov-disclaimer',
  button: 'esri-button',
};

const COOKIE_NAME = 'cov_disclaimer_widget_accepted';
const COOKIE_VALUE = 'accepted';

@subclass('cov.widgets.Disclaimer')
export default class Disclaimer extends Widget {
  @property()
  title = 'Disclaimer';

  @property()
  disclaimer = `There are no warranties, expressed or implied, including the warranty of merchantability or fitness for a particular purpose, accompanying this application.`;

  // available in 4.17?
  // @property()
  // @messageBundle('esri/widgets/Attribution/t9n/Attribution')
  // messages: DisclaimerMessages = null;

  static isAccepted(): boolean {
    const cookie = Cookies.get(COOKIE_NAME);
    return cookie && cookie === COOKIE_VALUE ? true : false;
  }

  constructor(properties?: cov.DisclaimerProperties) {
    super(properties);
  }

  render(): tsx.JSX.Element {
    return (
      <div class={CSS.base}>
        <main>
          <h3>{this.title}</h3>
          <p>{this.disclaimer}</p>
          <form bind={this} onsubmit={this._accept}>
            <label>
              <input type="checkbox" name="NOSHOW" />
              {DisclaimerMessages.dontShowAgain}
            </label>
            <button class={CSS.button}>{DisclaimerMessages.accept}</button>
          </form>
        </main>
      </div>
    );
  }

  private _accept(evt: Event) {
    evt.preventDefault();
    if ((evt.target as HTMLFormElement).NOSHOW.checked) {
      Cookies.set(COOKIE_NAME, COOKIE_VALUE, { expires: 60 });
    }
    this.emit('accepted');
    this.destroy();
  }
}
