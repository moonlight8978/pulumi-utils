"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParameterName = exports.createTags = exports.tagsForName = exports.tagsForComponent = exports.createName = void 0;
const pulumi = __importStar(require("@pulumi/pulumi"));
const createName = (name, delimiter = '-') => [pulumi.getStack(), name].join(delimiter);
exports.createName = createName;
const tagsForComponent = (name, tags = {}) => (0, exports.tagsForName)((0, exports.createName)(name), tags);
exports.tagsForComponent = tagsForComponent;
const tagsForName = (name, tags = {}) => {
    return Object.assign(Object.assign({}, tags), { Name: name });
};
exports.tagsForName = tagsForName;
const createTags = (name, tags = {}) => {
    return (0, exports.tagsForName)((0, exports.createName)(name), tags);
};
exports.createTags = createTags;
const createParameterName = (service, parameterName) => `/${[pulumi.getStack(), service, parameterName].join('/')}`;
exports.createParameterName = createParameterName;
//# sourceMappingURL=naming.js.map