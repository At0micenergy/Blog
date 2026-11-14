---
layout: post
title: "The Claude Code 'Don't Ask Again' Leak: An Agentic Security Analysis"
date: 2026-11-13
categories: [AI Security, Agentic AI]
tags: [AI agents, OWASP, agentic AI, coding agents, secrets, sensitive information disclosure, identity and privilege, agent security]
description: "A standalone analysis of Apiiro's November 2026 findings: Claude Code's 'don't ask again' approval stored commands word for word in a project settings file, and 2,539 real secrets reached public GitHub repositories in 1,994 projects: how an approval became a credential store, the root cause, the grades on both OWASP 2026 lists, the control set the incident argues for, and how that set would be verified."
audio: /assets/audio/the-claude-code-dont-ask-again-leak-an-agentic-security-analysis.m4a
audio_timing: /assets/audio/the-claude-code-dont-ask-again-leak-an-agentic-security-analysis.timing.json
audio_duration: "38:10"
---

# The Claude Code 'Don't Ask Again' Leak: An Agentic Security Analysis

## Introduction

On November 5, 2026, the security firm Apiiro published a count: 2,539 real secrets, sitting in 1,994 public GitHub repositories, traced to a small JSON file most developers have never opened. The file is `.claude/settings.local.json`, the local settings file of Claude Code, Anthropic's coding agent. The secrets were in it because of how the tool remembers approvals. When Claude Code asks to run a shell command and the developer answers "Yes, and don't ask again," the tool stores the approved command, word for word, in that file, so future sessions can run it without asking. Shell commands carry secrets: database passwords, cloud keys, connection strings. The approvals file became a credential store, and like most credential stores that nobody knows about, it was eventually committed to GitHub.

This analysis treats the episode as an agentic security incident, and in one respect it is the purest one we have covered. There was no attacker. There was no injected instruction and no model misbehavior; Apiiro reproduced the behavior across Anthropic's current models, because the behavior belongs to the harness, the software around the model, and the harness did what it was designed to do. Our earlier analyses examined agents that exceeded their authority (Replit) or picked authority up from their surroundings (PocketOS). This one is about memory. A tool that writes down everything it was ever approved to run, verbatim, in plaintext, in a file inside the project folder, has made a security decision, whether or not anyone reviewed it as one. What an agent remembers, and where it writes it down, turned out to matter as much as what it can do.

A note on sources. The account below rests on Apiiro's research (Shmulik Cohen and Matan Giladi, November 5, 2026), whose methodology is published in unusual detail, and on Anthropic's response, which came from Boris Cherny, the head of Claude Code, in a Hacker News thread on November 7 and was folded into Apiiro's post in a November 8 update. One distinction runs through the research and we keep it throughout: a "real secret" in Apiiro's count is a classification, reached when a value matched a known credential format or sat next to a public host and then survived an independent review. Apiiro tested none of the credentials and contacted no host. One organization, notified by the researchers, confirmed that its exposed key had been live. The numbers below are therefore a floor built from a careful definition, not a census of working keys, and the harm analysis does not depend on every one of the 2,539 being valid.

[Go straight to guardrails and mitigation](#the-fix)

## The system and the incident

### The approval that remembers

Claude Code asks before running most shell commands. The developer can approve once, reject, or approve in a way that sticks: "Yes, and don't ask again." That third answer writes an allow rule into `.claude/settings.local.json` in the project folder. In later sessions, a command matching a stored rule runs without a prompt. The convenience is real, and so is adoption: Apiiro found 104,185 public copies of the file across 103,617 repositories.

The design decision that matters is what the rule contains. It is the command itself: the full string, arguments included, in plain text. Apiiro compared how sixteen coding agents store approvals, working from their documentation, and found Claude Code to be the only one confirmed to write the full approved command to a project file by default.

Commands contain secrets because the work requires them. Debugging a staging login or running a migration usually means putting the credential on the command line, because the command cannot work without it: a password in a `PGPASSWORD=` assignment before `psql`, an `sshpass -p` flag, a `mysql -p` argument, a connection string, a bearer token in a `curl` header. Developers type these, or the agent assembles them from a `.env` file or a config it read. Then comes the human factor Apiiro names plainly: the approval prompt interrupts constantly, and after the tenth interruption most people stop reading the commands. A password inside a long command line is one word among many. One tired approval writes it to disk, and it stays in the file until someone deletes the rule.

### How the file reached GitHub

{% include diagram.html id="ap-leak-path" %}

Claude Code does try to keep the file local. The safeguard it uses is the second problem. When the tool creates the file inside a git repository, it adds the filename to the developer's global git excludes file. That is a setting on one machine, belonging to one user. It never goes into the repository's own `.gitignore`, so nothing travels with the project. The protection fails, silently, in ordinary situations: a folder that becomes a repository after the file exists, a clone on a second machine, a file created by hand, a file that was committed once before the exclusion was written.

Worse, the tool can tell when the protection has already failed, and says nothing. Claude Code's own permissions documentation treats a copy of the file that git already tracks as repository-supplied, and its debug log records the state directly: the file "is tracked in the index; gitignore rules do not apply to tracked files." The developer is not told. The next "don't ask again" appends the new command, secret and all, to a file that is already public.

And in about half the traced cases, the agent carried the file into the repository itself. In 539 of the 1,105 secret-bearing repositories Apiiro could trace, the commit that changed the file was co-authored by Claude. The model's standing commit instructions tell it never to commit `.env` or `credentials.json`. Its own settings file is not on that list. The leak, in those repositories, was not a developer forgetting a file existed. It was the agent doing routine work with an incomplete exclusion list.

Git was not the only exit. A file inside the project folder leaves in published npm packages, in Docker images built with a broad copy command, in zip archives and synced folders. And once it has left by any route, deleting it does not recall it: the old versions remain in git history, in forks, and in clones.

### What Apiiro found

The method, briefly: read-only GitHub code and commit search over November 1–3, 2026, with queries split by file size to get under GitHub's 1,000-result cap, downloading every current copy of the file; history examined across 43,120 repositories; every fork of a repository holding a real secret checked. Classification used the two detector families secret scanners use, provider key formats and generic secrets, with a generic value counted only when a public host sat on the same line. Known false positives (placeholders, default passwords, keys public by design, expired tokens, tokens failing their own checksums) were filtered out, and the 2,774 distinct values that remained were reviewed in masked form by an independent reviewer working from a written rubric. A value counted as real only when the rules and the review agreed.

In the current copies of the file alone: 1,122 files, 1.1 percent of the total, held at least one real secret: 1,379 distinct secrets, split between 636 provider keys and 743 passwords or tokens tied to public hosts. More than a third of them open a database directly: 379 database passwords and 122 Supabase service-role keys. Another 103 are Supabase account tokens, which control every project in the account. The rest include 43 SSH logins (some of them a root password permanently approved inside an `sshpass` command), 42 GitHub, GitLab, and npm tokens, 23 AWS keys, and 6 private keys, with the remainder mostly third-party API and AI model keys.

The exposure was not brief. Every secret-bearing file sat on its repository's default branch on November 2. In the median such repository, the file had first been committed 217 days earlier; in 118 repositories, more than a year earlier. Forks multiply it: 211 forks of 74 repositories carry the same secrets. File size tracks risk in a way that fits the mechanism: among files over 8 KB, one in ten held a real secret, against fewer than one in 500 under 500 bytes. The longer a developer's approval history, the more likely a secret is somewhere in it. Git history adds 734 real secrets in 509 repositories that appear in no current copy, usually because the file was deleted from the branch while remaining fully readable in the past. The headline total, 2,539 secrets in 1,994 repositories, adds those to the current files, the shared settings file, and agent transcripts saved in repositories.

The shared settings file matters because teams commit it on purpose. Apiiro checked all 76,011 public copies of `.claude/settings.json` and found real secrets in 298 of them, again mostly inside allow rules storing exact command lines. The pattern repeats at smaller scale in the agent's other writings: chat transcripts held secrets in 120 files across 87 repositories, handoff and deployment notes in 33 files (a third of those written by the agent itself), memory files in 9 repositories, and VS Code Copilot's auto-approve settings in 9. Beyond GitHub, 126 of 31,053 Hugging Face Spaces contained the settings file, and on GitLab, 2 of the 69 public copies checked held a real secret, one of them a GitLab access token.

Sixty-three organizations held a real secret in a public allowlist. The cases Apiiro verified at pinned commits include a database vendor's own cloud API key, with manage access and no expiry, published next to its cluster host; a B2B startup's production Azure Postgres password; the database owner password for a medical-records application at an IT services firm; a payments startup's password for the `postgres` role; and a software agency's production Square access token. Apiiro notified each organization on November 2 and 3, and shared the research with Anthropic before publishing.

The standard defenses did not catch it. Apiiro ran gitleaks and TruffleHog over all 104,185 files. Of the 1,122 files holding a real secret, gitleaks flagged 564 and TruffleHog flagged 643; 215 were flagged by neither. The reason is structural: scanners look for key shapes, a known prefix or a long random string, and a password inside a command matches neither. After `PGPASSWORD=`, or inside an `sshpass` flag or a bearer header, a credential is an ordinary word in an ordinary command line, and it reads as one.

Most copies of the file never reach GitHub, and they are not harmless at home. The allowlist is plain JSON at the same path in every project, and most of its secrets sit next to the host they open. To anything that can read the disk, it is a list of the systems the developer can reach and the passwords that open them. This has already been acted on. In September 2025, the Shai-Hulud npm worm downloaded TruffleHog and ran it over its victims' filesystems; that scanner, on its own, flags 643 of the 1,122 secret-bearing files. Three weeks before that, malicious Nx packages instructed the developer's own Claude Code and Gemini CLI installations to search the disk for secrets. The predictable location of agent configuration is a feature for the tools that hunt it.

The failure was also reported, repeatedly, before it was counted. Developers began filing GitHub issues about the mechanism in August 2025; one report from August 11, 2025 describes approved commands with API keys being stored word for word. None of the four related reports received a reply from Anthropic. They were closed by an automated bot, the earliest marked "not planned" after sixty days without activity, the most recent closed the day before The Hacker News covered the research. Two other firms had measured the problem independently: ironPeak found the file in its own repository in February 2026 and measured secrets in the history of 2.4 percent of repositories with AI configuration folders, on a sample of 100; Lakera found credentials in 33 such files across 30 npm packages.

## Why it happened

### The root cause

The proximate cause fits in one sentence: a developer approved a command that contained a secret, and the tool wrote the command down. The root cause is the design that made that outcome a routine product of normal use.

An approval is a decision about one run of one command. Claude Code's persistence layer stores that decision, and it stores the wrong artifact. The convenience the feature promises ("run things like this without asking me") needs a description of a class of commands. What it records is the full text of one command, arguments included. A pattern rule carries the convenience and none of the content. A verbatim rule carries the content, and commands are exactly where developers' secrets physically live, because a shell command that uses a credential usually has to contain it.

Four choices compounded the first one.

**Persistence without screening.** The write path performs no secret detection at all. At the moment of storage, the harness holds the exact string it is about to keep indefinitely, and nothing inspects that string for the credential shapes the vendor's own ecosystem warns about. Cherny's response confirms this was the historical design: Claude Code, he wrote, had not done secret scrubbing.

**Containment that does not travel.** The one safeguard, an entry in the user's global git excludes, lives outside the project it protects. It fails on other machines, on later-created repositories, and on files already committed, and every failure is silent. A control whose failures are invisible reads, from the user's side, as a control that works.

**A known-bad state, handled silently.** The tool detects that the settings file is tracked by git, a state its documentation treats as meaningfully different, and continues appending approvals to it without telling the user. The information needed to prevent the worst version of this leak existed inside the tool. It was written to a debug log instead of shown to the person at risk.

**The agent's hygiene rules omitted the agent's own file.** The instructions that keep `.env` and `credentials.json` out of commits do not name `.claude/settings.local.json`, and the agent committed the file in roughly half the traced cases. This is the smallest of the four and the cheapest to fix, and it is the one that most directly contradicts the account in which developers simply checked the files in themselves.

Underneath all four sits the human factor the feature depends on and degrades. A permission prompt is a control only while the human reads it. A system that interrupts constantly trains its users to stop reading, then faithfully records whatever they approved while not reading. At 104,185 files, a failure rate of 1.1 percent is not a story about careless developers. It is the expected output of the design, at scale.

Anthropic's public response, when it came, was narrower than the finding. Cherny wrote that the team was looking at several approaches (making sure auto mode catches the case, building in basic secret scanning, and others) and would prototype them to understand the tradeoffs before shipping. He pointed out that Claude Code does add the file to the git excludes when it creates it, and in his view the exposed copies had been created manually and checked in. The first half of that is true, and the second half sits awkwardly against his own product's commit history: in 539 of 1,105 traced repositories, the change that carried the file into the repo was co-authored by Claude. He recommended auto mode over permission rules; when a reader noted that auto mode also stops for sensitive commands and can record the same approval, he answered "good catch" and said the team was thinking through it. He also recommended the secret scanning that GitHub and other hosts offer, which is real advice with a measured limit: the two leading open-source scanners, between them, missed 215 of the 1,122 files. As of this writing, Anthropic has announced prototypes, not a shipped change. The gap between the response and the mechanism is that the response treats the exposure as a scanning problem, and the mechanism is a storage problem: the secrets were endangered when they were written down, long before anyone scanned, or failed to scan, the file they landed in.

### Grading the failure

Against the OWASP Top 10 for LLM Applications (2026) and the OWASP Top 10 for Agentic Applications (2026):

- **LLM02, Sensitive Information Disclosure (primary, LLM list).** A convenience feature in the harness published the user's own secrets to a public platform, where they sat for a median of 217 days. That is this category in its most literal form: disclosure by the system itself, as a side effect of ordinary operation, with no adversary involved.
- **ASI03, Identity and Privilege Abuse (primary, Agentic list).** An allow rule is a standing privilege: it pre-authorizes future executions with no human in the loop. Storing those rules verbatim merged the privilege store and the credential store into a single file. Whoever reads it gains both the keys and, on the same line, the hosts they open. The identity layer failed twice over: credentials were kept where credentials should never be kept, and standing grants were recorded with secrets embedded in the grants themselves.

Two deliberate negatives. This is **not LLM01 (Prompt Injection)**: no untrusted content entered any loop; every command was the user's own work. And it is **not ASI01 (Agent Goal Hijack)**: no goal was redirected; the agents pursued their users' tasks throughout. The defenses for those categories, scrutiny of inputs and of goal integrity, would have found nothing here. The failure is in what the harness persists, which is a layer those defenses do not examine.

## The fix

### What Anthropic has said it will do

The vendor's stated agenda, as of November 8, 2026, is prototyping: extend auto mode to catch this case, and build basic secret scanning into the product. No shipped change has been announced, and no date given. Host-side scanning, the other remedy Anthropic points to, already exists and already missed nearly a fifth of the affected files in Apiiro's test. The control set below is what the incident argues for in full. Most of it sits at the write path, where the harm is created, rather than at the repository, where it is discovered.

### The control set the incident argues for

{% include diagram.html id="ap-control-stack" %}

1. **Never persist a secret verbatim.** Screen every rule at the moment it is written. If the command being approved contains credential material, the harness must not store the string: it should decline to persist that approval, or persist a generalized rule with the secret-bearing part removed, and say which it did. This check belongs in the write path, where the exact string is known and the cost of checking is lowest. It is also the control that makes most of the others less load-bearing.

2. **Persist patterns, not commands.** "Don't ask again" should record the narrowest reusable rule that captures the intent: the tool and the subcommand, in the style of `Bash(npm run:*)`, with arguments abstracted away. Where a command cannot be generalized safely, the approval should stay one-time rather than be stored raw. The product already supports pattern rules; the incident is what happens when the default path stores literals instead.

3. **Make standing approvals reviewable and expiring.** An allowlist a user never sees is a grant they cannot revoke. Stored rules should be listed in a place users actually visit, shown with their full text, and aged out unless renewed. Review would have caught many of these rules on sight: a production password inside a permanent approval is obvious to the person who owns it, the one time they are shown it after the fact.

4. **Let the file's privacy travel with the project.** The ignore entry belongs in the repository's own `.gitignore`, written by the tool with the user's knowledge, so that the protection exists on every clone and every machine. If the file is ever found already tracked, the tool should stop appending to it and say so in the session, in plain language, at the moment it matters. A tracked allowlist is a publishing incident in progress, and the one actor who always knows is the tool itself.

5. **Put the agent's own files on the agent's do-not-commit list.** The standing instructions that bar committing `.env` and `credentials.json` should name the settings files, transcripts, and memory files of the agent itself. The agent committed the leaking file in about half the traced cases; that is an instruction defect with an instruction-sized fix.

6. **Scan for secrets the way they actually appear.** Repository and CI scanning should treat agent configuration folders (`.claude/`, `.cursor/`, `.gemini/`, transcript and memory files) as secret-bearing locations, on laptops as well as in repositories, and detectors should match passwords inside commands: after `PGPASSWORD=`, in `sshpass -p` and `mysql -p` flags, in authorization headers. Apiiro's 215 files that both major scanners missed are a ready-made test set for any detector claiming to cover this ground.

7. **For users, with the tools that exist today: reference secrets, never embed them.** Approve the pattern, and keep the credential in a variable supplied by a secrets manager, so the stored rule records `$DB_URL` and not the secret. Audit the allowlists you already have; if the file is tracked, untrack it and add it to the repository's own `.gitignore`; and rotate every credential the file has ever held, because deletion reaches neither history, nor forks, nor clones. Apiiro's ordering is the right one: rotate first, clean up second.

## How we would verify the fix

These are paper tests, stated so that each has a pass condition a reviewer can check: a file inspected, a warning shown, a rule that matches or refuses to match.

- **Test 1: The embedded password.** In a test project, approve "don't ask again" for a command carrying a database password in a `PGPASSWORD=` assignment against a public host. Pass: the persisted settings file, inspected byte for byte, contains no part of the password, and the approval was either generalized or declined for persistence with a stated reason. Fail: the password, or any recognizable fragment of it, anywhere under `.claude/`.
- **Test 2: The pattern still works.** Approve a generalized rule for a routine command class. Pass: the rule persists, later commands in the class run without a prompt, and commands outside the class still prompt. Fail: the convenience is gone (the fix simply broke persistence), or the pattern silently widens to cover other tools.
- **Test 3: The tracked file.** In a repository where `.claude/settings.local.json` is already committed, approve a new command permanently. Pass: the session warns that the file is tracked and public-facing, and does not append. Fail: a silent append, or a warning that appears only in a debug log.
- **Test 4: The second machine.** Create the settings file on one machine, then clone the repository fresh on another with no global git excludes configured. Pass: the project itself carries the ignore rule, and the settings file never appears as an addable untracked file. Fail: the file is one `git add .` away from publication.
- **Test 5: The agent commits.** Modify the settings file, then instruct the agent to stage and commit all changes. Pass: the file is excluded, and the exclusion is visible in the agent's summary of the commit. Fail: the file appears in the commit, with or without a secret in it.
- **Test 6: The scanner gap.** Seed a repository with the shapes both major scanners missed: passwords after `PGPASSWORD=`, in `sshpass -p` and `mysql -p` flags, and in a bearer header inside a `curl` command, each stored in an allow rule. Pass: the scanning control flags every seeded file. Fail: any miss, since this is precisely the class that produced 215 undetected files in the wild.

## Lessons for agentic systems

1. **What an agent writes down is part of its attack surface.** Approvals, memory files, transcripts, and handoff notes all store session content, and sessions contain secrets. Apiiro found this pattern in every one of those artifacts, including notes the agent wrote itself. Write paths deserve the same security review as read paths, and usually get none of it.
2. **Consent is not storage.** A user's yes authorizes an action. It does not follow that the exact words of the action should be kept indefinitely, in plaintext, in a file that syncs, copies, and commits. Systems should persist the decision (a pattern, a scope, an expiry) and discard the content that made the decision sensitive.
3. **A safeguard that lives on one machine does not protect a shared artifact.** The global git excludes file guarded one developer's habits on one laptop. The project's repositories were shared, cloned, and forked, and the safeguard was in none of those places. If a file must never be published, its protection has to live where the file lives.
4. **Approval fatigue is a design output.** Prompt often enough and reading stops; that is a property of the system, not a character flaw in its users. A control that requires a human to read every command, forever, will be bypassed by the humans it trains. Fewer prompts, scoped better, are a security property, not just a usability one.
5. **Standing grants deserve credential hygiene.** An allowlist is a privilege store. It should be reviewable, expiring, and free of secret material, and it should be treated as sensitive by scanners and auditors, because it is already treated as sensitive by attackers: one 2025 incident had malware instruct the victim's own agent to search the disk for secrets, and another scanned the disk with the defenders' own tool.
6. **The harness is the boundary more often than the model is.** Nothing in this incident was a model failure. The models' names appear in the co-authored commits almost incidentally. The defect was in the software that asks, remembers, writes, and commits. Security review of an agent product that stops at the model will miss the layer where this class of failure lives.
7. **Reported is not the same as heard.** The mechanism was filed as a bug in August 2025, closed by a bot, measured independently by two other firms, and filed again. Fifteen months later, the published count was 2,539 secrets in 1,994 repositories. Triage automation that closes security reports for inactivity is part of the incident, and it belongs in the postmortem.

## References

- Shmulik Cohen and Matan Giladi, "Coding Agents Copy Your Secrets to a Hidden File. Thousands Are on GitHub," Apiiro, November 5, 2026; updated November 8, 2026 with Anthropic's response.
- Swati Khandelwal, "Claude Code's 'Don't Ask Again' File Exposes Passwords and Keys in 1,122 Public Copies on GitHub," The Hacker News, November 7, 2026.
- Boris Cherny (Head of Claude Code, Anthropic), comments in the Hacker News discussion of the Apiiro research, November 7, 2026, as reproduced in Apiiro's November 8 update.
- OWASP Top 10 for LLM Applications, 2026 edition (LLM02).
- OWASP Top 10 for Agentic Applications, 2026 edition (ASI03).
