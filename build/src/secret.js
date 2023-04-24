"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecrets = exports.createParameterNameFromRef = void 0;
const aws_1 = require("@pulumi/aws");
const pulumi_1 = require("@pulumi/pulumi");
const naming_1 = require("./naming");
const createParameterNameFromRef = (ref) => `/${(0, pulumi_1.getStack)()}/${ref}`;
exports.createParameterNameFromRef = createParameterNameFromRef;
const createSecrets = (config, project) => {
    const secretNameToValueConfig = config.requireObject('secretNameToValue');
    const secrets = Object.entries(secretNameToValueConfig).map(([secretName, secretValue]) => {
        return new aws_1.ssm.Parameter((0, naming_1.createName)(`${project}-${secretName.replace('/', '-')}-parameter`), {
            name: (0, exports.createParameterNameFromRef)(`${project}/${secretName}`),
            value: secretValue,
            type: 'String',
        });
    });
    const getSecretValue = (name) => secretNameToValueConfig[name];
    return {
        secrets,
        getSecretValue,
        findOrCreateServiceSecrets: (serviceSecrets) => {
            return (0, pulumi_1.all)(secrets.map((secret) => secret.name)).apply((secretNames) => {
                return serviceSecrets.map((serviceSecret) => {
                    if (serviceSecret.name) {
                        return new aws_1.ssm.Parameter((0, naming_1.createName)(`${project}-${serviceSecret.name.replace('/', '-')}-parameter`), {
                            name: (0, exports.createParameterNameFromRef)(`${project}/${serviceSecret.name}`),
                            value: getSecretValue(serviceSecret.ref),
                            type: 'String',
                        });
                    }
                    return secrets[secretNames.findIndex((secretName) => secretName === (0, exports.createParameterNameFromRef)(`${project}/${serviceSecret.ref}`))];
                });
            });
        },
    };
};
exports.createSecrets = createSecrets;
//# sourceMappingURL=secret.js.map