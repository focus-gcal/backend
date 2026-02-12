# Django Project – Local Setup
This guide explains how to set up a local development environment, install dependencies, and run the Django server.
---

## 🐍 Create Virtual Environment
From the project root, create a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```
## 📦 Install Dependencies
Install all required Python packages using the requirements.txt file:
```bash
pip install -r requirements.txt
```

## ▶️ Start the Development Server
Start the Django server:

```bash
python manage.py runserver
```

## 3️⃣ Start the Database Container

From the project root (where `docker-compose.yml` is located), run:

```bash
docker compose build
docker compose up
```

## 5️⃣ Run Django Migrations

Once the database is running:

```bash
python manage.py migrate
```

This creates Django tables inside PostgreSQL.