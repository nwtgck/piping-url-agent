export function hoge(str: string): number {
  return str.length;
}


import * as http from "http";
import * as https from "https";
import * as url from "url";

// TODO: hard code
const httpPort = 3000;

// Ignore SSL certificate for Piping Server
// (from: https://stackoverflow.com/a/21961005/2885946)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

function sendToPipingServer(pipingUrl: string, contentType: string): http.ClientRequest {
    const parsedUrl = url.parse(pipingUrl, true);
    const client = parsedUrl.protocol === "https:" ? https : http;

    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: 'POST',
        headers: {
            'Content-Type': contentType || 'application/x-www-form-urlencoded'
        }
    };

    const req = client.request(options, (res: http.IncomingMessage) => {
        res.on('data', (chunk: any) => {
            // Print message from Piping Server
            console.log(chunk.toString("UTF-8"));
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    });

    req.on('error', (e: Error) => {
        console.error(`problem with request: ${e.message}`);
    });
    return req;
}

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    // TODO: Not use `as string`
    let parsedUrl = url.parse(req.url as string, true);
    const query = parsedUrl.query;
    let {
        target_url,
        piping_url
    } = query;

    if (target_url === undefined) {
       res.end(JSON.stringify({
         error: "target_url required"
       }));
      return;
    }
    if (piping_url === undefined) {
       res.end(JSON.stringify({
         error: "piping_url required"
       }));
      return;
    }
    if (Array.isArray(target_url)){
        res.end(JSON.stringify({
            error: `target_url should be string, but found array`
        }));
        return;
    }
    if (Array.isArray(piping_url)){
        res.end(JSON.stringify({
            error: `piping_url should be string, but found array`
        }));
        return;
    }

    const targetUrl: string = target_url;
    const pipingUrl: string = piping_url;

    const client = parsedUrl.protocol === "https:" ? https : http;

    const getReq = client.get(targetUrl, (getRes) => {
        res.end(JSON.stringify({
            error: null,
            info: {
                targetUrl: target_url,
                pipingUrl: piping_url
            }
        }));
        console.log(getRes.headers);
        getRes.pipe(sendToPipingServer(
            pipingUrl,
            // TODO: Not use casting
            getRes.headers["content-type"] as string
        ));
    });

    getReq.on("error", (err) => {
        res.end(JSON.stringify({
            error: err,
            info: {
                targetUrl: target_url,
                pipingUrl: piping_url
            }
        }));
    })
});


server.listen(httpPort, () => {
    console.log(`Listening on ${httpPort}...`)
});
