"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = __importDefault(require("winston"));
var logger = winston_1.default.createLogger({
    level: 'debug',
    format: winston_1.default.format.combine(winston_1.default.format.errors({ stack: true }), winston_1.default.format.simple()),
    transports: [
        new winston_1.default.transports.Console({
            level: 'debug'
        }),
        new winston_1.default.transports.Console({
            level: 'error'
        })
    ]
});
exports.default = logger;
