# Architect's review: plan T1b, trim and move (v1.1). 29 October 2026

**Source:** pasted into the Builder's session by Carl (the Architect had no way to write files that session). Saved
verbatim below. **Verified by the Builder before folding in:** the cited lines hold at HEAD `5c221e0` (`commit`
camera-bench.tsx:1052, the clash `useMemo` :1140, the keyboard :1094–1095, delete's clamp :478, `syncBuilderTake` every
frame :607 / :529, the timeline's span bench-timeline.tsx:84, the clip's click :191, the order sort :176). Item 7's pointer-capture
claim is the Architect's own "not verified"; the harness will check it. **Folded in as plan v1.2.**

---

I read the plan against the code it touches (bench-chain.ts, bench-timeline.tsx, camera-bench.tsx) and against D-104's record of what you said on 29 October.

Plan review: T1b trim and move (v1.1)

Verdict: send it back as v1.2 before approval. The rules table matches what you said. The data claims hold up: no chain version change is needed, and every reader already uses in/out. Your Vader case also works from start to finish. After a tail trim the playhead sits on the clip's last frame, so A records clip 2 from exactly there. The problems are in how the drag itself is built. Two of them are structural (§5a) and the plan doesn't name them.

Must fix before building

1. There's no stated way for the draft to reach the screen. The timeline draws from React's chain, and the only thing that sets it is commit (camera-bench.tsx:1052), which also writes storage. The plan says joins, gaps and the playhead "follow the draft live", but not how. Whatever does it is a new channel and a §5a item. The plan only names the store's copy.
   - Routing the draft through chain would also re-run the clash check on every pointer move (camera-bench.tsx:1140, about 4,000 poses per shape).
   - Fix: give the timeline a separate draft input for drawing only, and keep the clash check on the committed chain.
2. Releasing a drag can wipe out a change made during it. The draft is a whole chain copied at pointer-down, but the chain can change while the drag runs:
   - The Builder's take sync runs every frame (camera-bench.tsx:607). If the take's version changes mid-drag (our normal iteration loop), the release commits the old chain and silently removes the new take.
   - Fix: store only the edit itself ({id, edge or move, T}). On every move and on release, apply trimClip/moveClip to the current chain. The second chain then becomes a derived view rather than a stored copy.
3. Nothing stops other inputs during a drag.
   - Space or the pad's A starts a recording (camera-bench.tsx:324, :633, :1094).
   - Delete removes the clip being dragged (:1095).
   - P, Home, End, , . and H all move the playhead or camera.
   - The plan blocks drags during recording, but not the reverse. It needs to say whether these are ignored or cancel the drag first.
4. The timeline's scale changes under the pointer. The visible span is the chain's end × 1.04 (bench-timeline.tsx:84). Dragging a tail out, or moving the last clip later, makes the span longer, so the edge slides away from the cursor and the effect compounds on every move. Fix: freeze the span and the pixel-to-seconds conversion at pointer-down.
5. Snapping will lock onto the clip being dragged.
   - During a trim the playhead follows the edge, so the live playhead is always 0 px away and always wins the snap.
   - The dragged clip's own start and end are also in the target list.
   - Fix: snap to where the playhead was at pointer-down, and leave out the dragged clip's own edges. This matters most because it's your workflow: park the playhead at 8.0 s, then drag the tail onto it.
6. Every drag ends with the clip deselected. With pointer capture, the button still receives a click on release (bench-timeline.tsx:191). Clicking an already-selected clip deselects it (camera-bench.tsx:1078), so the inspector goes blank.
   - Fix: suppress that click after a real drag.
   - The plan also doesn't say whether starting a drag selects the clip. Resolve does, and the inspector's "8.2 s of 13.3 s" only shows for a selected clip.

Should fix

7. Raising order mid-drag reorders the DOM. Rows are sorted by order (bench-timeline.tsx:176), so React would re-insert the dragged button. That may release pointer capture in Chrome (I haven't verified this), and the plan treats a lost pointer as a cancel. Stacking already uses zIndex: order (:195), so keep the DOM order stable, and add a check for this to the harness.
8. The playhead will lag the edge. The timeline's playhead position updates 10 times a second (camera-bench.tsx:714, :1350), while the edge follows the draft immediately, so you'll see a gap between them. While trimming, draw the playhead from the draft edge.
9. The "ONE setItem per drag" check will fail as written. The saved camera position is written every 0.1 s whenever the camera moves (camera-bench.tsx:716–725), and the trim view moves it. Count only the chain's storage key.
10. The head-trim clamp needs to be spelled out. start and in must move by one shared amount, limited by whichever runs out first. Clamping them separately shifts every kept frame. Add a check that drags a head past both limits.
11. "Trimmed" isn't defined for replaceShape. Proposal: out < source length − EDGE_S, so a tail dragged back to full length counts as untrimmed.
12. A move can shorten the shot past a parked playhead. Delete already clamps the playhead to the new end (camera-bench.tsx:478); a move should do the same.

Your call (decisions, not defects)

- A move always makes the clip the top take, even if it's moved straight back to where it was. There's no undo, and 3 px is a small threshold, so a slightly shaky click on a covered take would promote it. This follows from the plan's reading of your answer 1, so confirm it.
- "A click on empty row space clears the selection" is Resolve's behaviour, not something in your spec (D-104). It's small, but under "build only what Carl asks" it needs your yes or it comes out.

Housekeeping

- The current session-handoff.md is from 27 October and says to start with the third-person view. D-104 records that you brought T1b forward, so the replacement handoff should say that.
- This review only exists in chat: I had no way to write files this session. It should be saved to live-work/ for the Architect.

---

# Review 2: plan v1.2. 29 October 2026

**Source:** pasted by Carl, saved verbatim. **Verified by the Builder:** `syncBuilderTake` deletes the old clip and places
a new id `builder-v<version>` (camera-bench.tsx:557–561) and sets `mode = "fly"`, `T = start` (:563–564); the plain-click
toggle at :1078. **Folded in as plan v1.3.**

---

v1.2 review

Verdict: nearly there. All twelve points from the first review are folded in, and the fixes are sound. Holding only the edit, applying it to the current chain, and naming the drawing channel is the right way to build it. Your two new answers are recorded in decisions.md, and the saved Architect response exists. Two new problems came in with v1.2 and both need fixing before approval. Three smaller ones can be folded into the same pass.

Must fix

1. A plain click on an unselected clip will select it and then immediately deselect it. v1.2 selects a clip on press. A release with no drag still fires click, and a plain click on the only selected clip deselects it (camera-bench.tsx:1078). The suppression rule only covers clicks after a drag. Fix: the click toggles only if the clip was already selected at the press; otherwise that click is suppressed too. Add a harness check that one click on an unselected clip leaves it selected.
2. Cancelling has no clear owner. The edit lives in BenchTimeline's local state ("the store never changes it"). But Esc goes through the page's keyboard handler, and a hidden tab cancels through the store (Step 2). Neither of those can reach the timeline's state.
   - If the store clears its copy, the timeline's next pointer move pushes the edit straight back.
   - Pointer capture also stays held.
   - Fix: give the edit one owner that handles every way a drag ends: pointer up, Esc, a hidden tab and a lost pointer. Either lift it into the page component, which already holds the keyboard handler and the store, or have the timeline listen for Esc and visibility itself and call setEdit(null). The plan has to say which.

Should fix

3. Your Vader clip is the Builder's take (builder-v4). When syncBuilderTake places a new version, it deletes the old clip and puts in a new one with a new id (camera-bench.tsx:558–561). Two consequences:
   - Mid-drag: if a new version lands while you're dragging that clip, the dragged id disappears. applyEdit must treat a missing id as "no change", and the drag must cancel. The harness check only covers a take landing while a different clip is dragged; add this case.
   - This one's your call: the plan notes that your trim isn't carried to a new version. In practice, if I hand you take 5 of Vader, your 8 s cut is lost and you'd re-trim. Either accept that, or have the sync keep the old take's out when it was trimmed, as "Keep the trim" already does for shapes. Decide before the build, because it's your exact example.
4. The edit's T is ambiguous for a move. It's defined as "the pointer's time after snapping", but a move also needs where on the clip you grabbed it, and snapping checks both the clip's start and its end.
   - Define T per kind: the new edge time for head and tail, the new start for a move.
   - Store the grab offset at the press.
   - Store absolute times, so applying the edit to an already-committed chain changes nothing.
   - Compute the order raise over the other clips. Otherwise each repeat bumps order again: harmless, but untidy.
5. The playhead and trim view should follow the clamped edge. The edge they track should come from the clip after applyEdit clamps it, not from the raw edit.T. Otherwise, past the source's length or the 1/60 s floor, the playhead runs past where the clip actually ends.

Minor (one line each in the plan)

- Say that a drag edits only the pressed clip, even when several are selected. There's no group move.
- Gating the pad also has to cover syncBuilderTake's state handling (this.mode = "fly"; this.T = start, :563–564). If a take lands mid-drag, it moves the playhead while the timeline still shows the trim view. The harness check should assert that the playhead stays on the edge.

Once points 1 and 2 are fixed and you've decided point 3, I'd pass it to you for approval. The rest is wording.


---

# Review 3: plan v1.3. 29 October 2026

**Source:** pasted by Carl, saved verbatim. **Verified by the Builder:** `syncBuilderTake`'s early return (camera-bench.tsx:531)
and `builderPlaced = t.version` (:533); the keyboard effect keyed `[store]` only (registered once, :1085 / :1120); the
plan's stale sentence at its line 68. **Folded in as plan v1.4.**

---

v1.3 review

Verdict: ready for your approval once the wording below is fixed. Every point from the second review is addressed, and your "Keep my trim" is recorded. Making the page the one owner of the edit, the timeline a controlled component, and holding the Builder's take until release are all sound. Nothing new is structural, and none of these points needs another review round.

Fix in the wording before approval

1. Where the hold on the Builder's take goes. Today syncBuilderTake marks the version as placed (builderPlaced = t.version, camera-bench.tsx:533) straight after its early-return check. The "edit is set" check must go in that same early return (:531, beside this.rec). If it goes after line 533, the version is marked placed during the drag and never lands. The plan's harness check would catch this, but the plan should say where the check goes.
2. Two drag endings arrive back to back. On release the browser fires pointerup and then lostpointercapture immediately, before React re-renders. The timeline would report onEditEnd(true) and then onEditEnd(false).
   - The plan needs to say that the first ending wins and any later one does nothing.
   - The page should track whether a drag is live in a ref, not in React state.
   - The same goes for the page's keyboard handler: it's registered once (:1085), so if it reads edit state it will see a stale value. It should read the ref or ask the store.
3. Moving the clip to the top must never lower its order. "Above the highest of theirs" gives a clip already at order 7 a new order of 4 when the others' highest is 3. Precedence is unchanged, but the inspector's "take N" would drop for no reason. Use max(own, others' highest + 1). It's still safe to apply twice and never lowers.
4. The click after a cancelled drag. After Esc or a hidden tab mid-drag, the eventual release can still fire click on the button. Add this to the cases where the click is suppressed.
5. What counts as "trimmed" for the Builder's take. Row 40 carries the old take's in and out, but the only definition of "trimmed" (row 41) looks at out alone. For the take, define it as in > EDGE_S || out < source length − EDGE_S, so a head-only trim is also kept.
6. A leftover sentence contradicts the new rule. Line 68 still says a Builder's take that lands mid-drag "is KEPT" because syncBuilderTake runs every frame. v1.3 says it waits until release. Reword line 68, or delete it.

All six are corrections to the plan's wording, not design changes. With them made, I'd approve.
