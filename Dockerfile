FROM node:15.1.0-alpine

LABEL maintainer="Ryo Ota <nwtgck@gmail.com>"

RUN apk add --no-cache tini

COPY . /app

# Install requirements, build and remove devDependencies
# (from: https://stackoverflow.com/a/25571391/2885946)
RUN cd /app && \
    npm ci && \
    npm run build && \
    npm prune --production

# Run a server
ENTRYPOINT [ "tini", "--", "node", "/app/src/index.js" ]
