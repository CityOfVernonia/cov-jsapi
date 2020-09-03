define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/support/widget", "esri/widgets/Widget", "./Disclaimer/t9n/Disclaimer.json", "js-cookie"], function (require, exports, tslib_1, decorators_1, widget_1, Widget_1, Disclaimer_json_1, js_cookie_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Widget_1 = tslib_1.__importDefault(Widget_1);
    Disclaimer_json_1 = tslib_1.__importDefault(Disclaimer_json_1);
    js_cookie_1 = tslib_1.__importDefault(js_cookie_1);
    var CSS = {
        base: 'cov-disclaimer',
        button: 'esri-button',
    };
    var COOKIE_NAME = 'cov_disclaimer_widget_accepted';
    var COOKIE_VALUE = 'accepted';
    var Disclaimer = (function (_super) {
        tslib_1.__extends(Disclaimer, _super);
        function Disclaimer(properties) {
            var _this = _super.call(this, properties) || this;
            _this.title = 'Disclaimer';
            _this.disclaimer = "There are no warranties, expressed or implied, including the warranty of merchantability or fitness for a particular purpose, accompanying this application.";
            return _this;
        }
        Disclaimer.isAccepted = function () {
            var cookie = js_cookie_1.default.get(COOKIE_NAME);
            return cookie && cookie === COOKIE_VALUE ? true : false;
        };
        Disclaimer.prototype.render = function () {
            return (widget_1.tsx("div", { class: CSS.base },
                widget_1.tsx("main", null,
                    widget_1.tsx("h3", null, this.title),
                    widget_1.tsx("p", null, this.disclaimer),
                    widget_1.tsx("form", { bind: this, onsubmit: this._accept },
                        widget_1.tsx("label", null,
                            widget_1.tsx("input", { type: "checkbox", name: "NOSHOW" }),
                            Disclaimer_json_1.default.dontShowAgain),
                        widget_1.tsx("button", { class: CSS.button }, Disclaimer_json_1.default.accept)))));
        };
        Disclaimer.prototype._accept = function (evt) {
            evt.preventDefault();
            if (evt.target.NOSHOW.checked) {
                js_cookie_1.default.set(COOKIE_NAME, COOKIE_VALUE, { expires: 60 });
            }
            this.emit('accepted');
            this.destroy();
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], Disclaimer.prototype, "title", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Disclaimer.prototype, "disclaimer", void 0);
        Disclaimer = tslib_1.__decorate([
            decorators_1.subclass('cov.widgets.Disclaimer')
        ], Disclaimer);
        return Disclaimer;
    }(Widget_1.default));
    exports.default = Disclaimer;
});
//# sourceMappingURL=Disclaimer.js.map