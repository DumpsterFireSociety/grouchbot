From node:10

WORKDIR /usr/src/grouchbot

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Install nodemon for automatic restarts on code changes
RUN npm install -g nodemon

# Write source and configuration files
COPY src/ ./src/
COPY config.js ./

ENTRYPOINT [ "nodemon", "./src/startup.js", "prod" ]
