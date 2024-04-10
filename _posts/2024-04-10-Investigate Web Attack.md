---
layout : post
title: Investigate Web Attack Writeup
image : Investigate Web Attack.png
date: 2024-04-10 10:18 +0530
tags: [OWASP ,SIEM , Incident Response , Splunk ] 
---

In this walkthrough, we will delve into investigating web application logs using Splunk. We'll explore a scenario where an attacker successfully compromised the system through web application hacking techniques. They achieved this by executing a code injection attack, manipulating the URL parameters. Additionally, the application exhibited numerous vulnerabilities, including file inclusion, Cross-Site Scripting (XSS), and successful privilege escalation, wherein the attacker added a remote user for persistence.  

[Here is the link to the Incident ](https://app.letsdefend.io/challenge/investigate-web-attack)

## Configuration

The Network team , were able to provide the logdata from the incident , we need to ingiest the log file for SIEM tool for better triaging 

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/Input data.png)

Navigating to setting and importing the log file , along with setting up , index , source , host & sourcetype 

Its always important to set the write source while parching the data into splunk , because it will catograize the data depends on source data using inbuilt data parsing plugins

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/sourcing.png)

Previwing the dataset !

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/review.png)

Verfiying the Evenets by index & host 

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/Total Events.png)

## Indetification 

### Q1.Which automated scan tool did attacker use for web reconnaissance? 

when its come to web application , each client has their own header & body when they are sending the data to the application for example Request method , user agent , cookie value and the host etc , so when ever an attacker send a malicous packet by using tool , in the useragent , it will represent the tool name 

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/Input data.png)

so by this reference lets traiage the incident , when we look at intresting fields there is field called Useragent if we check this we can see that the hhtp request conatins the tool called "Nikto" in its useragent 

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/1.0 Answer.png)

[More about Nikto ](https://github.com/sullo/nikto)

```
index=main host="Client-Server"
| stats count by useragent
 ```

### So that Answer for the tool is "Nikto" 

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/1.1 Answer.png) 

Can see here that there are hunders of request for with this user agent! 

### Q2.After web reconnaissance activity, which technique did attacker use for directory listing discovery?

To detect these type of Directory attack , need to detect how many ip where invouled in attack , this can be done by list of GET request performed by each client ip , usally there be huge spike of GET request for querying the url directory when the attcker performed these types of attack 

```
index="main" host="Client-Server" 
|  stats count by clientip , method
```

These SPL command will query the list of client ip's and their number of request preformed by each clientIp

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/Get-Request.png)

when there is a dictornay type of attacks , it will query every possible directory from a wordlist , and not all req can give sucessfull 200 ok , most of them will results in "404 Not-found" 

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/404-Requests.png)

```
index="main" host="Client-Server"  clientip="192.168.199.2" status=404
```

This will query the all 404 request made by 192.168.199.2 

### So that Answer for the attack performed after reconnaissance is "Directory Brute Force" 

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/Confirming the Directory Bruteforce.png) 

these are dictoryies attacker sucessfully managed to gather working 

### Q3. What is the third attack type after directory listing discovery?

we can see that the attacker performed brute force attack on login.php 

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/Password Bruteforce.png)

### Q4.Is the third attack successful?

### yes 

### Q5.What is the name of fourth attack?

from the above traging we have attacker Ip address , status code and we also know the /login.php is used for login bruteforce let list the other directories 

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/1.0Uri-paths-for-Q5.png)

/bWAPP/phpi.php	
/bwapp/admin/	
/bwapp/phpinfo.php

starting with /bWAPP/phpi.php 

rigth away we see that attacker performed code injection through phpi.php using message variaable and using obfuscation techoquies to avoid detection 

```
index="main" host="Client-Server" uri_path="/bWAPP/phpi.php" 
|  stats count by uri_query , clientip , useragent
```

### Name of the forth attack is "Code Injection"

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/1.1 Command Injection-for-Q5.png)

### Q6.What is the first payload for 4th attack?

Whoami was the First paylaod executed by attacker , whoami When executed, it simply prints the username of the current user who is logged into the terminal session. This command is helpful for quickly identifying the user context within a terminal session & OS system, Since the status code was 200 OK so we can conclude that command was excuted sucesufully 

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/Code injection.png)

### Q7. Is there any persistency clue for the victim machine in the log file ? If yes, what is the related payload?

After query the Whoami , Attacker got to know thats the application is runing windows enviroment , can see that they added the user "hacker" and password "Asd123!!" using net user utillity for presistance 

```
%22%22;%20system(%27net%20user%20hacker%20Asd123!!%20/add%27)
```
Here is the decoded code that attacker used 

```
""; system('net user hacker Asd123!! /add')
```

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/persistency.png)

### Answer for this question is " %22%22;%20system(%27net%20user%20hacker%20Asd123!!%20/add%27) "



