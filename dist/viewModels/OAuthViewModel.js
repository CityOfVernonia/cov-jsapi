define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/identity/IdentityManager", "esri/core/Error"], function (require, exports, tslib_1, Accessor_1, decorators_1, IdentityManager_1, Error_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Accessor_1 = tslib_1.__importDefault(Accessor_1);
    IdentityManager_1 = tslib_1.__importStar(IdentityManager_1);
    Error_1 = tslib_1.__importDefault(Error_1);
    var OAuthViewModel = (function (_super) {
        tslib_1.__extends(OAuthViewModel, _super);
        function OAuthViewModel(properties) {
            var _this = _super.call(this, properties) || this;
            _this.signedIn = false;
            IdentityManager_1.registerOAuthInfos([properties.oAuthInfo]);
            IdentityManager_1.default['oAuthViewModel'] = _this;
            return _this;
        }
        OAuthViewModel.prototype.load = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (_this.portal.loaded) {
                    IdentityManager_1.checkSignInStatus(_this.portal.url)
                        .then(function (credential) {
                        _this.credential = credential;
                        _this.user = _this.portal.user;
                        _this.signedIn = true;
                        resolve(true);
                    })
                        .catch(function (checkSignInError) {
                        if (checkSignInError.message === 'User is not signed in.') {
                            resolve(false);
                        }
                        else {
                            reject(checkSignInError);
                        }
                    });
                }
                else {
                    reject(new Error_1.default('OAuthViewModelLoadError', 'Portal instance must be loaded before loading OAuthViewModel instance.'));
                }
            });
        };
        OAuthViewModel.prototype.signIn = function () {
            var url = this.signInUrl || this.portal.url + "/sharing/rest";
            IdentityManager_1.oAuthSignIn(url, IdentityManager_1.findServerInfo(url), this.oAuthInfo, {
                oAuthPopupConfirmation: false,
                signal: new AbortController().signal,
            })
                .then(function () {
                window.location.reload();
            })
                .catch(function () {
            });
        };
        OAuthViewModel.prototype.signOut = function () {
            IdentityManager_1.destroyCredentials();
            window.location.reload();
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], OAuthViewModel.prototype, "portal", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], OAuthViewModel.prototype, "oAuthInfo", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], OAuthViewModel.prototype, "signInUrl", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], OAuthViewModel.prototype, "credential", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], OAuthViewModel.prototype, "user", void 0);
        tslib_1.__decorate([
            decorators_1.property({ aliasOf: 'user.fullName' })
        ], OAuthViewModel.prototype, "name", void 0);
        tslib_1.__decorate([
            decorators_1.property({ aliasOf: 'user.username' })
        ], OAuthViewModel.prototype, "username", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], OAuthViewModel.prototype, "signedIn", void 0);
        OAuthViewModel = tslib_1.__decorate([
            decorators_1.subclass('cov.viewModels.OAuthViewModel')
        ], OAuthViewModel);
        return OAuthViewModel;
    }(Accessor_1.default));
    exports.default = OAuthViewModel;
});
//# sourceMappingURL=OAuthViewModel.js.map