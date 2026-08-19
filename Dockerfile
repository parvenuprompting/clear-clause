# Gebruik een officiële Python runtime als parent image
FROM python:3.10-slim

# Zet de werkdirectory in de container
WORKDIR /app

# Installeer systeem dependencies (curl voor healthchecks)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Kopieer requirements.txt en installeer dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Maak een non-root user aan voor veiligheid
RUN useradd -m appuser
USER appuser

# Kopieer de rest van de applicatie code
COPY . .

# Exposeer poort 8000
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:8000/health || exit 1

# Start de applicatie
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
