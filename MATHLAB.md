# Raider MathLab: authoring guide

Read `ENGINE.md` first; it covers the engine every Raider Labs site shares. This guide adds what MathLab needs. The reference tool is `sims/shotangle.js`, with `practical/shotangle.js` and `review/shotangle.js`. Copy its shape. For the skills line, "Your turn", the formula at the reveal and number challenges, copy `sims/onepercent.js`.

## The point of the site
Students ask "why am I learning this?" Every tool answers it for one specific skill from RJ's Algebra 1, Geometry, Algebra 2 or Precalculus course. A tool has four parts:

1. **The problem.** A real case with real numbers, posed as a question (`practical.hook`).
2. **Gut vs. math.** The student locks in a gut answer, **works the number out themselves** (`gut.calc`), the math takes a turn, and the tool shows **the difference in real terms**: dollars saved, minutes saved, shots on goal, feet of stopping distance, pixels clipped, errors avoided. Never just "the math is more accurate."
3. **Your day runs on this.** Three concrete, true places where modern life depends on this exact skill (`practical.uses`).
4. **Review.** Real-world and test-style questions with worked solutions (`review/<id>.js`).

**The test for every case and every use:** if a student would still ask "but why would I ever need that?", it fails. Jason rejected "find the center of a broken plate" for exactly this reason: textbook classics that don't touch modern life don't count.

## Files you add (and only these)
- `sims/<id>.js`: the tool. Same format as the other Raider Labs sites.
- `practical/<id>.js`: `BioLab.addPractical({<id>:{hook, answer, uses:[3 items], takeaway}})`. These render at the top of the tool as the problem and "Your day runs on this" (open by default), and in the Guided finish card.
- `review/<id>.js`: `BioLab.addReview({<id>:{questions:[...]}})`. Use at least 5 questions with both `real` and `test` kinds, and at least 2 at `honors` or above. Every question has worked `steps`. Wherever a metric can confirm the answer, add `lab:{set,act,look}` plus `verify:[[metricId,value,tol]]`; the harness checks these against the model.

Do not edit `engine.js`, `biolab.css`, `index.html` or `courses.js`. After adding files, run `python3 /home/claude/mathlab-tools/build_index.py <your repo dir>` to list them in index.html.

## Real work a high schooler might do (Jason's standard, Nov 6)
Every scenario puts the student in the role of someone doing real, sensible work they could actually face now or soon: running a club fundraiser, ordering team shirts, budgeting a part-time paycheck, splitting a trip with friends, choosing a phone plan, driving and stopping safely, taking a shot in a game, planning a ramp for a family member, analyzing their own lab data. Ask: would a 15-year-old recognize this as something they, a friend or a family member might really do? If the student is only watching an expert's job from outside (a type designer, a robot engineer), lead with the part of it the student touches in daily life, then show the professional side as one of the uses. Numbers must be realistic for that situation (real prices, real distances, real rules). Name no real student, teacher or brand as a character.

## The cold start (Jason's rule, Nov 6)
A student who opens a tool with no teacher in the room must know exactly what to do first. This is the lesson from BioLab and Paul Stearman: a tool that only works when a teacher walks students in is not done.
- **Guided is the default view.** It opens with the question (`practical.hook`), then **Your gut**: the `gut.ask` text and the student's answer control, side by side with the picture. They lock it in, then **Your turn** asks them to compute the answer from numbers it gives them and checks it, the walkthrough teaches the math one step at a time, and then the tool reveals the math's answer next to theirs, with the difference in real terms and "Your day runs on this". Full lab is one click away, and the answer control sits inside its gut box too.
- **`gut.controls` is required:** the ids of the one or two controls the student answers with. The engine moves exactly those next to the prompt. Never more than two.
- **`gut.ask` speaks to that control:** "Drag the slider here to where you think...", "Pick one here...". Don't send students to look elsewhere on the page. Give one concrete first move, in plain words.
- **Big picture assumes nothing:** no spreadsheet cell code, no variable letters before they are introduced, no jargon a 9th grader would not know. Put that at Closer look. If the scenario only makes sense to someone who already knows a tool (Excel, a sport's rules, a car part), explain it in the question or pick a different scenario.
- A choice between a few answers works best as a `seg` control (it stacks as buttons beside the picture), not a `select`.

## Teach the skill (Jason's standard, Nov 7)
"We are teaching math and science skills using powerful examples." Guessing by feel and then watching is not enough: the student has to do the math. Every new or revised tool must:
- **Define `skills`:** the skill in math words and the RJ course (and unit) it belongs to, e.g. `'Percent change and weighted averages · Algebra 1'`. Use `{bio,honors,ap}` when the deeper levels use a named idea (geometric series, Bayes' rule). It shows at the top of the page at every level.
- **Define `gut.calc`:** a "Your turn" calculation the student does right after locking the gut. The prompt gives every number they need for this scene, in plain words at Big picture. `answer(sim)` must match the scene on screen, `steps(sim)` shows the worked solution with those numbers and the answer, and `tol` accepts honest rounding. Hide the answer in `draw()` and metrics while `BioLab.calcPending(sim)` is true. A harder prompt at Deep dive (e.g. "use the formula to find the payment first") can share the same answer.
- **Define `gut.formula(sim)`** (the formula with the case's numbers, shown at the reveal), or at least `gut.how`.
- **Put at least one `kind:'num'` challenge first at Big picture**, on a fresh case (different numbers from the hook), so "test yourself" starts with computing, not predicting.

## The gut-vs-math contract (`def.gut`, required)
```js
gut:{better:'higher'|'lower',          // which way v is better (the harness checks math >= gut over random picks)
 controls:['id'],                       // REQUIRED: the 1–2 controls the student answers with; shown beside the prompt
 ask:'level text: what to set by feel, then lock in',
 lock(sim)  -> {v, label, ...anything you need later},   // read the current state as the gut answer
 solve(sim) -> {v, label},  // move the sim to the math answer (set sim.p values directly); return its score
 how:'level text: how the math found it',
 formula(sim) -> 'the formula with this case\'s numbers' (shown as a math line at the reveal; required for new tools),
 calc:{prompt, answer(sim), tol, unit, d, steps(sim), hint, after},   // "Your turn" (required for new tools; see ENGINE.md)
 hint:'level text',                     // optional: replaces the line under the gut prompt
 compare(sim,g,m) -> 'HTML: the difference in real terms. Handle "your gut was right on" gracefully.',
 again(sim)  // optional: a fresh scenario (randomize the case, reset the gut control)
}
```
- `v` must be the same real-world score for both answers (window angle, dollars, minutes, error in feet). The harness randomizes every visible range control, locks, solves, and fails the tool if the math ever scores worse than the gut or if anything is NaN.
- Controls that define the scenario rather than the student's answer can set `noGut:true` so the harness leaves them alone.
- `draw` and graphs should mark the gut answer (`sim.gutS.g`) and the math answer once they exist, as shotangle does.
- When gut and math come out the same, say so warmly: their intuition already does this math, and the math explains why it works.

## Standards on top of ENGINE.md
- **Every number is computed or checked by running code.** Before you finish, recompute every number that appears in any text (lede, tour, challenges, explanations, hook, answer, uses, review steps) with a quick Python or Node script. Shotangle's first draft had three wrong numbers that only this caught.
- **Uses must be true and specific.** Name the real practice ("ADA ramps may rise at most 1 inch per 12 inches of run"), not a vague gesture ("engineers use triangles"). If you cannot confirm a claim with high confidence, leave it out. Avoid brand names unless the fact is about that brand. No invented statistics.
- **Models are honest.** State assumptions in `about` (e.g. "aim spread of 5° is an assumption for illustration"). Not medical, legal or financial advice: where a tool touches money or health, say in `about` that it is a simplified model.
- **Levels.** Big picture (`bio`): the core idea in plain words and the gut-vs-math loop. Closer look (`honors`): the named math and a second variable. Deep dive (`ap`): the formula or derivation and harder cases.
- **Challenges:** at least 2 per level; `instant:true` is fine for this site. Each one tests a real misconception. Start Big picture with a `kind:'num'` challenge; recompute its answer with a script like every other number.
- **Tour:** 5–8 steps that teach the method in order, using `setup` to move the sim.
- **Copy:** plain, direct, written to the student, in active voice. No em dashes; use a colon, a comma or a new sentence. Use the real math terms, with key terms in `terms`.
- **Canvas:** 800 logical px wide. Labels at least 12×k px, never overlapping each other or a moving object. Use theme tokens for anything drawn on the background so dark mode works. Check the phone screenshot.
- **Original art only:** no logos, brands, characters or copyrighted images. Draw everything in canvas.

## Testing
`LAB_ROOT=<your repo dir> LAB_OUT=<your out dir> node /home/claude/labtest/harness.js <id> [...]`

It checks errors, NaN readouts, the skills line, `gut.calc` (a finite answer at every level and in fresh scenarios, and steps that show it), the Guided "Your turn" flow on desktop and phone, `num` challenges, sweeps of every control and action, every challenge answered correctly at all three levels, the walkthrough, gut vs. math over random picks, review answer keys against the model, and phone width. Read the screenshots it writes (`desk-ap.png`, `desk-dark.png`, `phone-dark.png`, `tour-step2.png`, and for tools with `gut.calc`: `desk-guided-calc.png`, `desk-guided-reveal.png`, `desk-guided-num.png`, `phone-guided-calc.png`, `phone-guided-reveal.png`). A tool is done when the harness reports no issues and the screenshots look clean.
