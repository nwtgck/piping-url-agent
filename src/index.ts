import {generateHandler} from "./piping-url-agent";
import * as http from "http";

// TODO: hard code
const httpPort = 3000;

// Ignore SSL certificate for Piping Server
// (from: https://stackoverflow.com/a/21961005/2885946)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const server = http.createServer(generateHandler(true));

server.listen(httpPort, () => {
  console.log(`Listening on ${httpPort}...`)
});
