"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailConfig = exports.jwtConfig = exports.databaseConfig = void 0;
var database_config_1 = require("./database.config");
Object.defineProperty(exports, "databaseConfig", { enumerable: true, get: function () { return __importDefault(database_config_1).default; } });
var jwt_config_1 = require("./jwt.config");
Object.defineProperty(exports, "jwtConfig", { enumerable: true, get: function () { return __importDefault(jwt_config_1).default; } });
var mail_config_1 = require("./mail.config");
Object.defineProperty(exports, "mailConfig", { enumerable: true, get: function () { return __importDefault(mail_config_1).default; } });
//# sourceMappingURL=index.js.map