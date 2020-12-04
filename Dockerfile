FROM quay.io/cdis/ubuntu:18.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    vim \
    git-all \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y --no-install-recommends nodejs

# The base node image sets a very verbose log level.
ENV NPM_CONFIG_LOGLEVEL info

# Copy all local files into the image.
RUN mkdir -p /igv
COPY . /igv
WORKDIR /igv

# Build for production.
RUN npm install \
    && npm run build

# Set the command to start the node server.
CMD [ "npm", "start" ]

# Tell Docker about the port we'll run on.
EXPOSE 3000
