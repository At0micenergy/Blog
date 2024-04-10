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

Navigating to setting and 

![]({{site.baseurl}}/img/Letsdefence//text.png)

[Here is the link to the kernal exploit ](https://github.com/kkamagui/linux-kernel-exploits/tree/master/kernel-4.10.0-28-generic/CVE-2017-16995)





