"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postgresqlParameterGroup = void 0;
const aws_1 = require("@pulumi/aws");
const naming_1 = require("./naming");
exports.postgresqlParameterGroup = new aws_1.rds.ParameterGroup((0, naming_1.createName)('default-postgresql14-parameter-group'), {
    family: 'postgres14',
});
//# sourceMappingURL=rds.js.map