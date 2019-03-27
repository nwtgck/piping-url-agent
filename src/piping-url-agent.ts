import * as http from "http";
import * as url from "url";
import * as https from "https";

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

export const handler = (req: http.IncomingMessage, res: http.ServerResponse) => {
  // TODO: Not use `as string`
  const parsedUrl = url.parse(req.url as string, true);
  const query = parsedUrl.query;
  const {
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
  if (Array.isArray(target_url)) {
    res.end(JSON.stringify({
      error: `target_url should be string, but found array`
    }));
    return;
  }
  if (Array.isArray(piping_url)) {
    res.end(JSON.stringify({
      error: `piping_url should be string, but found array`
    }));
    return;
  }

  const targetUrl: string = target_url;
  const pipingUrl: string = piping_url;

  const client = parsedUrl.protocol === "https:" ? https : http;

  const info = {
    "target_url": target_url,
    "piping_url": piping_url
  };

  const getReq = client.get(targetUrl, (getRes) => {
    res.end(JSON.stringify({
      error: null,
      info: info
    }, null, "  "));
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
      info: info
    }, null, "  "));
  })
};
