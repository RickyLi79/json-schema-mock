import http from "http";
import https from "https";

class HttpUtilStatic {

    async get(url: string) {
        return new Promise<string>((resolve, reject) => {
            const options = new URL(url);
            const m = url.toLowerCase().startsWith("https://") ? https : http;
            const req = m.request(options, (res) => {
                let re: string = "";
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
    }
}

export const HttpUtil = new HttpUtilStatic()