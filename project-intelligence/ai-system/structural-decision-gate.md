# Structural Decision Gate

## Why this exists
The Builder is given chunks — scope and constraints, not implementation
detail. That is correct, and it is also where unreviewed architecture
enters. Every seat reviewed the *outcome*; nobody reviewed the *shape*.
Bugs traced back to a structural decision are the most expensive class
this project has, because the decision is invisible until it produces a
symptom, and by then it has dependents.

## The two questions
1. Am I implementing this chunk, or deciding how the system is shaped?
2. Will a future reader ask "why is there a second X?"

Either one yes: stop.

## The decision note
- What structure is being introduced or changed
- What alternatives exist, and why they were rejected
- What currently depends on the present structure — including anything
  provided by position in the tree rather than by code
- What becomes true that was not true before
- What becomes impossible to observe

## Routing
The note goes to Carl. Carl routes to the Architect. The Architect
reports findings; Carl decides. **Nothing is built from the note until
Carl says so.**

## What this is not
Not a gate on implementation choices inside an approved structure. Not
a reason to stop and ask about every function. The line is whether the
decision is one a future reader inherits.

## Cost note
The warm-up canvas took about an hour to build and a week to unwind.
An hour of review at the point of decision is the cheapest hour in
this project.
