FROM python:3.11-alpine

WORKDIR /opt/detector

COPY detector.py /opt/detector/detector.py

RUN pip install --no-cache-dir requests python-dotenv mysql-connector-python

ENV PYTHONUNBUFFERED=1

CMD ["python", "detector.py"]
