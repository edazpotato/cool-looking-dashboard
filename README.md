# cool looking dashboard

It'll monitor servers, keep track of todos and notes, and have a web-based ssh terminal and be dockerised to its easily self-hostable.

## Deployment

There are two ways to deploy this app. You can use docker, or run it on a normal server. Both will start the app on port 80. For SSL, just stick it behind Cloudflare.

### Running it with docker

#### Building the image yourself

1. Install Docker.
2. Build the image: `docker build -t cl-dash .`. (This can take a very long time.)
3. Create a docker volume to store the SQLite database in: `docker volume create cl-dash-db`.
4. Run the image: `docker run --name cl-dash-instance -dp 80:80 --mount source=cl-dash-db,target=/usr/src/cool-looking-dashboard/server/db cl-dash`.

#### Using a pre-built image

I'll try and remember to publish pre-built images to the [dockerhub page](https://hub.docker.com/repository/docker/edaz/cl-dash) but I'll probably forget sometimes, so I highly recommend building it yourself.

> Note that these examples use `0.1.0` as the version. This won't be kept up-to-date, so make sure to use the latest version on the [dockerhub page](https://hub.docker.com/repository/docker/edaz/cl-dash).

1. Install Docker.
2. Pull the image: `docker image pull edaz/cl-dash:0.1.0`.
3. Create a docker volume to store the SQLite database in: `docker volume create cl-dash-db`.
4. Run the image: `docker run --name cl-dash-instance -dp 80:80 --mount source=cl-dash-db,target=/usr/src/cool-looking-dashboard/server/db cl-dash:0.1.0`.

### Running it on a normal server server

1. Install the latest build of NodeJS 16.
2. Install dependencies for building the PWA.

```bash
cd pwa
npm i -g pnpm
pnpm i
```

3. Build the PWA.

```bash
pnpm run build
```

4. Install the latest release of Python 3 and add it to your path. These examples use the `py` command, but you may need to use `python` or `python3` instead.
5. Install the dependencies for running the server.

```bash
cd ..
cd server
pip install -r requirements.txt
```

6. Set up the database by running the `setup_database.py` script.

```bash
py setup_database.py
```

7. Run the script to start the server (don't run `server.py` directly).

```bash
# Windows
./run_server.bat

# Linux
chmod +x run_server.sh
./run_server.sh

# Mac
```

<!-- ^ lol -->

8. Done. The server will be running on port 80!

## Licence

See LICENCE file.

> Note to self: To build, use `docker build -t edaz/cl-dash:0.1.0 .`
