# mockhang — common dev commands. Run `just` to list them.

port    := "5174"
session := "mockhang"

# list available recipes
default:
    @just --list

# start the hot-reloading dev server in a detached tmux session
# (falls back to a plain background process if tmux isn't installed)
dev:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v tmux >/dev/null 2>&1; then
      echo "tmux not found — starting a plain background process instead."
      echo "For the managed session install tmux (e.g. 'brew install tmux'), then re-run 'just dev'."
      just dev-bg
      exit 0
    fi
    tmux kill-session -t {{session}} 2>/dev/null || true
    tmux new-session -d -s {{session}} "PORT={{port}} node dev-server.js"
    sleep 0.4
    echo "mockhang running in tmux session '{{session}}' → http://localhost:{{port}}"
    echo "  attach: just attach   logs: just logs   stop: just stop"

# start the dev server as a plain background process (no tmux)
dev-bg:
    #!/usr/bin/env bash
    set -euo pipefail
    pkill -f "node dev-server.js" 2>/dev/null || true
    PORT={{port}} nohup node dev-server.js > .devserver.log 2>&1 &
    sleep 0.4
    echo "mockhang running → http://localhost:{{port}}  (logs: just logs)"

# run the dev server in the foreground (Ctrl-C to stop)
serve:
    PORT={{port}} node dev-server.js

# attach to the tmux dev session
attach:
    tmux attach -t {{session}}

# show recent dev-server output (tmux pane or background log)
logs:
    #!/usr/bin/env bash
    if command -v tmux >/dev/null 2>&1 && tmux has-session -t {{session}} 2>/dev/null; then
      tmux capture-pane -pt {{session}}
    else
      tail -n 40 .devserver.log 2>/dev/null || echo "no dev server running"
    fi

# stop the dev server (tmux session and/or background process)
stop:
    -tmux kill-session -t {{session}} 2>/dev/null
    -pkill -f "node dev-server.js" 2>/dev/null
    @echo "stopped"

# syntax-check support.js and the embedded component script
check:
    #!/usr/bin/env bash
    set -euo pipefail
    node --check support.js
    awk '/<script type="text\/x-dc"/{f=1;next} /<\/script>/{if(f)exit} f{print}' index.html > /tmp/ap-comp.js
    node --check /tmp/ap-comp.js
    echo "syntax OK"

# re-download the vendored React UMD builds
vendor:
    curl -sSL -o vendor/react.production.min.js https://unpkg.com/react@18.3.1/umd/react.production.min.js
    curl -sSL -o vendor/react-dom.production.min.js https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js
    @echo "re-vendored React"
