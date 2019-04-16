import * as http from 'http';
import * as assert from 'power-assert';
import * as getPort from 'get-port';
import thenRequest from 'then-request';
import * as express from 'express';
import * as pipingServer from 'piping-server';
import * as pipingUrlAgent from '../src/piping-url-agent';

describe('generateHandler', () => {
  it("should request to a target server", async () => {
    const pipingPort: number = await getPort();
    const agentPort: number = await getPort();
    const targetPort: number = await getPort();

    const pipingUrl: string = `http://localhost:${pipingPort}`;
    const agentUrl: string = `http://localhost:${agentPort}`;
    const targetUrl: string = `http://localhost:${targetPort}`;

    // Create a Piping Server
    const pServer: http.Server = http.createServer(
      new pipingServer.Server(false).generateHandler(false)
    );
    // Wait listening
    await new Promise(resolve =>
      pServer.listen(pipingPort, resolve)
    );

    // Create an agent server
    const agentServer: http.Server = http.createServer(pipingUrlAgent.generateHandler(false));
    // Wait listening
    await new Promise(resolve =>
      agentServer.listen(agentPort, resolve)
    );

    // Create server and wait listening
    const targetServer: http.Server = await new Promise(resolve => {
      const app = express();
      app.get('/', (req, res)=>{
        res.send("This is top page!\n");
      });
      app.get('/about', (req, res)=>{
        res.send("This is about page\n");
      });
      // HTTP server
      const server = app.listen(targetPort, ()=>resolve(server));
    });

    {
      // Request to the agent
      await thenRequest("GET", `${agentUrl}?target_url=${targetUrl}/&piping_url=${pipingUrl}/mypath1`);
      // Get from Piping Server
      const pRes1 = await thenRequest("GET", `${pipingUrl}/mypath1`);
      // Should be about page
      assert.strictEqual(pRes1.getBody("UTF-8"), "This is top page!\n");
    }

    {
      // Request to the agent
      await thenRequest("GET", `${agentUrl}?target_url=${targetUrl}/about&piping_url=${pipingUrl}/mypath1`);
      // Get from Piping Server
      const pRes1 = await thenRequest("GET", `${pipingUrl}/mypath1`);
      // Should be about page
      assert.strictEqual(pRes1.getBody("UTF-8"), "This is about page\n");
    }

    pServer.close();
    agentServer.close();
    targetServer.close();
  });
});
