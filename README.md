#live demo link

https://uzhavar-greens.netlify.app
https://uzhavar-greens-0bvx.onrender.com

# Uzhavar Greens

A full-stack marketplace application split into a React frontend and a FastAPI backend.

## Project structure

- `client/` - React frontend built with Vite
- `server/` - FastAPI backend with SQLAlchemy and Alembic migrations
- `render.yaml` - deployment configuration
- `setup.ps1` - Windows setup script
- `venv/` - local Python virtual environment

## Frontend

The frontend lives in `client/`.

### Install

```powershell
cd client
npm install
```

### Run locally

```powershell
npm run dev
```

### Build

```powershell
npm run build
```

## Backend

The backend lives in `server/`.

### Create / activate virtual environment

```powershell
cd server
python -m venv env
.\env\Scripts\Activate.ps1
```

### Install dependencies

```powershell
pip install -r requirements.txt
```

### Run locally

```powershell
uvicorn app.main:app --reload
```

## Environment

The repository includes:

- `server/.env.example` - example backend environment variables
- `client/.env` / `client/.env.example` - frontend environment variables if used

Copy example files and update values before running the app.

## Notes

- The backend uses FastAPI, SQLAlchemy, Alembic, and PostgreSQL drivers.
- The frontend uses React, Vite, Axios, and React Router.
- If you want to reset migrations or database state, review the `server/alembic/` folder.
