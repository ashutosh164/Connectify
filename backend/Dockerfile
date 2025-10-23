FROM python:3.11-slim

WORKDIR /app

# Install PostgreSQL client and build dependencies
RUN apt-get update && \
    apt-get install -y postgresql-client libpq-dev gcc python3-dev build-essential && \
    rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Make wait-for-postgres.sh executable
RUN chmod +x wait-for-postgres.sh

# Start Django after waiting for Postgres
CMD ["./wait-for-postgres.sh", "db", "python", "manage.py", "runserver", "0.0.0.0:8000"]
