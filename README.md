# Router DNS Setter (HiLink-compatible)

A minimalist helper script that reproduces the exact XML request used by certain HiLink-based router web interfaces to set DNS values.  
Some models expose a DNS configuration screen that *appears* functional but silently refuses to save any changes.  
While setting up a home DNS resolver on a Raspberry Pi, this behavior made configuration impossible through the UI.  
After inspecting the browser traffic, it became clear that the backend API fully accepted the request — the UI simply wasn’t submitting it correctly.

This tool provides a clean and reliable way to trigger the same request manually, without modifying firmware or using unsupported methods.

---

## What this project **does**

- Extracts the CSRF token from the existing router UI  
- Builds the same XML payload the UI is supposed to send  
- Sends the request with the same headers the UI uses  
- Applies DNS changes immediately when authenticated  

The script interacts only with documented/visible API endpoints.  
There is no exploit or bypass involved.

---

## What this project **does *not*** do

- X No authentication bypass  
- X No CSRF bypass  
- X No firmware patching or unlocking  
- X No hidden API usage  
- X No reverse-engineering of protected components  

It simply exposes a working request that the UI itself already relies on.

---

## Why this exists

During a home-lab setup, the router’s built-in DNS page refused to accept custom DNS values — even though the backend endpoint itself worked perfectly.  
Capturing the traffic and sending the same request manually solved the problem instantly.

This repository documents that behavior so others in similar situations can fix their setups without guesswork.

---

## Disclaimer

Use this only on hardware you own and have authorized access to.  
The author is not responsible for misconfiguration or improper use.