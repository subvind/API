
### deploy to railwap.app
To deploy a NestJS app to Railway.app, you can follow these steps:

Prepare Your NestJS App:
Ensure your NestJS app is fully functional and runs without any issues locally. Make sure you have a package.json file with all the required dependencies and scripts for starting the application.

Install Railway CLI:
Install the Railway CLI on your local machine. The CLI allows you to interact with your Railway.app account and deploy applications.

```bash
npm install -g railway
```
Log in to Railway.app:
Log in to your Railway.app account using the CLI. If you don't have an account, you can sign up for free on the Railway.app website.

```bash
railway login
```
Initialize Railway Project:
Navigate to your NestJS app's root directory and initialize your project with Railway. This creates the necessary files and configurations for deployment.

```bash
cd /path/to/your/nestjs/app
railway init
```
Set Environment Variables:
Configure the environment variables required by your NestJS app. You can set environment variables in the railway.env file or use the Railway CLI to set them.

```bash
railway secrets:set KEY=VALUE
```
Replace KEY with the name of the environment variable and VALUE with the corresponding value.

Deploy to Railway.app:
Use the Railway CLI to deploy your NestJS app to Railway.app. The CLI will handle the deployment process for you.
```bash
railway up
```
Access Your Deployed App:
After the deployment is successful, Railway.app will provide you with a unique URL where your NestJS app is hosted. You can use this URL to access your deployed application.

### deploy locally
installing rabbitmq...
https://www.rabbitmq.com/install-homebrew.html

start a node in the background...
```
$ brew services start rabbitmq
```

open url in browser...
```
username: guest
password: guest
http://localhost:15672
```

running app with .env variables
```
# Running in production mode
NODE_ENV=production node dist/main.js

# Running in development mode
NODE_ENV=development node dist/main.js
```

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
