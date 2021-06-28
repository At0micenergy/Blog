---
title: GoldenEye
layout : post
date: 2021-04-18 16:44:00 +5:30 
tags: []
---
# nmap 
```
Starting Nmap 7.91 ( https://nmap.org ) at 2021-04-18 06:48 EDT
Nmap scan report for 10.0.2.53 (10.0.2.53)
Host is up (0.00014s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
25/tcp open  smtp    Postfix smtpd
|_smtp-commands: ubuntu, PIPELINING, SIZE 10240000, VRFY, ETRN, STARTTLS, ENHANCEDSTATUSCODES, 8BITMIME, DSN, 
|_ssl-date: TLS randomness does not represent time
80/tcp open  http    Apache httpd 2.4.7 ((Ubuntu))
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-title: GoldenEye Primary Admin Serve
55006/tcp open  ssl/unknown
| ssl-cert: Subject: commonName=localhost/organizationName=Dovecot mail server
| Not valid before: 2018-04-24T03:23:52
|_Not valid after:  2028-04-23T03:23:52
|_ssl-date: TLS randomness does not represent time
55007/tcp open  pop3        Dovecot pop3d
|_pop3-capabilities: CAPA STLS TOP RESP-CODES PIPELINING AUTH-RESP-CODE SASL(PLAIN) USER UIDL
|_ssl-date: TLS randomness does not represent time
MAC Address: 08:00:27:1D:24:9C (Oracle VirtualBox virtual NIC)
```
# Enumeration 

<h3>Gobuster</h3>

```
gobuster dir -u http://10.0.2.53/ -w /usr/share/dirb/wordlists/big.txt -s 200,301,302 -x html,txt,php
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.0.2.53/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/dirb/wordlists/big.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Extensions:              html,txt,php
[+] Timeout:                 10s
===============================================================
2021/04/18 06:52:40 Starting gobuster in directory enumeration mode
===============================================================
/.htaccess            (Status: 403) [Size: 285]
/.htaccess.html       (Status: 403) [Size: 290]
/.htaccess.txt        (Status: 403) [Size: 289]
/.htpasswd            (Status: 403) [Size: 285]
/.htaccess.php        (Status: 403) [Size: 289]
/.htpasswd.html       (Status: 403) [Size: 290]
/.htpasswd.txt        (Status: 403) [Size: 289]
/.htpasswd.php        (Status: 403) [Size: 289]
/index.html           (Status: 200) [Size: 252]
/server-status        (Status: 403) [Size: 289]
                                               
===============================================================
2021/04/18 06:52:56 Finished
===============================================================
```
no such intesting files

but default page incules /terminal.js file , when you inspect the code there is a conversation bwt team abt default password

***http://10.0.2.53/terminal.js***

```js
var data = [
  {
    GoldenEyeText: "<span><br/>Severnaya Auxiliary Control Station<br/>****TOP SECRET ACCESS****<br/>Accessing Server Identity<br/>Server Name:....................<br/>GOLDENEYE<br/><br/>User: UNKNOWN<br/><span>Naviagate to /sev-home/ to login</span>"
  }
];

//
//Boris, make sure you update your default password. 
//My sources say MI6 maybe planning to infiltrate. 
//Be on the lookout for any suspicious network traffic....
//
//I encoded you p@ssword below...
//
//&#73;&#110;&#118;&#105;&#110;&#99;&#105;&#98;&#108;&#101;&#72;&#97;&#99;&#107;&#51;&#114;
//
//BTW Natalya says she can break your codes
//

var allElements = document.getElementsByClassName("typeing");
for (var j = 0; j < allElements.length; j++) {
  var currentElementId = allElements[j].id;
  var currentElementIdContent = data[0][currentElementId];
  var element = document.getElementById(currentElementId);
  var devTypeText = currentElementIdContent;

 
  var i = 0, isTag, text;
  (function type() {
    text = devTypeText.slice(0, ++i);
    if (text === devTypeText) return;
    element.innerHTML = text + `<span class='blinker'>&#32;</span>`;
    var char = text.slice(-1);
    if (char === "<") isTag = true;
    if (char === ">") isTag = false;
    if (isTag) return type();
    setTimeout(type, 60);
  })();
}


```

Decoded on google search 

**&#73;&#110;&#118;&#105;&#110;&#99;&#105;&#98;&#108;&#101;&#72;&#97;&#99;&#107;&#51;&#114;:InvincibleHack3r**

# Exploitation 

# Privilage Esclation
