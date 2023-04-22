"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMaybeComponent = void 0;
function createMaybeComponent(config, create) {
    return config.enabled ? create() : undefined;
}
exports.createMaybeComponent = createMaybeComponent;
//# sourceMappingURL=utils.js.map