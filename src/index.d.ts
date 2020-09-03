import esri = __esri;

interface Hash<T> {
  [key: string]: T;
}

declare namespace __cov {
  export interface OAuthViewModelProperties extends Object {
    /**
     * esri.portal.Portal instance to sign into.
     */
    portal: esri.Portal;
    /**
     * esri.identity.OAuthInfo instance to perform authentication against.
     */

    oAuthInfo: esri.OAuthInfo;

    /**
     * Alternate sign in url.
     *
     * Overrides default `${portal.url}/sharing/rest`.
     */
    signInUrl?: string;
  }

  export class OAuthViewModel extends esri.Accessor {
    constructor(properties: OAuthViewModelProperties);
    portal: esri.Portal;
    oAuthInfo: esri.OAuthInfo;
    signInUrl: string;
    credential: esri.Credential;
    user: esri.PortalUser;
    name: string;
    username: string;
    signedIn: boolean;
    load(): Promise<boolean>;
    signIn(): void;
    signOut(): void;
  }

  export interface UnitsViewModelProperties extends Object {
    /**
     * CSS class string for <select>s.
     *
     * @default 'esri-select'
     */
    selectClass: string;

    /**
     * Current location unit.
     */
    locationUnit: string;

    /**
     * Available location unit and display text key/value pairs.
     */
    locationUnits: Hash<string>;

    /**
     * Current length unit.
     */
    lengthUnit: esri.LinearUnits;

    /**
     * Available length unit and display text key/value pairs.
     */
    lengthUnits: Hash<string>;

    /**
     * Current area unit.
     */
    areaUnit: esri.ArealUnits;

    /**
     * Available area unit and display text key/value pairs.
     */
    areaUnits: Hash<string>;

    /**
     * Current elevation unit.
     */
    elevationUnit: string;

    /**
     * Available elevation unit and display text key/value pairs.
     */
    elevationUnits: Hash<string>;
  }

  export class UnitsViewModel extends esri.Accessor {
    constructor(properties: UnitsViewModelProperties);
    selectClass: string;
    locationUnit: string;
    locationUnits: Hash<string>;
    lengthUnit: esri.LinearUnits;
    lengthUnits: Hash<string>;
    areaUnit: esri.ArealUnits;
    areaUnits: Hash<string>;
    elevationUnit: string;
    elevationUnits: Hash<string>;
    locationSelect(name?: null | string, title?: null | string): tsx.JSX.Element;
    lengthSelect(name?: null | string, title?: null | string): tsx.JSX.Element;
    areaSelect(name?: null | string, title?: null | string): tsx.JSX.Element;
    elevationSelect(name?: null | string, title?: null | string): tsx.JSX.Element;
  }

  export interface DisclaimerProperties extends esri.WidgetProperties {
    /**
     * Disclaimer title (usually the application title).
     *
     * @default 'Disclaimer'
     */
    title?: string;

    /**
     * Disclaimer text.
     *
     * @default 'There are no warranties, expressed or implied, including the warranty of merchantability or fitness for a particular purpose, accompanying this application.'
     */
    disclaimer?: string;
  }

  export class Disclaimer extends esri.widget {
    constructor(properties: DisclaimerProperties);
    title: string;
    disclaimer: string;
    static isAccepted(): boolean;
    on(type: 'accepted', listener: () => void): IHandle;
  }
}

declare module 'cov/viewModels/OAuthViewModel' {
  import OAuthViewModel = __cov.OAuthViewModel;
  export = OAuthViewModel;
}

declare module 'cov/viewModels/UnitsViewModel' {
  import UnitsViewModel = __cov.UnitsViewModel;
  export = UnitsViewModel;
}

declare module 'cov/widgets/Disclaimer' {
  import Disclaimer = __cov.Disclaimer;
  export = Disclaimer;
}
