"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_1 = require("yaml");
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const shelljs_1 = __importDefault(require("shelljs"));
commander_1.program.requiredOption('-f, --file <path>').requiredOption('-s, --stack <name>');
commander_1.program.parse();
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const options = commander_1.program.opts();
    const txt = fs_1.default.readFileSync(options.file);
    const secretNameToValue = (0, yaml_1.parse)(txt.toString());
    for (const entry of Object.entries(secretNameToValue)) {
        const [secretName, plainTextOrSecuredValue] = entry;
        const parseValue = () => {
            if (typeof plainTextOrSecuredValue === 'string') {
                const plainTextValue = plainTextOrSecuredValue;
                return {
                    value: plainTextValue,
                    isSecret: false,
                };
            }
            else {
                const plainTextValue = plainTextOrSecuredValue.secure;
                return {
                    value: plainTextValue,
                    isSecret: true,
                };
            }
        };
        const { value, isSecret } = parseValue();
        const args = [
            'pulumi',
            'config',
            '-s',
            options.stack,
            'set',
            '--path',
            `secretNameToValue.${secretName}`,
            `"${value}"`,
            isSecret ? '--secret' : '--plaintext',
        ].filter(Boolean);
        const shellCommand = args.join(' ');
        console.log(shellCommand);
        shelljs_1.default.exec(shellCommand);
    }
});
main()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=secret-generator.js.map