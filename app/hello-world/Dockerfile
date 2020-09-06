#
# Builder stage
# Compiles TS into JS and webpacks it all together
#
FROM node:12 AS builder

# Create directory to hold app code
WORKDIR /usr/app

COPY ./app/tsconfig.defaults.json .
COPY ./app/lib ./lib

WORKDIR /usr/app/build

COPY ./app/hello-world/package.json .
COPY ./app/hello-world/tsconfig.json .
COPY ./app/hello-world/webpack.config.js .
COPY ./app/hello-world/src ./src
RUN yarn global add webpack
RUN yarn install
RUN yarn run build

#
# Production stage
# Grabs code from the builder stage and sets it up to run
#
FROM node:12

# Control variables
ENV port=5000

# Copy files over
WORKDIR /app
COPY package.json .
COPY --from=builder /usr/app/build/dist ./dist

# Start the app
EXPOSE ${port}
CMD ["yarn", "start:prod"]