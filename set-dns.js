// Extract CSRF token from the router's UI
const realToken = document.querySelector('meta[name="csrf_token"]')?.content;

if (!realToken) {
    throw new Error("csrf_token meta tag not found in the router UI.");
}

console.log("Using token:", realToken);

// DHCP XML payload (edit DNS values before running)
const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<request>' +
        '<DnsStatus>1</DnsStatus>' +
        '<DhcpStartIPAddress>192.168.1.100</DhcpStartIPAddress>' +
        '<DhcpIPAddress>192.168.1.1</DhcpIPAddress>' +
        '<accessipaddress></accessipaddress>' +
        '<homeurl>homerouter.cpe</homeurl>' +
        '<DhcpStatus>1</DhcpStatus>' +
        '<DhcpLanNetmask>255.255.255.0</DhcpLanNetmask>' +
        '<SecondaryDns>1.1.1.1</SecondaryDns>' +
        '<PrimaryDns>192.168.1.224</PrimaryDns>' +
        '<DhcpEndIPAddress>192.168.1.254</DhcpEndIPAddress>' +
        '<DhcpLeaseTime>86400</DhcpLeaseTime>' +
    '</request>';

// Send request using the same headers the official UI uses
fetch("http://192.168.1.1/api/dhcp/settings", {
    method: "POST",
    credentials: "include",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8;",
        "Accept": "*/*",
        "_ResponseSource": "Broswer",
        "__RequestVerificationToken": realToken,
        "X-Requested-With": "XMLHttpRequest"
    },
    body: xml
})
    .then(r => r.text())
    .then(t => {
        console.log("RESPONSE:", t);
    })
    .catch(err => {
        console.error("Request failed:", err);
    });
