# LMS NestJS

This repository is a small learning-management-style API built with NestJS, MongoDB (Mongoose) and JWT authentication. It includes basic user registration and login with password hashing, JWT provisioning and cookie support.

**Quick overview**

- Language: TypeScript
- Framework: NestJS
- Database: MongoDB (Mongoose)
- Auth: JWT (token returned and set as `jwt` cookie)

**Project structure (important files)**

- `src/main.ts` - application bootstrap (uses `ValidationPipe`).
- `src/app.module.ts` - registers `MongooseModule` and `ConfigModule`.
- `src/auth` - authentication controller, service and DTOs (`register`, `login`).
- `src/user` - user model, schema and service.

**Prerequisites**

- Node.js 18+ and npm
- Docker (optional) to run MongoDB via the provided `compose.yaml`, or a running MongoDB instance and a `MONGO_URI` connection string.

**Environment variables**
Create a `.env` file at the project root or supply environment variables via your environment. The app uses `ConfigModule` and expects the following (minimum):

- `MONGO_URI` – MongoDB connection string, e.g. `mongodb://localhost:27017/lms`
- `PORT` – optional, defaults to `3000` if not set
- `NODE_ENV` – `development` or `production` (affects cookie `secure` flag)
- `JWT_EXPIRES_IN` – optional expiry in seconds for the JWT token (the project also contains a default secret in `src/auth/constant.ts` but you should replace it for production)

Important: the project currently stores a default JWT secret in `src/auth/constant.ts` like:

```ts
export const jwtConstants = { secret: "your_jwt_secret_key" };
```

Replace this with a secure secret for production or refactor to inject via `ConfigService`.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Run MongoDB (recommended using Docker Compose):

```powershell
# from project root (Windows PowerShell)
docker compose up -d
```

3. Set environment variables (example `.env`):

```
MONGO_URI=mongodb://localhost:27017/lms
PORT=3000
NODE_ENV=development
JWT_EXPIRES_IN=3600
```

4. Start the app in development mode:

```powershell
npm run start:dev
```

The server will listen on `http://localhost:3000` by default (or the `PORT` you set).

## Available npm scripts

- `npm run start` - start production build
- `npm run start:dev` - start in watch/dev mode
- `npm run build` - compile TypeScript
- `npm run format` - run Prettier formatting
- `npm run lint` - run ESLint autofix
- `npm run test` - run unit tests

## API — Auth

Base path: `/auth`

- `POST /auth/register` — Register a new user.
  - Body (JSON):
    ```json
    {
      "username": "bob",
      "email": "bob@example.com",
      "password": "secret1",
      "role": "STUDENT"
    }
    ```
  - Response: `{ user: { _id, username, email, role }, access_token }`
  - A cookie named `jwt` (HTTP-only) is set on the response.

- `POST /auth/login` — Login with username/email + password.
  - Body (JSON):
    ```json
    {
      "identifier": "bob", // or bob@example.com
      "password": "secret1"
    }
    ```
  - Response: `{ user: { _id, username, email, role }, access_token }`
  - A cookie named `jwt` (HTTP-only) is set on the response.

Notes:

- Passwords are hashed with `bcrypt` before being stored.
- JWT payload includes `{ sub: user._id, username, role }` and is signed with the secret in `src/auth/constant.ts` (change for production).

## Development tips / recommendations

- Replace the hard-coded JWT secret with `ConfigService` and an environment variable for production safety.
- Add a logout endpoint that clears the `jwt` cookie.
- Add route guards (`@UseGuards(AuthGuard('jwt'))`) and a Passport JWT strategy for protecting endpoints.
- Add unit/e2e tests for auth flows (the repo already includes a test setup and `jest` config).

## Troubleshooting

- If the app cannot connect to MongoDB, verify `MONGO_URI` and that the Mongo container is running (use `docker ps` or `docker compose ps`).
- If validation errors occur on register/login, make sure request bodies match DTOs and that `class-validator`/`class-transformer` are installed (they are included in `package.json`).

## Contributing

- Fork, create a branch, write tests, open a PR — follow the coding style used across the project.
