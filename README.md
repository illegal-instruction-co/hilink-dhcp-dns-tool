# Router DHCP/DNS Auto-Fixer (HiLink)

Some Huawei HiLink routers (notably the B525s-23a) have a charming habit:  
they pretend to save your DNS settings and then quietly wipe everything on the next reboot.

While setting up a Pi-hole resolver at home, this behavior made the UI completely unusable.  
After looking at the browser traffic, it turned out the backend API *does* accept proper DNS and DHCP configuration — the WebUI simply never sends the correct request.

This project fills that gap.

It logs in, sends the correct XML payload, and keeps re-applying it in case the router resets it again.

---

## What this project does

- Retrieves a valid CSRF token from the router’s WebUI  
- Authenticates using the official HiLink login flow  
- Builds the same XML DHCP/DNS payload the WebUI is supposed to send  
- Submits the configuration using the router’s documented endpoints  
- Optionally runs as a systemd service to auto-repair DNS after every reboot  

This is **not** a hack or exploit.  
It is simply automating a request the router already expects.

---

## What this project does *not* do

- No authentication bypass  
- No CSRF bypass  
- No firmware patching  
- No unlocking or privilege escalation  
- No hidden or private API usage  
- No reverse-engineering of protected components  

It only calls endpoints that are already visible in any standard HiLink installation.

---

## Why this exists

Certain HiLink firmware builds display a DNS configuration screen that looks perfectly functional,  
yet ignore or discard the values silently.  
Others hide the DNS fields entirely.

Meanwhile, the backend API accepts well-formed XML with no objection.

By reproducing the request manually — and later automating it — the router finally behaves as expected.

If your DNS keeps resetting itself, this tool saves you from reconfiguring it by hand every time the router reboots.

---

## Legal and safety notes

Use this only on hardware you own and have permission to configure.  
This tool does not exploit, unlock, or tamper with the device — it only automates supported API calls.  
Incorrect DHCP settings can disrupt your network, so review all values before applying them.

---

## Summary

If your HiLink router loves to “forget” its DNS settings, this tool politely reminds it — repeatedly.  
No rooting, no flashing, no drama.
