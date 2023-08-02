FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY src ./src

RUN npm install
RUN npm run build

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]