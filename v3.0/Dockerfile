FROM node:10.11.0-alpine

# Metadata as defined in OCI image spec annotations - https://github.com/opencontainers/image-spec/blob/master/annotations.md
LABEL org.opencontainers.image.title="Minecraft metrics app" \
      org.opencontainers.image.description="The app component will publish the metrics for Prometheus to pick up." \
      org.opencontainers.image.authors="Microsoft & Manu@Theta.co.nz"

# curl for debugging
RUN apk --no-cache add curl 

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 8080
CMD [ "npm", "start" ]