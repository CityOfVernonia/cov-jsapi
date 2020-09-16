/**
 * A view model for handling OAuth and signing in and out of applications.
 */

import cov = __cov;

import esri = __esri;

import Accessor from 'esri/core/Accessor';

import { property, subclass } from 'esri/core/accessorSupport/decorators';

import esriId from // registerOAuthInfos,
// checkSignInStatus,
// most useful esriId method and not exposed :/
// @ts-ignore
// oAuthSignIn,
// findServerInfo,
// destroyCredentials,
'esri/identity/IdentityManager';

import Error from 'esri/core/Error';

@subclass('cov.viewModels.OAuthViewModel')
export default class OAuthViewModel extends Accessor {
  /**
   * esri.portal.Portal instance to sign into.
   */
  @property()
  portal: esri.Portal;

  /**
   * esri.identity.OAuthInfo instance to perform authentication against.
   */
  @property()
  oAuthInfo: esri.OAuthInfo;

  /**
   * Alternate sign in url.
   *
   * Overrides default `${portal.url}/sharing/rest`.
   */
  @property()
  signInUrl: string;

  /**
   * esri.identity.Credential returned by `checkSignInStatus()`.
   */
  @property()
  credential: esri.Credential;

  /**
   * esri.portal.PortalUser instance of signed in user.
   */
  @property()
  user: esri.PortalUser;

  /**
   * User name.
   */
  @property({ aliasOf: 'user.fullName' })
  name: string;

  /**
   * User username.
   */
  @property({ aliasOf: 'user.username' })
  username: string;

  /**
   * `true` or `false` a user is signed in.
   */
  @property()
  signedIn = false;

  constructor(properties: cov.OAuthViewModelProperties) {
    super(properties);
    esriId.registerOAuthInfos([properties.oAuthInfo]);
    // set `oAuthViewModel` on esriId to access auth, user, etc
    // via `esriId` in other modules and widgets
    esriId['oAuthViewModel'] = this;
  }

  /**
   * Load the view model.
   *
   * @returns Promise<true | false> user signed in.
   */
  load(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.portal.loaded) {
        // check for sign in
        esriId
          .checkSignInStatus(this.portal.url)
          .then((credential: esri.Credential) => {
            this.credential = credential;
            this.user = this.portal.user;
            this.signedIn = true;
            resolve(true);
          })
          .catch((checkSignInError: esri.Error): void => {
            if (checkSignInError.message === 'User is not signed in.') {
              resolve(false);
            } else {
              reject(checkSignInError);
            }
          });
      } else {
        // reject if portal is not loaded
        reject(
          new Error(
            'OAuthViewModelLoadError',
            'Portal instance must be loaded before loading OAuthViewModel instance.',
          ),
        );
      }
    });
  }

  /**
   * Sign into the application.
   */
  signIn(): void {
    const url = this.signInUrl || `${this.portal.url}/sharing/rest`;
    esriId['oAuthSignIn'](url, esriId.findServerInfo(url), this.oAuthInfo, {
      oAuthPopupConfirmation: false,
      signal: new AbortController().signal,
    })
      .then(() => {
        window.location.reload();
      })
      .catch(() => {
        // do nothing...user aborted sign in
      });
  }

  /**
   * Sign out of the application.
   */
  signOut(): void {
    esriId.destroyCredentials();
    window.location.reload();
  }
}
