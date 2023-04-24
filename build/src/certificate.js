"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGetCertificateArn = void 0;
const createGetCertificateArn = (config) => {
    const projectToCertificateArnConfig = config.requireObject('projectToCertificateArn');
    return (project) => projectToCertificateArnConfig[project];
};
exports.createGetCertificateArn = createGetCertificateArn;
//# sourceMappingURL=certificate.js.map