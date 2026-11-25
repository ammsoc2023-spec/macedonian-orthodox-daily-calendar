# Macedonian Orthodox Daily Calendar™

Developed by ZB · Copyright © 2026 ZB

Static PWA of the Macedonian Orthodox Church daily calendar for 2026 (English / Macedonian): saints and feasts,
fasting, daily Scripture readings with intros and commentary, prayers, read-aloud, Bible / Biblija tabs. Works offline.

Live site: https://ammsoc2023-spec.github.io/macedonian-orthodox-daily-calendar/

English Scripture: The Orthodox Study Bible, used by permission.
The Orthodox Study Bible Copyright © 2008 by St. Athanasius Academy of Orthodox Theology. Used by permission.
New King James Version® Copyright © 1982 by Thomas Nelson. Used by permission. All rights reserved.
Macedonian Scripture: m-p-c.org Bible. Calendar: mpc.org.mk and the official MPC calendar app „Православен календар“.

## Updates
The app updates itself: every deploy changes `sw.js`/`version.json`, and the open or home-screen app picks the new
version up on its next start or return to the foreground (it waits if read-aloud is playing). Deploy = rebuild
`sw.js` + `version.json` with `modc_mksw.py` (bumps the cache name automatically), then push to `main`.
