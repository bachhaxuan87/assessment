# Description

This application is a web application based on NestJS.

**Features**
- A user can get online servers based on prioroty

# Documents

```bash
/documents/system_design_document.docx
/documents/system_design_document.pdf
```

# Project Structure

This project is based on Nest.js, a Node.js framework (https://nestjs.com/).
It contains 1 module:

```bash
-- src
    |-- servers
        |-- servers.controller.ts
        |-- servers.service.ts
        |-- servers.repository.ts
        |-- servers.controller.spec.ts
        |-- servers.service.spec.ts    
-- test
    |-- app.e2e-spec.ts
-- .env
-- documents
```

- The "servers" module is responsible for accepting requests from users
- The ".env" file contains app configuration: SERVER_CALL_TIMEOUT, BATCH_SIZE

- Note: The test folder is designated for end-to-end (e2e) tests only.

# Installation

```bash
$ npm install
```
## Running the app on local dev env
```bash
$ npm run start:dev
```

## Running the app on docker

### 1. Install Docker & Docker compose

### 2. Start docker

```bash
$ docker-compose up
```

# Swagger

```bash
http://localhost:3000/docs
```

# How to use

### 1. Get all online servers
```bash
curl --location 'http://localhost:3000/api/v1/servers' \
--header 'accept: */*'
```

### 2. Get online servers by priority

```bash
curl --location 'http://localhost:3000/api/v1/servers?priority=4' \
--head

# Unit Testing

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov

# e2e test
$ npm run test:e2e

```

# Lint

```bash
$ npm run lint
```

# Formating

```bash
$ npm run format
```