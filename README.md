# Raider MathLab

Why am I learning this? Real problems a high schooler might actually face, solved with the exact math from Regis Jesuit's Algebra 1, Geometry, Algebra 2, Precalculus and AP Precalculus courses.

**Live site:** https://rjedtech.github.io/Raider-MathLab/

Part of the Raider Labs suite with BioLab, ChemLab, PhysLab, ForensicsLab, AnatomyLab and SportsMedLab.

## How every tool works
1. **The question:** a real situation with real numbers.
2. **Your gut:** students lock in an answer by feel.
3. **The math:** a short walkthrough, then the math's answer next to theirs and what the difference is worth in real terms.
4. **Your day runs on this:** where everyday life depends on this exact math.
5. **Review:** real-world and test-style questions with worked solutions.

Each course unit opens with a **Why are we learning this?** card that teachers can project on the first day of the unit.

## Courses
Unit order comes from RJ math teachers' Canvas modules: Algebra 1, Geometry, Algebra 2, Precalculus and AP Precalculus, with Honors notes.

## How it is built
Static site with no build step: `index.html`, `engine.js` and `biolab.css` (the shared Raider Labs engine, plus MathLab's gut-vs-math and guided cold start), `courses.js` and `why.js`, and one file per tool in `sims/`, `practical/` and `review/`. Everything runs in the browser; no student data leaves the device. See `ENGINE.md` and `MATHLAB.md` to author a tool.
