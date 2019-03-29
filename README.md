# piping-url-agent
[![CircleCI](https://circleci.com/gh/nwtgck/piping-url-agent.svg?style=shield)](https://circleci.com/gh/nwtgck/piping-url-agent) [![](https://images.microbadger.com/badges/image/nwtgck/piping-url-agent.svg)](https://microbadger.com/images/nwtgck/piping-url-agent "Get your own image badge on microbadger.com")

URL-getting Agent for [Piping Server](https://github.com/nwtgck/piping-server)

## Run the server

Here are several ways to run an agent server.

```bash
# Way 1
docker run -it -p 3000:3000 nwtgck/piping-url-agent
```

OR

```bash
# Way 2
npm i -g git+https://github.com/nwtgck/piping-url-agent#master
piping-url-agent
```


OR

```bash
# Way 3
cd <this repo>
npm i
npm start
```

Then, the agent server is run on <http://locahost:3000>.

You can access to URL by the order like the following.
1. <http://localhost:3000/?target_url=http://example.com&piping_url=https://piping.ml/mypath1>
1. <https://piping.ml/mypath1>.

