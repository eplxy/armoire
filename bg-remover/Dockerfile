# Use a specific, stable python version
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for opencv
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install python libraries
RUN pip install --no-cache-dir "rembg[cpu]" flask

COPY main.py .

EXPOSE 5000

CMD ["python", "main.py"]