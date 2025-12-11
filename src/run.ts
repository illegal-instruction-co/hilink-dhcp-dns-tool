import fetch from 'node-fetch';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const ROUTER = process.env.ROUTER_URL || "http://192.168.1.1";
const USER = process.env.ROUTER_USER as string;
const PASS = process.env.ROUTER_PASS as string;

if (!USER) {
    console.error("[ERROR] ROUTER_USER environment variable not set");
    process.exit(1);
}

if (!PASS) {
    console.error("[ERROR] ROUTER_PASS environment variable not set");
    process.exit(1);
}

console.log("[INFO] Using router URL:", ROUTER);

let csrfToken: string = "";
let sessionCookie: string = "";

function sha256(input: string): string {
    return crypto.createHash("sha256")
        .update(input)
        .digest("hex");
}

function encodePassword(username: string, password: string, token: string): string {
    const passwordHash = sha256(password);
    const passwordBase64 = Buffer.from(passwordHash, 'utf-8').toString('base64');
    
    const combined = username + passwordBase64 + token;
    const combinedHash = sha256(combined);
    
    return Buffer.from(combinedHash, 'utf-8').toString('base64');
}

async function initSession(): Promise<void> {
    const res = await fetch(`${ROUTER}/html/index.html`);
    const html = await res.text();

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
        sessionCookie = setCookie.split(';')[0];
    }

    const tokenMatch = html.match(/<meta name="csrf_token" content="([^"]+)">/);    
    if (!tokenMatch || !tokenMatch[1]) {
        console.error("[ERROR] Failed to extract CSRF token from HTML");
        throw new Error("CSRF token not found");
    }

    csrfToken = tokenMatch[1];
    console.log("[INFO] Session initialized, token:", csrfToken.substring(0, 10) + "...");
}

async function login(): Promise<void> {
    console.log("[INFO] Authenticating...");

    const passwordEncoded = encodePassword(USER, PASS, csrfToken);
    const loginBody = `<?xml version="1.0" encoding="UTF-8"?><request><Username>${USER}</Username><Password>${passwordEncoded}</Password><password_type>4</password_type></request>`;

    const headers: Record<string, string> = {
        "Content-Type": "application/xml",
        "__RequestVerificationToken": csrfToken
    };
    
    if (sessionCookie) {
        headers["Cookie"] = sessionCookie;
    }

    const res = await fetch(`${ROUTER}/api/user/login`, {
        method: "POST",
        headers,
        body: loginBody
    });

    const text = await res.text();
    
    if (text.includes("<error>")) {
        console.error("[ERROR] Login failed:", text);
        throw new Error("Authentication failed");
    }

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
        sessionCookie = setCookie.split(';')[0];
    }

    const newToken = res.headers.get("__requestverificationtokenone") || 
                     res.headers.get("__requestverificationtoken");
    
    if (newToken) {
        csrfToken = newToken;
    }

    console.log("[INFO] Login successful, new token:", csrfToken.substring(0, 10) + "...");
}

async function updateDhcp(): Promise<void> {
    const xml = `<?xml version="1.0" encoding="UTF-8"?><request><DnsStatus>1</DnsStatus><DhcpStartIPAddress>192.168.1.100</DhcpStartIPAddress><DhcpIPAddress>192.168.1.1</DhcpIPAddress><accessipaddress></accessipaddress><homeurl>homerouter.cpe</homeurl><DhcpStatus>1</DhcpStatus><DhcpLanNetmask>255.255.255.0</DhcpLanNetmask><SecondaryDns>1.1.1.1</SecondaryDns><PrimaryDns>192.168.1.224</PrimaryDns><DhcpEndIPAddress>192.168.1.254</DhcpEndIPAddress><DhcpLeaseTime>86400</DhcpLeaseTime></request>`;

    const headers: Record<string, string> = {
        "Content-Type": "application/xml",
        "__RequestVerificationToken": csrfToken
    };
    
    if (sessionCookie) {
        headers["Cookie"] = sessionCookie;
    }

    const res = await fetch(`${ROUTER}/api/dhcp/settings`, {
        method: "POST",
        headers,
        body: xml
    });

    const text = await res.text();
    
    if (text.includes("<error>")) {
        console.error("[ERROR] DHCP update failed:", text);
        throw new Error("DHCP configuration failed");
    }
    
    console.log("[INFO] DHCP settings updated successfully");
}

async function main(): Promise<void> {
    try {
        console.log("[INFO] Starting DHCP update...");
        await initSession();
        await login();
        await updateDhcp();
        console.log("[INFO] Operation completed successfully");
    } catch (err) {
        console.error("[ERROR] Operation failed:", err);
    }
}

main();
setInterval(main, 5 * 60 * 1000);
