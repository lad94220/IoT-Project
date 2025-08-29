FROM node:20-alpine

# Install Python and build dependencies required for native modules like canvas
RUN apk update && apk upgrade && apk add --no-cache \
    bash \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev \
    pkgconfig

# Set Python environment variable for node-gyp
ENV PYTHON=python3

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]