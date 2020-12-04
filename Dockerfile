FROM quay.io/cdis/ubuntu:18.04

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -

# The base node image sets a very verbose log level.
ENV NPM_CONFIG_LOGLEVEL info

# Copy all local files into the image.
COPY . .

# Build for production.
RUN npm install \
    && npm run build

# Set the command to start the node server.
CMD [ "npm", "start" ]

# Tell Docker about the port we'll run on.
EXPOSE 3000
