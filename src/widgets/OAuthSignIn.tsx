/**
 * A widget to force user oauth sign in.
 */

import cov = __cov;

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import { tsx } from 'esri/widgets/support/widget';

import Widget from 'esri/widgets/Widget';

const STYLES = {
  base: 'position:absolute; top:0; right:0; bottom:0; left:0;',
  container: 'max-width:280px; margin:3rem auto; text-align:center;',
  button: 'width:100%;',
};

const CSS = {
  base: 'esri-widget',
  button: 'esri-button',
};

@subclass('cov.widgets.OAuthSignIn')
export default class OAuthSignIn extends Widget {

  @property()
  message = `Please sign into this application.`;

  @property()
  buttonText = 'Sign In';

  @property()
  oAuthViewModel: cov.OAuthViewModel;

  constructor(properties: cov.OAuthSignInProperties) {
    super(properties);
  }

  render(): tsx.JSX.Element {
    return (
      <div class={CSS.base} style={STYLES.base}>
        <div style={STYLES.container}>
          <p>{this.message}</p>
          <p>
            <button class={CSS.button} style={STYLES.button} bind={this} onclick={() => {
              this.oAuthViewModel.signIn();
            }}>{this.buttonText}</button>
          </p>
        </div>
      </div>
    );
  }
}
