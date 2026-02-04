# Phantom Feast

Static marketing page plus the **Phantom Feast** browser game.

## Project structure
- `index.html` – consulting landing page
- `game.html` + `game.css` + `game.js` – Phantom Feast game
- `README.md` – this file

## Run locally
```sh
cd phantom-feast
python3 -m http.server 8000
```
Then open:
- Landing: http://localhost:8000/
- Game: http://localhost:8000/game.html

## Deploy to GitHub Pages
1) Commit and push (branch used: `Phantom_Feast_v1`):  
   `git add . && git commit -m "Add Phantom Feast site" && git push origin Phantom_Feast_v1`
2) In GitHub → Settings → Pages: choose Source = `Phantom_Feast_v1`, folder = `/ (root)`, Save.  
3) Site will appear at `https://<user>.github.io/ssmk-web/` after a minute or two.

## Game quick notes
- Collect teal/gold orbs for points/time; rare blue “Triple” orb grants 10s of 3× scoring.
- Poison drains points/time and spawns ghosts; micro dot supersizes you.
- High score triggers spike obstacles (instant KO) and a super ghost—stun it with the white stop orb.
- Random short blackouts dim the arena; stay moving.
