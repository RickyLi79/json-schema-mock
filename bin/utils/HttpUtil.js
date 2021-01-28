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
exports.HttpUtil = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
class HttpUtilStatic {
    get(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const options = new URL(url);
                const m = url.toLowerCase().startsWith("https://") ? https_1.default : http_1.default;
                const req = m.request(options, (res) => {
                    let re = "";
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => {
                        re += chunk;
                    });
                    res.on('end', () => {
                        resolve(re);
                    });
                });
                req.on('error', (e) => {
                    reject(e);
                });
                // req.write(postData);
                req.end();
            });
        });
    }
}
exports.HttpUtil = new HttpUtilStatic();
