FROM python:3.10
##FROM python:3.9-alpine
EXPOSE 80

# This weird ordering of commands is to make some magical caching work so that image builds are speedier 
WORKDIR /usr/src/cool-looking-dashboard
RUN apt-get update -y && apt-get install nodejs npm sqlite3 -y
##RUN apk add --update nodejs npm sqlite3

WORKDIR /usr/src/cool-looking-dashboard/server
COPY ./server/requirements.txt /usr/src/cool-looking-dashboard/server/requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

WORKDIR /usr/src/cool-looking-dashboard
COPY . .

WORKDIR /usr/src/cool-looking-dashboard/pwa
COPY ./pwa/package.json /usr/src/cool-looking-dashboard/pwa/package.json
COPY ./pwa/pnpm-lock.yaml /usr/src/cool-looking-dashboard/pwa/pnpm-lock.yaml
RUN npm i -g pnpm && pnpm i
RUN pnpm run build

WORKDIR /usr/src/cool-looking-dashboard/server
RUN python3 setup_database.py
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "80"]