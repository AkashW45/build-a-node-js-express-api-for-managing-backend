# Notes API Service

A RESTful API for managing notes built with Express.js and PostgreSQL.

## Features
- Full CRUD operations (Create, Read, Update, Delete, List)
- Input validation
- PostgreSQL persistence via Sequelize ORM
- Docker support

## Prerequisites
- Node.js 20+
- PostgreSQL 16+ (or use Docker)

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and adjust values
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start PostgreSQL and create the database (if not using Docker)
5. Run database migrations (optional - sync is used in dev):
   ```bash
   npm run db:migrate
   ```
6. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

| Method | Path               | Description          |
|--------|--------------------|----------------------|
| GET    | /api/notes         | List all notes       |
| GET    | /api/notes/:id     | Get a single note    |
| POST   | /api/notes         | Create a new note    |
| PUT    | /api/notes/:id     | Update a note        |
| DELETE | /api/notes/:id     | Delete a note        |

Query parameters for `GET /api/notes`:
- `archived` (boolean) - filter by archived status

## Running with Docker

```bash
docker-compose up -d
```

## Environment Variables

See `.env.example`.
