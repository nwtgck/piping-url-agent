import {generateHandler} from "./piping-url-agent";
import * as http from "http";
import * as yargs from "yargs";

// Option parser
const parser = yargs
  .option("http-port", {
    describe: "HTTP port",
    default: 3000
  });

const args = parser.parse(process.argv);

const httpPort: number = args["http-port"];

// Ignore SSL certificate for Piping Server
// (from: https://stackoverflow.com/a/21961005/2885946)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const server = http.createServer(generateHandler(true));

server.listen(httpPort, () => {
  console.log(`Listening on ${httpPort}...`)
});
