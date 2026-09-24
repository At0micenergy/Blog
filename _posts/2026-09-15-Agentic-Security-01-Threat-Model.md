---
layout: post
title: "AI Agentic Security #1: Agents, Taxonomy and Architecture"
date: 2026-09-15 12:00 +0530
tags: [Agentic AI, OWASP ASI]
description: "An introduction to AI agents, their core capabilities, and the foundations for understanding agentic system security."
---
 
A chatbot that gets something wrong says something wrong. An agent that gets something wrong *does* something wrong - it sends the email, runs the code, moves the money. That single difference is why agentic security has become its own discipline rather than a footnote to application security.
 
This series works through that discipline from the ground up. This first post covers what an agent is, what it can do, how agentic systems are categorised, and how to draw one in a way that makes its weak points visible. Later posts move on to the specific risks and the controls that address them.
 
## AI Agents
 
An agent is an intelligent software system designed to perceive its environment, reason about it, make decisions, and take actions to achieve specific objectives autonomously.
 
It is worth being precise about where the machine learning sits. In a modern agent, the large language model does the reasoning at runtime: it reads the current context and decides the next step in natural language.
 
[Gartner forecasts](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025) that by 2028, 33% of enterprise software applications will use agentic AI, enabling 15% of day-to-day work decisions to be made autonomously. The second half of that sentence is the interesting part. Fifteen percent of daily decisions made autonomously means fifteen percent of decisions where no human reads the reasoning before the action happens.
 
That is the shift this series is concerned with: as autonomy increases, the places where a security control can be applied move, and some of them disappear entirely.
 
## Core Capabilities
 
A plain model API takes text and returns text. Below four capabilities turn that into an agentic interaction and each one that makes the agent more capable also makes it more exposed for a security risk.
 
### Planning and Reasoning
 
Agents can reason about their objectives and decide which steps are necessary to achieve them, including formulating, tracking and updating action plans to handle complex tasks.
 
Its called a **ReAct loop** - reason, act, observe, repeat. The agent thinks about what to do, takes an action, reads the result, and thinks again with that result now in its context. Almost every other capability in this list hangs off that loop.
 
Advances in large language models have enabled more sophisticated strategies within it:
 
**Reflection** lets an agent evaluate previous actions and their results before determining its next plan or behaviour.

**Self-critique** is a key part of reflection: the agent reviews its own reasoning or output to identify and correct errors.
 
**Chain-of-thought reasoning** breaks a complex problem into a sequence of logical steps, allowing an agent to work through a task that cannot be completed in a single response.
 
**Subgoal decomposition** breaks a main objective into smaller, manageable tasks or milestones that the agent completes and tracks while working toward the overall goal.
 
*The exposure:* the plan is generated from the context, and the context contains untrusted material. Because the model cannot reliably distinguish instructions from the content it is reading, text arriving from a web page or a document can influence the plan itself. The agent does not need to be compromised in any conventional sens, its just has to be convinced.
 
### Memory and Statefulness
 
Memory allows an agent to use information from previous runs, or from earlier steps in the current run. This statefulness improves continuity and task performance.
 
*The exposure:* anything written to memory is read back later as trusted context. A single poisoned entry becomes a persistent instruction that survives the session that created it, which turns a one-off injection into something closer to a code execution. Retention, integrity, isolation between users, and access control all become security properties rather than design conveniences.
 
### Action and Tool Use
 
Agents can invoke tools as part of their actions. These may be built-in functions for browsing the web, performing complex mathematical calculations, or generating and running executable code in response to a user's request.
 
Agents can also reach more advanced capabilities through external API calls and dedicated tool interfaces. **Function calling** is a specialised form of tool use in which the model generates structured arguments for an application to execute.
 
The **Model Context Protocol (MCP)** defines a standardised interface connecting an agent, acting as an MCP client, with a tool provider, acting as an MCP server. It is worth separating this clearly from retrieval: MCP is about capability - a standard socket for reaching tools and data sources.

while Retrieval-augmented Generation (RAG) is about knowledge, pulling relevant text into the context so the model can read it. One is an action path, the other a read path for the agent.
 
Without RAG, the LLM takes the user input and creates a response based on information it was trained on-or what it already knows. With RAG, an information retrieval component is introduced that utilizes the user input to first pull information from a new data source. The user query and the relevant information are both given to the LLM. The LLM uses the new knowledge and its training data to create better responses. The following sections provide an overview of the process.

# Agent Taxonomy
 
## The core idea
 
A deployed agent isn't one thing you classify once. It's a combination:
 
> **Deployed agent = Agent Type + Implementation Pattern + Composition Pattern, at some autonomy level**
 
The three dimensions are **independent** - any type can be built with any implementation and arranged in any composition. Autonomy is **cross-cutting**: it applies to all of them and it's the multiplier on everything else.
 
Practical consequence: "we have an AI agent" tells you almost nothing about its risk. You need all four coordinates before you can reason about it.
 
---
 
## Dimension 1 - Agent Type
 
*What the agent does and where it operates.*
 
| Type | Description | Why it matters |
|---|---|---|
| **Enterprise** | Serves internal users, accessing org systems and external APIs via connectors/RAG. | Sits inside the trust boundary with broad data access. |
| **Coding** | Generates and iterates on code against repos, build systems, and CI/CD. | Code execution plus pipeline access - largest worst case. |
| **Client-Facing** | Public-facing surface interacting directly with customers, partners, and external users. | Untrusted input by default; anyone can talk to it. |
| **Personal** | Runs on a user's own device with that user's local permissions, outside enterprise IAM. | Invisible to central controls; inherits the human's privileges. |
| **Infrastructure / Ops** | Manages cloud resources, pipelines, monitoring, and incident response. | Privileged by design; blast radius is the estate. |
 
Type largely determines **what the agent can reach** and **who can put text in front of it**.
 
---
 
## Dimension 2 - Implementation Pattern
 
*How the agent is built - determines audit surface.*
 
- **Orchestration Frameworks** - e.g. LangGraph, CrewAI. Provide structure and hook points. Hook points are good news for security: there are defined places to insert policy enforcement.
- **Lightweight Library** - built from SDKs (LiteLLM, BAML) with custom control flow. Maximum control, but every guardrail is one you write yourself, and nobody else has reviewed it.
- **Platform-Native / Low-Code** - e.g. Copilot Studio, Kiro, SaaS based providers with Agentic capabilities. Orchestration is abstracted behind a UI. Fast to ship, but you often cannot see the prompt, the tool schema, or the logs - and non-engineers are building these without review.
The phrase to remember is **audit surface**: this dimension decides how much of the agent you can actually inspect.
 
---
 
## Dimension 3 - Composition Pattern
 
*How agents are arranged - determines trust boundaries.*
 
- **Single Agent + Tools** - one agent calling multiple tool integrations. A trust boundary at each tool connection.
- **Multi-Agent Systems** - tightly coupled agents with shared state and centralised orchestration. Shared state is a shared attack surface.
- **Distributed Agent Chains** - loosely coupled agents communicating via protocols (A2A, ACP, MCP). Trust between non-human parties, over a network.
- **Agent-Spawning** - parent agents dynamically creating ephemeral sub-agents (delegation trees). The system's own shape is decided at runtime, so you cannot enumerate it in advance.
This dimension is where the multi-agent risks live - insecure inter-agent communication, cascading failures, and rogue agents only exist once there's more than one.
 
---
 
## Cross-cutting - Autonomy Level
 
Applies to every agent type. **Risk scales with the window for unsupervised action.** Autonomy is a spectrum; the stops below are reference points on it, not categories.
 
| Level | Behaviour | Controls that fit |
|---|---|---|
| **Supervised** | Human approves each action; agent suggests, human executes. | Standard application security. |
| **Semi-autonomous** | Agent executes routine actions; human reviews flagged items. | Risk-tiered review. |
| **Fully autonomous** | Plans, executes and iterates with no human involvement. | Kill switches, budget limits, dedicated agent identity. |
 
**Lower risk → increasing risk → higher risk**, from top to bottom.
 
Note what changes at the last step: controls stop being about review and start being about containment. Once no human is in the path, the only remaining levers are limiting what the agent can spend, what identity it acts under, and how fast you can stop it.
 
---
 
## How to use this
 
Read any real system as four coordinates, then ask what that combination implies:
 
> *A coding agent, built on a lightweight library, spawning sub-agents, running fully autonomously.*
 
That reads as: code execution, no framework hook points to enforce policy, a runtime-determined topology you can't enumerate, and no human in the loop. Every one of those is the worst option on its axis.
 
Compare:
 
> *An enterprise agent, on an orchestration framework, single agent plus tools, supervised.*
 
Same words on the tin. Entirely different problem.
 
The value of the taxonomy is that it turns "is this agent risky?" into four smaller questions that each have a real answer.

## Agentic AI Reference Architecture
 
There's a catch worth stating up front. The capabilities we just covered - planning, memory, tool use - are features of the agent's software, not separate pieces of infrastructure you can point at. You *can* build them as modular, independently deployable services, but that adds real complexity, and in practice almost nobody does. Most deployments implement these capabilities inside the application itself.
 
That matters for security because it means the boundaries you'd like to defend often aren't boundaries at all. Memory isn't a service with an API you can put a policy in front of; it's a list in a process. The architecture below is an attempt to map capabilities onto the components that actually get deployed, so that the things worth threat modelling are visible.
 
### Single Agent Architecture
 
![]({{site.baseurl}}/img/agentic/single-agent-architecture.png)

**1. The application.** Software with agentic functionality embedded in it, performing tasks for the user and on the user's behalf. The important detail is that this often happens *outside a specific user session* - the agent may be working when nobody is watching. That single property removes the assumption most application security rests on, which is that a human is present at the moment an action is taken.
 
**2. The agent and its input.** The agent accepts natural language input, much like any NLP model: text prompts, plus optional media such as files, images, audio or video. The application code implements the core capabilities, usually leaning on abstractions from an agentic framework - LangChain or LangFlow, AutoGen, CrewAI and so on.
 
Note how wide that input surface is. It isn't just the chat box. A file, an image, or a transcript is also input, and every one of them is a place text can arrive from somewhere you don't control.
 
**3. The model.** One or more LLMs, local or remote, doing the reasoning. This is the component that decides what happens next, and the one we have the least direct control over.
 
**4. Services and tools.** Built-in functions, local tools, application code, and remote or external services. These get invoked in two distinct ways, and the difference is worth holding onto:
 
- **Function calling at the framework or application level**, optionally through a tools interface. Your code is in the path.
- **Function calling by the model**, where the LLM returns the invocation for the agent to execute.
The second is where the risk concentrates. The model is producing something that will be executed, which is exactly why the guidance treats planner output as untrusted and puts a validation step between the decision and the call.
 
**5. Supporting services.** The infrastructure the agent's core functionality depends on:
 
- **External storage** holding persistent long-term memory.
- **Other data sources** - a vector database, object storage, and the content used for retrieval-augmented generation.
RAG sources can reasonably be viewed as just another tool, but they're worth calling out separately, because retrieval is a core supporting service that shows up in almost any LLM application, agentic or not. It's also a read path rather than an action path, and read paths fail differently: nothing obviously happens, the poisoned content simply becomes part of what the agent believes.
 
### Multi-Agent Architecture
 
![]({{site.baseurl}}/img/agentic/multi-agent-architecture.png)

Structurally it's the single-agent picture repeated, with two additions: **communication between agents**, and optionally a **coordinating agent** that directs the others. The **Agent2Agent (A2A)** protocol defines a standard specification for that inter-agent communication, and coordinating-supervisor patterns are now a documented approach on major platforms - Amazon Bedrock among them.
 
Which specialist agents appear depends entirely on the solution. Each may bring additional capabilities beyond the core set.
 
Those two additions look small on a diagram and change the threat model considerably. Once agents talk to each other, one agent's output becomes another agent's input - and an agent has no better way to tell an instruction from content than it did before. A message from a peer arrives looking authoritative, so compromise in one agent propagates as ordinary, well-formed traffic. Add a coordinator and you have a component whose instructions the others are built to follow, which makes it the single most valuable thing in the system to influence.
  
## Where This Is Going

Capabilities and architecture give us the vocabulary. The next post puts it to work on classification — because "we have an AI agent" tells you almost nothing about the risk you're carrying.

A deployed agent is really a combination of three independent dimensions: what it does and where it operates, how it was built, and how it's arranged alongside other agents. Each dimension moves a different thing. Type determines what the agent can reach and who can put text in front of it. Implementation determines how much of the agent you can actually inspect. Composition determines where your trust boundaries fall. Running across all three is autonomy, which sets how long the agent can act before anyone notices.