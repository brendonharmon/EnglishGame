# Resume Quest: The College Chronicles

This is a lightweight browser implementation of the "Resume Quest" design. It simulates 8 semesters (4 years) of college. The game emphasizes soft skill development and dynamically builds a simple resume preview and final outcome.

How to run

- Open `index.html` in a browser directly, or run a simple static server from the project folder:

```bash
# from macOS zsh in the project folder
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Gameplay notes

- There are 8 semesters. Each semester has ~3 decisions.
- Soft skills have stronger per-choice impact than hard skills (per the design doc).
- The final score combines hard (40%) and soft (60%) averages plus a relationship bonus.
- The game saves automatically to localStorage and you can Save/Load with the buttons.

Next steps (optional)

- Add richer branching and narrative text per decision.
- Add a visual resume builder and downloadable resume export.
- Implement proper achievements, replay comparisons, and leaderboards.
- Add audio and asset images.

New features added in this iteration:

- Major selection at game start (Engineering, Business, Liberal Arts).
- Achievements system (displayed in the sidebar).
- "View Outcome" button to calculate final outcome immediately.
- `smoke_test.sh` helper script to run a quick server + health-check of `index.html`.

Smoke test

You can run the included smoke test from the project folder on macOS:

```bash
chmod +x smoke_test.sh
./smoke_test.sh
```

It will start a temporary server, fetch `index.html`, and verify the page contains the expected game title.

Design source

Taken from `resume_quest_plan.md` provided in the workspace.