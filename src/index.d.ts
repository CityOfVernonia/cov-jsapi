import esri = __esri;

interface Hash<T> {
  [key: string]: T;
}

declare namespace __cov {
  ///////////////////////////////////////////////////////////////////
  // popups
  ///////////////////////////////////////////////////////////////////

  export class TaxLotPopup extends esri.PopupTemplate {}

  export class WaterMeterPopup extends esri.PopupTemplate {}

  ///////////////////////////////////////////////////////////////////
  // view models
  ///////////////////////////////////////////////////////////////////

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

  ///////////////////////////////////////////////////////////////////
  // widgets
  ///////////////////////////////////////////////////////////////////

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

  export class Disclaimer extends esri.Widget {
    constructor(properties: DisclaimerProperties);
    title: string;
    disclaimer: string;
    static isAccepted(): boolean;
    on(type: 'accepted', listener: () => void): IHandle;
  }

  export interface LayerListLegendProperties extends esri.WidgetProperties {
    /**
     * Map or scene view.
     */
    view?: esri.MapView | esri.SceneView;

    /**
     * Any and all LayerList widget properties.
     */
    layerListProperties?: esri.LayerListProperties;

    /**
     * Any and all Legend widget properties.
     */
    legendProperties?: esri.LegendProperties;
  }

  export class LayerListLegend extends esri.Widget {
    constructor(properties?: LayerListLegendProperties);
    view: esri.MapView | esri.SceneView;
    layerListProperties: esri.LayerListProperties;
    legendProperties: esri.LegendProperties;
  }

  export interface PrintSnapshotProperties extends esri.WidgetProperties {
    /**
     * Map view.
     */
    view?: esri.MapView;

    /**
     * URL of print service.
     */
    printServiceUrl: string;

    /**
     * Default title for title input.
     */
    defaultTitle?: string;

    /**
     * Array of available print service layouts in layout select.
     */
    layouts?: string[];

    /**
     * Array of available file formats in format select.
     */
    formats?: string[];

    /**
     * Any additional layout options to mix into print template.
     */
    layoutOptions?: esri.PrintTemplateLayoutOptions;

    /**
     * Copyright right text to add to snapshot images.
     */
    copyrightText?: string;
  }

  export class PrintSnapshot extends esri.Widget {
    constructor(properties: PrintSnapshotProperties);
    view: esri.MapView;
    printServiceUrl: string;
    defaultTitle: string;
    layouts: string[];
    formats: string[];
    layoutOptions: esri.PrintTemplateLayoutOptions;
    copyrightText: string;
  }

  export interface SymbolEditorProperties extends esri.WidgetProperties {
    /**
     * The graphic for which to edit the symbol of.
     */
    graphic: esri.Graphic;
  }

  class SymbolEditor extends esri.Widget {
    constructor(properties: SymbolEditorProperties);
    graphic: esri.Graphic;
    symbol: esri.Symbol;
    setSymbolProperty(property: string, evt?: Event, value?: string | number): void;
  }

  export class SimpleMarkerEditor extends SymbolEditor {
    symbol: esri.SimpleMarkerSymbol;
  }

  export class SimpleLineEditor extends SymbolEditor {
    symbol: esri.SimpleLineSymbol;
  }

  export class SimpleFillEditor extends SymbolEditor {
    symbol: esri.SimpleFillSymbol;
  }

  export interface ColorPickerProperties extends esri.WidgetProperties {
    /**
     * Array of hex colors to display.
     *
     * @default [https://clrs.cc/]
     */
    palette?: string[];

    /**
     * Number of colors per row.
     *
     * @default 8
     */
    colorsPerRow?: number;

    /**
     * `esri/Color` value to init widget with.
     */
    value?: esri.Color;
  }

  export class ColorPicker extends esri.Widget {
    constructor(properties: ColorPickerProperties);
    palette: string[];
    colorsPerRow: number;
    value: esri.Color;
    on(type: 'accepted', listener: () => esri.Color): IHandle;
  }

  export interface OAuthSignInProperties extends esri.WidgetProperties {
    /**
     * OAuthViewModel to handle sign in.
     */
    oAuthViewModel: OAuthViewModel;

    /**
     * Message text.
     */
    message?: string;

    /**
     * Button text.
     */
    buttonText?: string;
  }

  export class OAuthSignIn extends esri.Widget {
    constructor(properties: OAuthSignInProperties);
    message: string;
    buttonText: string;
  }

  export interface MapNavigationProperties extends esri.WidgetProperties {
    /**
     * Map view.
     */
    view?: esri.MapView;

    /**
     * Include compass.
     *
     * @default true
     */
    compass?: boolean;

    /**
     * Include home.
     *
     * @default true
     */
    home?: boolean;

    /**
     * Include locate.
     *
     * @default true
     */
    locate?: boolean;

    /**
     * Include fullscreen.
     *
     * @default true
     */
    fullscreen?: boolean;

    /**
     * Fullscreen HTML element.
     * An element or a querySelector string.
     */
    fullscreenElement?: string | HTMLElement;
  }

  export class MapNavigation extends esri.Widget {
    constructor(properties: MapNavigationProperties);
    view: esri.MapView;
    compass: boolean;
    home: boolean;
    locate: boolean;
    fullscreen: boolean;
    fullscreenElement: string | HTMLElement;
    protected zoomViewModel: esri.ZoomViewModel;
    protected homeViewModel: esri.HomeViewModel;
    protected locateViewModel: esri.LocateViewModel;
    protected fullscreenViewModel: esri.FullscreenViewModel;
  }

  ///////////////////////////////////////////////////////////////////
  // apps
  ///////////////////////////////////////////////////////////////////
  export interface WaterMeterEditorProperties extends esri.WidgetProperties {
    layerPortalItemId: string;
    layers?: esri.FeatureLayer[];
  }

  export class WaterMeterEditor extends esri.Widget {
    constructor(properties: WaterMeterEditorProperties);
    layerPortalItemId: string;
    basemapPortalItemId: string;
  }
}

declare module 'cov/popups/TaxLotPopup' {
  import TaxLotPopup = __cov.TaxLotPopup;
  export = TaxLotPopup;
}

declare module 'cov/popups/WaterMeterPopup' {
  import WaterMeterPopup = __cov.WaterMeterPopup;
  export = WaterMeterPopup;
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

declare module 'cov/widgets/LayerListLegend' {
  import LayerListLegend = __cov.LayerListLegend;
  export = LayerListLegend;
}

declare module 'cov/widgets/PrintSnapshot' {
  import PrintSnapshot = __cov.PrintSnapshot;
  export = PrintSnapshot;
}

declare module 'cov/widgets/symbolEditors/SimpleMarkerEditor' {
  import SimpleMarkerEditor = __cov.SimpleMarkerEditor;
  export = SimpleMarkerEditor;
}

declare module 'cov/widgets/symbolEditors/SimpleLineEditor' {
  import SimpleLineEditor = __cov.SimpleLineEditor;
  export = SimpleLineEditor;
}

declare module 'cov/widgets/symbolEditors/SimpleFillEditor' {
  import SimpleFillEditor = __cov.SimpleFillEditor;
  export = SimpleFillEditor;
}

declare module 'cov/widgets/OAuthSignIn' {
  import OAuthSignIn = __cov.OAuthSignIn;
  export = OAuthSignIn;
}

declare module 'cov/widgets/MapNavigation' {
  import MapNavigation = __cov.MapNavigation;
  export = MapNavigation;
}

declare module 'cov/apps/WaterMeterEditor' {
  import WaterMeterEditor = __cov.WaterMeterEditor;
  export = WaterMeterEditor;
}
