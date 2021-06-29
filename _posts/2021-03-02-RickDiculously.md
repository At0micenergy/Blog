---
layout : post
title: Rickdiculously
image : Rickdiculously.png
date: 2021-03-02 04:43 EST
categories: [vulnhub , CTF]
tags: [SSH BruteForce]
---

# Nmap

```
21/tcp    open  ftp     vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| -rw-r--r--    1 0        0              42 Aug 22  2017 FLAG.txt
|_drwxr-xr-x    2 0        0               6 Feb 12  2017 pub
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:10.0.2.36
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 3
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp    open  ssh?
| fingerprint-strings: 
|   NULL: 
|_    Welcome to Ubuntu 14.04.5 LTS (GNU/Linux 4.4.0-31-generic x86_64)
80/tcp    open  http    Apache httpd 2.4.27 ((Fedora))
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.27 (Fedora)
|_http-title: Morty's Website
9090/tcp  open  http    Cockpit web service 161 or earlier
|_http-title: Did not follow redirect to https://10.0.2.15:9090/
13337/tcp open  unknown
| fingerprint-strings: 
|   NULL: 
|_    FLAG:{TheyFoundMyBackDoorMorty}-10Points
22222/tcp open  ssh     OpenSSH 7.5 (protocol 2.0)
| ssh-hostkey: 
|   2048 b4:11:56:7f:c0:36:96:7c:d0:99:dd:53:95:22:97:4f (RSA)
|   256 20:67:ed:d9:39:88:f9:ed:0d:af:8c:8e:8a:45:6e:0e (ECDSA)
|_  256 a6:84:fa:0f:df:e0:dc:e2:9a:2d:e7:13:3c:e7:50:a9 (ED25519)
60000/tcp open  unknown
|_drda-info: ERROR
| fingerprint-strings: 
|   NULL, ibm-db2: 
|_    Welcome to Ricks half baked reverse shell...
3 services unrecognized despite returning data. If you know the service/version, please submit the following fingerprints at https://nmap.org/cgi-bin/submit.cgi?new-service :
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port22-TCP:V=7.91%I=7%D=4/9%Time=606FDC22%P=x86_64-pc-linux-gnu%r(NULL,
SF:42,"Welcome\x20to\x20Ubuntu\x2014\.04\.5\x20LTS\x20\(GNU/Linux\x204\.4\
SF:.0-31-generic\x20x86_64\)\n");
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port13337-TCP:V=7.91%I=7%D=4/9%Time=606FDC22%P=x86_64-pc-linux-gnu%r(NU
SF:LL,29,"FLAG:{TheyFoundMyBackDoorMorty}-10Points\n");
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port60000-TCP:V=7.91%I=7%D=4/9%Time=606FDC28%P=x86_64-pc-linux-gnu%r(NU
SF:LL,2F,"Welcome\x20to\x20Ricks\x20half\x20baked\x20reverse\x20shell\.\.\
SF:.\n#\x20")%r(ibm-db2,2F,"Welcome\x20to\x20Ricks\x20half\x20baked\x20rev
SF:erse\x20shell\.\.\.\n#\x20");
MAC Address: 08:00:27:DC:ED:ED (Oracle VirtualBox virtual NIC)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 27.43 seconds
```
# Enumeration 
/passwords/password.html user commented out the password 

![]({{site.baseurl}}/img/vulnhub/Rickduculously/idk.png)

# Enumeration 


bruTe force the users with ssh

```
hydra -T 200 -L users.txt -P pass.txt -vV ssh://10.0.2.15:22222
```
dont forword files , likE FILES CONTINING dATA INSIDE A FILE

![]({{site.baseurl}}/img/vulnhub/Rickduculously/lfi.png)

# privilageEsclation 

![]({{site.baseurl}}/img/vulnhub/Rickduculously/gtfobinsudo.png)

