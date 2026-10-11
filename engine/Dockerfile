# Processing engine: converters for untrusted files. Runs as non-root with a
# read-only root filesystem (see docker-compose.yml); only /tmp is writable.
FROM python:3.13-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
      ghostscript qpdf gifsicle \
      libreoffice-writer-nogui libreoffice-calc-nogui libreoffice-impress-nogui \
      ocrmypdf tesseract-ocr tesseract-ocr-eng \
      fonts-dejavu fonts-liberation fonts-noto-core \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --uid 10001 engine
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

USER engine
ENV PYTHONUNBUFFERED=1 ENGINE_TMP=/tmp U2NET_HOME=/home/engine/.u2net
EXPOSE 8100
# 2 workers x 1 thread: converters are CPU/memory heavy; scale with replicas, not threads.
CMD ["gunicorn", "--bind", "0.0.0.0:8100", "--workers", "2", "--timeout", "300", "app:create_app()"]
