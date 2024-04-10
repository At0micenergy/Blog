---
layout : post
title: Investigate Web Attack
image : Investigate_Web_Attack.png
date: 2024-04-10 10:18 +0530
tags: [OWASP ,SIEM , Incident Response , Splunk ] 
---

In this walkthrough, we will delve into investigating web application logs using Splunk. We'll explore a scenario where an attacker successfully compromised the system through web application hacking techniques. They achieved this by executing a code injection attack, manipulating the URL parameters. Additionally, the application exhibited numerous vulnerabilities, including file inclusion, Cross-Site Scripting (XSS), and successful privilege escalation, wherein the attacker added a remote user for persistence.  

[Here is the link to the Incident ](https://app.letsdefend.io/challenge/investigate-web-attack)

## Configuration

The network team was able to provide the log data from the incident. Now, we need to ingest the log file into our SIEM tool for better triaging.

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/Input data.png)

Navigating to settings and importing the log file, we'll also set up the index, source, host, and sourcetype. It's crucial to specify the correct source when parsing data into Splunk. This ensures that the data is categorized appropriately based on the source data using built-in data parsing plugins. 

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/sourcing.png)

Previewing the dataset allows us to inspect the data before ingesting it fully into the system. This step helps ensure that the data is correctly formatted and that any necessary adjustments can be made before further processing.

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/review.png)

Verfiying the Evenets by index & host 

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/Total Events.png)

## Indetification 

### Q1.Which automated scan tool did attacker use for web reconnaissance? 


When it comes to web applications, each client sends its own set of headers and body when communicating with the application. This includes information such as the request method, user agent, cookie values, and the host, among others. For instance, when an attacker sends a malicious packet using a tool, the user agent field may represent the name of the tool being used. This information can be crucial for detecting and mitigating attacks in the web application environment.

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/Input data.png)

if we observe the User-Agent field in the HTTP requests and find that it contains the tool name "Nikto," it suggests that the attacker used the Nikto tool to send the malicious packets. This information is valuable for triaging the incident as it helps us identify the specific tool or technique used by the attacker. 

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

To detect Directory Traversal attacks, it's essential to monitor the number of IP addresses involved in the attack. This can be accomplished by analyzing the list of GET requests made by each client IP. Typically, during Directory Traversal attacks, there will be a significant spike in GET requests querying the URL directory. By monitoring and analyzing this pattern, security teams can identify and respond to such attacks effectively. 

```
index="main" host="Client-Server" 
|  stats count by clientip , method
```

These SPL command will query the list of client ip's and their number of request preformed by each clientIp

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/Get-Request.png)

When facing dictionary-type attacks, the system will query every possible directory from a wordlist. Not all requests can yield a successful "200 OK" response; the majority of them will result in a "404 Not Found" error. 

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

yes , After a long brute attack on login.php attacker finaly able to login.

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/Postmethod.png)

### Q5.What is the name of fourth attack?


Based on the above tracing, we have obtained the attacker's IP address and status codes. Additionally, we've identified that "/login.php" is being targeted for login brute-force attacks. Now, let's list the other directories that are potentially vulnerable:

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/1.0Uri-paths-for-Q5.png)

/bWAPP/phpi.php	
/bwapp/admin/	
/bwapp/phpinfo.php

starting with /bWAPP/phpi.php 

Right away, we observe that the attacker executed code injection through "phpi.php" utilizing the "message" variable. Moreover, they employed obfuscation techniques to evade detection

```
index="main" host="Client-Server" uri_path="/bWAPP/phpi.php" 
|  stats count by uri_query , clientip , useragent
```

### Name of the forth attack is "Code Injection"

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/1.1 Command Injection-for-Q5.png)

### Q6.What is the first payload for 4th attack?

The "whoami" payload was the first executed by the attacker. When executed, it simply prints the username of the current user logged into the terminal session. This command is helpful for quickly identifying the user context within a terminal session and operating system. Since the status code was "200 OK," we can conclude that the command was executed successfully.

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/Code injection.png)

### Q7. Is there any persistency clue for the victim machine in the log file ? If yes, what is the related payload?

After querying "whoami," the attacker discovered that the application is running in a Windows environment. Subsequently, they added the user "hacker" with the password "Asd123!!" using the "net user" utility to establish persistence.

```
%22%22;%20system(%27net%20user%20hacker%20Asd123!!%20/add%27)
```
Here is the decoded code that attacker used 

```
""; system('net user hacker Asd123!! /add')
```

![]({{site.baseurl}}/img/Letsdefence/Investigate web attack/persistency.png)

### Answer for this question is 

```
%22%22;%20system(%27net%20user%20hacker%20Asd123!!%20/add%27)
```

## Summary 

scenario where an attacker successfully compromised a web application through various techniques such as code injection and privilege escalation, it's imperative to fortify defenses. Implementing a Web Application Firewall (WAF) coupled with robust input validation and security headers can thwart common attack vectors like code injection and Cross-Site Scripting (XSS). Regular security audits and penetration testing ensure vulnerabilities are proactively identified and addressed. Utilizing monitoring and logging tools like Splunk enables real-time detection of suspicious activities, facilitating timely response. Strengthening user authentication with multi-factor authentication (MFA) and enforcing strict access controls mitigates unauthorized access. Additionally, maintaining an incident response plan streamlines the response to security incidents. Combining these measures enhances the security posture of the web application, fortifying it against potential attacks.
