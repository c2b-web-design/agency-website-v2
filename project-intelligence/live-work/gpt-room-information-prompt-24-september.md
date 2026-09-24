# Prompt to GPT — information only, about constructing the §2 room (D-095). 24 September 2026

Written by the Builder on Carl's instruction: *"ive pasted the scene to GPT. Write a prompt describing our situation and our goal. Dont ask it to create anything, we just want information."* Carl pasted it alongside a screenshot of the current scene. ⚠ **GPT's answer is external information, not a decision** — it goes to Carl, and anything taken from it is recorded against D-095.

```
I'm sharing a screenshot of a scene from my company's website. Please don't generate any images. I want information and advice only.

CONTEXT
We are C2B, a web design studio. The screenshot is section 2 of our About page. The background is a real photograph of a two-desk office. Over it, in real-time WebGL (three.js), we render four frosted-glass "cards": two mounted on the walls above the desks and two freestanding in front of the desks. Each card carries extruded 3D text that writes and erases itself at reading pace, and has a neon rim. A hidden 3D model of the room, matched to the photo's camera, lets the glass refract and reflect the room.

THE PROBLEM
The technique works; the photograph doesn't. We chose the photo before we knew what the cards need, and we measured these problems:
- Cards seen at steep angles (up to 60° off square) are unreadable at their far ends.
- Cards sit at very different distances, so the same text is ~12 px on screen on the far cards and ~22 px on the near ones.
- Busy backgrounds (floorboards, chair legs) behind frosted glass wreck text contrast.
- The room's light falls unevenly across the cards.

THE GOAL
Replace the photograph with an office we construct ourselves: first a blueprint (a 3D blockout or wireframe with an exact camera, walls, desks, the four card positions and the practical lights), then an image generated from it with a detailed prompt, then graded in DaVinci Resolve. It doesn't have to be photorealistic, and the style is open, but it must be an office and must not read as "made with AI". Our page argues that ungoverned AI produces generic output, so the image has to show governed, deliberate construction. We previously rejected one-shot generated rooms for these tells: frames at disagreeing angles, equipment dissolving into noise, cables going nowhere, repeated objects at the wrong scale.

Requirements from our measurements:
- Every card face within about 25° of square to the camera.
- Cards at similar distances from the camera.
- Calm, even surfaces behind each card position.
- Visible light sources (e.g. ceiling downlights) that plausibly light the cards.
- Card faces about 470 mm tall.
- 3:2 aspect ratio, high resolution.
- Palette: dark teal or navy, restrained.
- The room is generated WITHOUT the cards; they're added live in WebGL, so the image must leave clean surfaces where they go.

WHAT I'D LIKE TO KNOW
1. Which inputs can your image model take to control geometry: reference images, depth maps, line drawings, segmentation or colour-coded layouts? How closely does it follow them?
2. How well does it hold a specified camera (focal length or field of view, height, pitch), straight verticals and consistent perspective? What should the blueprint contain to maximise that?
3. How should the prompt be structured for a scene like this? What detail helps, and what backfires?
4. What resolution and aspect ratio can it output? Can it edit one region without degrading the rest, or does every edit re-render the whole image?
5. Its known weaknesses for architectural interiors, and how to design around them.
6. Commercial-use and licensing terms for generated images used on a business website.
7. Anything in our plan you'd change, or a better way to reach the same goal.
```
