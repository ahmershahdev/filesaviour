# --- frontend build (client + SSR bundle) ---
FROM node:22-bookworm-slim AS web
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Django (web, worker and beat share this image) ---
FROM python:3.13-slim-bookworm
RUN useradd --create-home --uid 10001 app
WORKDIR /srv/backend
COPY backend/requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/prod.txt
COPY backend/ ./
COPY --from=web /frontend/dist /srv/frontend/dist
ENV DJANGO_SETTINGS_MODULE=config.settings.prod PYTHONUNBUFFERED=1
RUN SECRET_KEY=build-only python manage.py collectstatic --noinput \
 && SECRET_KEY=build-only python manage.py build_brand_assets
USER app
EXPOSE 8000
CMD ["gunicorn", "config.wsgi", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "60"]
