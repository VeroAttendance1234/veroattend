# Running the backend unattended

The Pi backend is meant to survive reboots, power blips and dropped SSH
sessions without anyone logging in to restart it. That is what
`veroattend.service` is for.

## Install

Adjust the paths in `veroattend.service` first if the repo is not at
`/home/vero/veroattend`.

```
sudo apt install -y pcscd pcsc-tools libpcsclite-dev
python3 -m venv venv
./venv/bin/pip install -r requirements.txt

sudo cp veroattend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now veroattend
```

`enable` is the part that makes it come back after a reboot. `--now` starts it
immediately so you do not have to reboot to test.

## Checking it

```
systemctl status veroattend
journalctl -u veroattend -f
```

A tap should appear in the journal as `[app] Tap logged: ...`. If the reader is
absent you will see `[rfid_reader] Waiting for ACR122U reader...` on a loop,
which is the intended behaviour, not a fault: the web app stays up and reports
the reader as offline.

## Cap the logs

The service logs to journald, which rotates on its own, but the default cap is
a percentage of the disk and that is generous for an SD card. Pin it:

```
sudo mkdir -p /etc/systemd/journald.conf.d
printf '[Journal]\nSystemMaxUse=200M\n' | sudo tee /etc/systemd/journald.conf.d/veroattend.conf
sudo systemctl restart systemd-journald
```

## Database

SQLite runs in WAL mode (set in `database.py`), so `data/` will hold
`attendance.db` plus `attendance.db-wal` and `attendance.db-shm` while the
service is running. That is normal. Copy all three, or stop the service first,
if you ever move the database somewhere else.

# Viewing it on a phone

The phone does not talk to the Pi directly. It loads the site from the laptop's
dev server, which relays through to the Pi over the TCP bridge in
`vite.config.js` - the same path the laptop's own browser uses. So all three
devices need to be on the same Wi-Fi, and the laptop needs `npm run dev`
running.

Start the dev server and it now prints two URLs:

```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.0.5:3000/
```

Type the **Network** one into the phone. The address changes whenever the
router hands out a new lease, so check the banner rather than memorising it.
The laptop's Bonjour name (`something.local:3000`) works too and is stable
across leases.

Both devices hold their own copy of the dashboard state, but a real card tap is
broadcast to every connected client at once, so a tap on the reader lands on the
laptop and the phone together. The random demo simulator switches itself off on
each device as soon as the reader is genuinely live, which is what stops the two
screens drifting apart during a demo.

If the phone loads the page but the status pill never goes green, the phone
reached the laptop and the laptop cannot reach the Pi. Check the dev server's
console for `[pi-bridge]` lines.

# Enrolling a card

`on_card_tap()` resolves whatever the reader saw against the `students` table
in `database.py`. A UID that is not in that table is logged as
`[app] Unknown card: <UID>` and nothing reaches the browser, so a card is only
"real" once its UID is listed there.

The UIDs in `STUDENTS` must stay identical to the `uid` values stamped onto the
roster in `src/data/sampleData.js`. They drifted apart once already: the table
held invented placeholders while the frontend held the genuine card UIDs, which
meant every physical tap came back unknown.

To read a card's UID, tap it with the service running and watch the log:

```
journalctl -u veroattend -f
```

An unrecognised card prints its UID. Add that UID to `STUDENTS`, restart the
service, and it will resolve from then on. `init_db()` upserts, so editing an
existing row updates the running database rather than being ignored.
