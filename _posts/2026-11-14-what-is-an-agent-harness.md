---
layout: post
title: "What Is an Agent Harness? (And Why It's Where Agent Security Actually Lives)"
date: 2026-11-14
categories: [AI Security, Agentic AI]
tags: [AI agents, agentic AI, agent harness, agent security, OWASP]
description: "A plain-language explainer: an agent is a model plus a harness — the loop, context, tools, memory, identity, and permissions wrapped around the model — and a look at the harness from a security point of view: what it decides, what can go wrong inside it, and the questions worth asking of any agent you run."
audio: /assets/audio/what-is-an-agent-harness.mp3
audio_timing: /assets/audio/what-is-an-agent-harness.timing.json
audio_duration: "13:47"
---

# What Is an Agent Harness? (And Why It's Where Agent Security Actually Lives)

## What a harness is

Ask what an AI agent is and most answers describe the model: how smart it is, how well it reasons, which version just came out. But a model, on its own, does exactly one thing. It takes in text and produces text. It cannot open a file, run a command, check your calendar, or remember what you told it yesterday. Everything an agent actually *does* in the world happens in the software wrapped around the model.

That software is the harness.

The quickest way to hold the idea is the shorthand the industry has settled on: **agent = model + harness**. The model is the reasoning part. The harness is everything else — the loop that keeps the model working, the tools it can call, the memory it carries, the permissions it runs under. Claude Code is a harness; Claude is the model inside it. When Claude Code reads your project files before answering, or stops to ask before running a command, that is the harness at work, not the model. Swap the model inside a good harness and you get a better agent. Swap the harness around the same model and you get a different agent entirely — different capabilities, different habits, different risks.

[Go straight to the security view](#looking-at-the-harness-from-a-security-point-of-view)

## One job, watched closely

Take a small, ordinary task: "fix the failing test." Here is what actually happens, step by step.

The harness starts by assembling what the model will see. Your request, the project's instruction files, the relevant code, the test output from the last run — somebody has to gather all of that into one prompt, and that somebody is the harness. The model reads it and proposes a first move: run the test suite. The model cannot run anything, so the harness executes the command, captures the output, and feeds it back. The model reads the failure, asks for a file, gets it, proposes an edit. The harness applies the edit. Before running a command that could change something outside the project, the harness pauses and asks you. You approve. The loop continues — propose, execute, observe — until the tests pass and the model says it is done, or until a limit the harness set says the session has run long enough.

Notice how little of that was the model. Deciding what the model sees, executing what it asks for, checking whether it is allowed to, remembering what happened, knowing when to stop: all harness. The model supplied judgment inside a process it does not control.

{% include diagram.html id="hx-anatomy" %}

## The parts of a harness

Vendors name the pieces differently, but most harnesses are built from the same set.

**The loop.** The cycle you just watched: present the situation, let the model propose an action, execute it, feed back the result, repeat. The loop is what separates an agent from a chatbot, and the harness owns its terms — how many rounds a session gets, what "finished" means, what happens when the model wants to keep going.

**Context.** Before every model call, the harness builds the prompt: the standing instructions, the conversation so far, the task materials, documents it looked up, results from earlier steps. Think of it as the agent's field of vision. Nothing influences the model that did not arrive through this component — a fact that matters a great deal for security, as we'll see.

**Tools.** The actions the model can request: reading and writing files, running shell commands, calling APIs, querying a database, sending a message. Each tool is a small contract — a name, the inputs it takes, the code that runs. Increasingly the tools arrive over MCP, the standard protocol that lets a harness discover and call tools from external servers. Read the tool list of any agent and you have its capability statement: if a tool is not on the list, the agent cannot do that thing, no matter what the model decides.

**Memory.** Two kinds. Working memory is the current session's context — what the agent is holding in mind right now. Long-term memory is anything written down to be read later: notes, saved files, searchable archives of past work. The harness decides what gets written, where it is kept, and when it comes back. Memory is how a session stops being a one-off conversation and becomes continuity — and also how something from one session can show up, trusted, in another.

**Identity.** Every tool call acts as someone. The harness holds the accounts, API keys, and tokens those calls are made with, and decides how broad they are and how long they live. A call made with your personal cloud key and a call made with a narrow, task-only credential look identical to the model. To everything downstream, they are very different events.

**Permissions and approvals.** Between "the model wants to do this" and "it happens" sits the harness's judgment about what runs freely, what needs a human's yes, and what is refused. This is the part of the harness users meet most directly — the approval prompt — and the part with the subtlest design choices, including what an approval leaves behind after you give it.

**Guardrails.** Checks applied to what flows through: screening inputs before they reach the model, validating tool arguments before they run, examining outputs before they are delivered or acted on. Their strength depends on where they sit. A rule written in the model's instructions can be talked around; a check in the harness, between the request and the execution, cannot.

**The environment.** Tool calls land somewhere real: a sandbox, a container, or your own machine with its actual files and network. The harness chooses that somewhere, and the choice quietly defines how far a bad action can reach.

**The record.** A good harness writes down the run as it goes — the prompts, the tool calls and their arguments, the approvals given and refused, the files touched. When something goes wrong, this log is the difference between an investigation and an argument.

## Looking at the harness from a security point of view

Here is the shift in perspective this blog keeps coming back to. When an agent does something damaging, the postmortem usually asks what the model was thinking. The more useful question is what the harness allowed. The model proposes; the harness disposes. It picks the tools, holds the credentials, assembles the context, enforces or skips the approvals, and decides what gets remembered. Those decisions are made by whoever builds or configures the harness, and they are made before any session starts. In other words, the harness is where an agent's worst case is set.

You can see it in the incidents we have covered here. When a Cursor agent deleted PocketOS's production database in April 2026, the model's contribution was to connect pieces its environment handed it: a root-scoped API token sitting in an unrelated file, inside a session that was supposed to be about staging. The token's scope, the readable environment, the platform's instant and final deletion — every one of those is a harness or platform property, fixed before the session began. And when Apiiro reported in November 2026 that Claude Code's "don't ask again" approvals had carried real secrets into public GitHub repositories — 2,539 secrets in total once the files' git history and saved transcripts were counted — the failure sat in an even quieter harness component: the approval system wrote the approved command — password and all — into a file, word for word, and kept it there. Nobody attacked that system. A memory feature did exactly what it was built to do.

Several practical ways of looking at a harness fall out of this.

**Judge the tool list, not the demo.** What an agent *can* do is the honest measure of its risk. A short, narrow tool list — read these records, run these commands, nothing destructive — caps the damage from any mistake or manipulation. A general shell, a broad database tool, and a send-anything messaging tool hand the model, and anyone who can influence the model, the run of the place.

**Follow the credentials.** Ask whose identity the agent acts under, how wide it is, and where the secrets physically sit. Credentials the agent can read are credentials the agent can use — and leak. The healthier pattern is credentials held by the harness, scoped to the task, injected into the one call that needs them, and gone when the session ends.

**Treat everything the agent reads as untrusted.** The context component is an open door by design: web pages, documents, tool outputs, messages from other agents all flow into the prompt. Some of that content will eventually be hostile — that is what prompt injection is. A well-built harness treats retrieved material as evidence to weigh, not instructions to obey, and it never lets a document quietly promote itself into a command. Simon Willison's "lethal trifecta" is the sharpest version of this check: if an agent can reach private data, takes in untrusted content, *and* can communicate outward, then a single piece of planted content can, in principle, walk the data out. All three legs are harness properties, which means a reviewer can check for them in an afternoon.

{% include diagram.html id="hx-trifecta" %}

**Ask what gets written down.** Approvals, memory, transcripts — the harness's records outlive the session and the user's attention. If approvals are stored as exact commands, secrets will end up inside them. If memory accepts anything from any source, yesterday's poisoned document becomes tomorrow's trusted fact. What a harness persists deserves the same scrutiny as what it can do.

**Check the bounds and the exits.** How long can a session run, how much can it spend, and can a human stop it mid-action, in a way that actually stops it? Bounds are unglamorous, and they are what turn a runaway session into a failed task instead of an incident. The same goes for the destructive end of the tool list: a deletion that enters a holding period before it is final can be undone; one that executes instantly cannot.

**Read the log, or ask why there isn't one.** If a harness cannot show you what the agent did — which tools, with which arguments, under which approvals — then nobody is really operating it. They are just nearby when it runs.

None of this requires distrusting the model. Models will sometimes be confused, sometimes be manipulated, and sometimes simply be wrong; a harness designed with that in mind stays safe anyway, because its limits do not depend on the model behaving. That is the whole of our view, really. Secure the model and you have improved the suggestions. Secure the harness and you have decided what can happen.

## Where to read more

- Anthropic, "Building Effective Agents" — the clearest short tour of how agentic systems are put together, and notably honest about how simple the successful ones tend to be.
- OWASP, *Securing Agentic Applications Guide* (V2, November 2026) and the *Agent Control Standard* — the control frameworks for this layer, from the OWASP GenAI Security Project.
- Simon Willison's writing on the "lethal trifecta" — the three-property test described above, in his own words.
- This blog's incident analyses — Replit, PocketOS, and the Claude Code "don't ask again" leak — each one a case study in a different harness component failing.
