
FROM python:3.12-slim

WORKDIR /app

ENV POETRY_VIRTUALENVS_CREATE=false
ENV POETRY_VIRTUALENVS_IN_PROJECT=false

RUN pip install --no-cache-dir poetry &&     python -m poetry self add poetry-plugin-export

COPY pyproject.toml ./
RUN python -m poetry export -f requirements.txt --output requirements.txt --without-hashes &&     pip install --no-cache-dir -r requirements.txt


COPY . .

CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
