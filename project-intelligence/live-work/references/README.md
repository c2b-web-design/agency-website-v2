# References

Stable reference material for the **active chunk**. Carl drops images here; the Builder
and the Architect read them by path.

## Why on disk rather than pasted into a chat

A reference pasted into a chat window exists in one conversation and nowhere else. On disk
it has a **stable path** that Carl, the Builder and the Architect all cite — and it is
still there in three weeks, and after a `/clear`.

The architect instance reads images from disk by path (its `Read` tool handles images), so
this folder is how visual references reach it at all. Same discipline that saved the
transition logo frames from an external tool's deletion.

## State what each reference IS

**This is the load-bearing part.** Per `checkpoint-review-protocol.md` §5.2, a reviewer
must distinguish:

- **Target design** — reproduce this.
- **Inspiration / optical reference only** — do *not* copy. It is showing a *behaviour*:
  how light glints off a curve, what a point light at a given intensity does, how a
  reflection sits on a stone. The design stays original.

Carl's normal use is the second. D-033 records it explicitly for the Send opal: reference
images were *"optical inspiration only and were not copied — markings, texture placement,
highlights and composition are original."*

A reference without that label is ambiguous, and a reviewer will guess. Say which.

## Naming

Name by what it shows, not by where it came from:

```
gold-rim-light-behaviour.png
point-light-intensity-example.png
opal-white-reflection.png
```

## Lifecycle

Cleared or promoted after the chunk ends. Anything worth keeping permanently belongs in
`brand-assets/` — this folder is a transport surface, not an archive
(`live-work-protocol.md` §1).

Generated files here are gitignored; this README is not.
