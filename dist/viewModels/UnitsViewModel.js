define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/widgets/support/widget"], function (require, exports, tslib_1, Accessor_1, decorators_1, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Accessor_1 = tslib_1.__importDefault(Accessor_1);
    var KEY = 0;
    var UnitsViewModel = (function (_super) {
        tslib_1.__extends(UnitsViewModel, _super);
        function UnitsViewModel(properties) {
            var _this = _super.call(this, properties) || this;
            _this.selectClass = 'esri-select';
            _this.locationUnit = 'dec';
            _this.locationUnits = {
                dec: 'Decimal Degrees',
                dms: 'Degrees Minutes Seconds',
            };
            _this.lengthUnit = 'feet';
            _this.lengthUnits = {
                meters: 'Meters',
                feet: 'Feet',
                kilometers: 'Kilometers',
                miles: 'Miles',
                'nautical-miles': 'Nautical Miles',
                yards: 'Yards',
            };
            _this.areaUnit = 'acres';
            _this.areaUnits = {
                acres: 'Acres',
                ares: 'Ares',
                hectares: 'Hectacres',
                'square-feet': 'Square Feet',
                'square-meters': 'Square Meters',
                'square-yards': 'Square Yards',
                'square-kilometers': 'Square Kilometers',
                'square-miles': 'Square Miles',
            };
            _this.elevationUnit = 'feet';
            _this.elevationUnits = {
                feet: 'Feet',
                meters: 'Meters',
            };
            return _this;
        }
        UnitsViewModel.prototype.locationSelect = function (name, title) {
            var _this = this;
            return (widget_1.tsx("select", { class: this.selectClass, name: name || '', title: title || '', bind: this, onchange: function (evt) {
                    _this.locationUnit = evt.target.value;
                } }, this._createUnitOptions(this.locationUnits, this.locationUnit)));
        };
        UnitsViewModel.prototype.lengthSelect = function (name, title) {
            var _this = this;
            return (widget_1.tsx("select", { class: this.selectClass, name: name || '', title: title || '', bind: this, onchange: function (evt) {
                    _this.lengthUnit = evt.target.value;
                } }, this._createUnitOptions(this.lengthUnits, this.lengthUnit.toString())));
        };
        UnitsViewModel.prototype.areaSelect = function (name, title) {
            var _this = this;
            return (widget_1.tsx("select", { class: this.selectClass, name: name || '', title: title || '', bind: this, onchange: function (evt) {
                    _this.areaUnit = evt.target.value;
                } }, this._createUnitOptions(this.areaUnits, this.areaUnit.toString())));
        };
        UnitsViewModel.prototype.elevationSelect = function (name, title) {
            var _this = this;
            return (widget_1.tsx("select", { class: this.selectClass, name: name || '', title: title || '', bind: this, onchange: function (evt) {
                    _this.elevationUnit = evt.target.value;
                } }, this._createUnitOptions(this.elevationUnits, this.elevationUnit)));
        };
        UnitsViewModel.prototype._createUnitOptions = function (units, defaultUnit) {
            var options = [];
            for (var unit in units) {
                options.push(widget_1.tsx("option", { key: KEY++, value: unit, selected: unit === defaultUnit }, units[unit]));
            }
            return options;
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], UnitsViewModel.prototype, "selectClass", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], UnitsViewModel.prototype, "locationUnit", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], UnitsViewModel.prototype, "locationUnits", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], UnitsViewModel.prototype, "lengthUnit", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], UnitsViewModel.prototype, "lengthUnits", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], UnitsViewModel.prototype, "areaUnit", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], UnitsViewModel.prototype, "areaUnits", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], UnitsViewModel.prototype, "elevationUnit", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], UnitsViewModel.prototype, "elevationUnits", void 0);
        UnitsViewModel = tslib_1.__decorate([
            decorators_1.subclass('cov.viewModels.UnitsViewModel')
        ], UnitsViewModel);
        return UnitsViewModel;
    }(Accessor_1.default));
    exports.default = UnitsViewModel;
});
//# sourceMappingURL=UnitsViewModel.js.map