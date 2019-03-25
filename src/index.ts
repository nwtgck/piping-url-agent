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

type SendingSetting = {
  scheme: "http" | "https",
  hostname: string,
  port: number,
  path: string, // (NOTE: This can contain "?key1=value")
  contentType: string
}

function sendToPipingServer({
    scheme,
    hostname,
    port,
    path,
    contentType
}: SendingSetting): http.ClientRequest {
    const client = scheme === "https" ? https : http;
    const options = {
        hostname: hostname,
        port: port,
        path: path,
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
        piping_scheme,
        piping_hostname,
        piping_port,
        piping_path
    } = query;


    // TODO: Not use casting
    const pipingScheme: "http" | "https" = (piping_scheme as ("http" | "https")) || "https";
    // TODO: Not use casting
    const pipingPort = parseInt(piping_port as string) || 443;


    if (target_url === undefined) {
       res.end(JSON.stringify({
         error: "target_url required"
       }));
      return;
    }
    if (piping_hostname === undefined) {
        res.end(JSON.stringify({
            error: "piping_hostname required"
        }));
        return;
    }
    if (piping_path === undefined) {
       res.end(JSON.stringify({
         error: "piping_path required"
       }));
      return;
    }
    if (Array.isArray(target_url)){
        res.end(JSON.stringify({
            error: `target_url should be string, but found array`
        }));
        return;
    }

    const pipingSetting = {
        scheme: pipingScheme,
        // TODO: Not use casting
        hostname: piping_hostname as string,
        port: pipingPort,
        // TODO: Not use casting
        path: piping_path as string,
    };
    const client = parsedUrl.protocol === "https:" ? https : http;

    const info = {
        targetUrl: target_url,
        pipingSetting: pipingSetting
    };


    const getReq = client.get(target_url, (getRes) => {
        res.end(JSON.stringify({
            error: null,
            info: info
        }));
        console.log(getRes.headers);
        getRes.pipe(sendToPipingServer({
          ...pipingSetting,
            // TODO: Not use casting
            contentType: getRes.headers["content-type"] as string
        }));
    });

    getReq.on("error", (err) => {
        res.end(JSON.stringify({
            error: err,
            info: info
        }));
    })
});


server.listen(httpPort, () => {
    console.log(`Listening on ${httpPort}...`)
});
