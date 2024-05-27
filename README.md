# Library Management System API

![Library](https://res.cloudinary.com/dsrw0xhxw/image/upload/v1716832922/Images/fynuy3jlroet2bteobfe.png)

## Introduction

This is a robust Library Management System API built with modern technologies including [Bun](https://bun.sh/), [Express](https://expressjs.com/), [PostgreSQL](https://www.postgresql.org/), [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm), [Redis](https://redis.io/), and [TypeScript](https://www.typescriptlang.org/). It provides a comprehensive backend infrastructure for managing various aspects of a library system.

## Features

- **Runtime**: Utilizes [Bun](https://bun.sh/) as the runtime environment for faster execution and efficient performance.
- **Authentication**: Implements JWT-based authentication with AccessToken and RefreshToken to secure user sessions.
- **Data Validation**: Ensures data integrity and security through validation with [joi](https://joi.dev/).
- **Book Management**: Enables CRUD operations for books and provides search and filtering functionalities.
- **User Management**: Manages user profiles and roles with various functionalities for admins.
- **Caching and Session Management**: Uses Redis for caching and managing sessions to improve performance and scalability.
- **Database Management**: Utilizes Drizzle ORM for interacting with PostgreSQL, providing a type-safe and efficient database layer.

## Description

This Library Management System API is designed to be scalable and feature-rich, leveraging TypeScript for type safety and expressiveness, PostgreSQL for reliable and robust data storage, and Redis for caching and session management. Drizzle ORM simplifies database interactions, making it easier to maintain and extend the system.

## Installation

### Install Dependencies

```shell
npm install -g bun
bun install # install project dependencies
```

### Setup .env file
Create a .env file in the root directory of your project and add the following environment variables:
``` shell
PORT
DATABASE_URL
REDIS_URL
NODE_ENV
ACTIVATION_TOKEN
ACTIVATION_EMAIL_TOKEN
ACCESS_TOKEN
REFRESH_TOKEN
ACCESS_TOKEN_EXPIRE
REFRESH_TOKEN_EXPIRE
SMTP_HOST
SMTP_PORT
SMTP_SERVICE
SMTP_MAIL
SMTP_PASSWORD
ORIGIN
```

### Start the app
```shell
bun run dev # Run in development mode with --watch
bun run db:generate # Generate database schema with Drizzle
bun run db:migrate # Apply database migrations with Drizzle
bun run db:studio # Open Drizzle Studio for database management
```

<i>Written by Ashkan.</i>