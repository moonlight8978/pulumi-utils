"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubnetCidrs = void 0;
const ip_cidr_1 = __importDefault(require("ip-cidr"));
const lodash_1 = require("lodash");
const createSubnetCidrs = (cidrBlock, subnetsCount) => {
    const cidr = new ip_cidr_1.default(cidrBlock);
    const subnetsCountPowerOf2 = findNearestPowerOf2(subnetsCount);
    const criticals = new Array(subnetsCountPowerOf2).fill(0).map((_, index) => {
        // @ts-ignore
        const ips = cidr.toArray({
            limit: cidr.size / subnetsCountPowerOf2 + 1,
            from: (cidr.size / subnetsCountPowerOf2) * index,
        });
        const maskLength = 32 - Math.log2(cidr.size);
        const reservedMaskLength = Math.log2(subnetsCountPowerOf2);
        return [`${(0, lodash_1.first)(ips)}/${maskLength + reservedMaskLength}`, `${(0, lodash_1.last)(ips)}/${maskLength + reservedMaskLength}`];
    });
    return (0, lodash_1.uniq)(criticals.flat()).slice(0, subnetsCount);
};
exports.createSubnetCidrs = createSubnetCidrs;
const findNearestPowerOf2 = (value) => {
    let power = 0;
    let result = 1;
    while (result < value) {
        result = Math.pow(2, power);
        power += 1;
    }
    return result;
};
//# sourceMappingURL=cidr.js.map