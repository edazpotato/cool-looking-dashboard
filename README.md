# cool looking dashboard

It'll monitor servers, keep track of todos and notes, and have a web-based ssh terminal and be dockerised to its easily self-hostable.

## Running

Frontend is create-react-app so it's simple to run with npm scripts. Note that it uses **p**npm not npm, so if something messes up, try re-cloning and using pnpm instead of npm/yarn (`npm i -g pnpm`, then just use pnpm as you would npm).
The backend it less simple.

1. First install the latest version of **Python 3**.
2. Then install the dependencies like so

```bash
pip install -r requirements.txt
```

3. Then set up the database by running the `setup_database.py` script like so

```bash
py setup_database.py
```

4. Then run the script to start the server (don't run `server.py` directly).

```bash
# Windows
./run_server.bat

# Linux
chmod +x run_server.sh
./run_server.sh
```

## Licence

See LICENCE file.
