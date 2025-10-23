Guide: Helping contributors and AI agents work on this static website

Purpose
- This repository is a static personal website (Neocities -> GitHub Pages) built with plain HTML, CSS and vanilla JavaScript. The blog is a client-side single-page app served from `jdrblog.html` using `blogscript.js` (ES module) and `showdown` for Markdown -> HTML conversion.

High-level architecture (what to know quickly)
- Core pages are top-level HTML files (e.g. `index.html`, `portfolio.html`, `jdrblog.html`, `rebellioustakeover.html`). Each page includes shared markup via `include-html="header.html"` and uses `pageScript.js` for site-wide behavior.
- `pageScript.js` handles themes, seasonal effects, the dynamic include system (`includeHTML()`), and small UI widgets (typewriter, donate modal, theme switcher).
- The blog is entirely client-side: `jdrblog.html` mounts a div `#blog-app` and dynamically loads `blogscript.js` as an ES module. `blogscript.js` reads `blog/posts.json` and fetches `.md` files from `blog/posts/*.md`.
- Social features (likes, comments) are backed by Firebase (Firestore + Auth) inside `blogscript.js`. Firebase config is embedded in `blogscript.js` — offline work can still render posts, but interactive features require Firebase setup.

Developer workflows & quick commands
- No build step required for the site — changes to files can be previewed by opening the HTML in a browser or using a small static server. Recommended local preview command (PowerShell):
  - Serve from the repo root (works for GitHub Pages parity):
    - python -m http.server 8000
  - Then open http://localhost:8000/index.html or http://localhost:8000/jdrblog.html
- Blog development: edits to `blog/posts.json` and `blog/posts/*.md` are picked up by `blogscript.js` client-side. Use cache-busting query strings are already added in the code (v=${Date.now()}); refresh to force fresh fetch.

Project-specific conventions & patterns
- HTML includes: header content is pulled into pages using a custom `include-html` attribute and XHR in `pageScript.js` (function `includeHTML()`). Do not remove `header.html` or rename the attribute without updating `includeHTML()`.
- Theme names: themes are CSS classes applied to <body>. See `ALL_THEME_CLASSES` in `pageScript.js`. Use those names when adding theme-specific styles.
- Seasonal effects: controlled by `seasonalEffectsManager` in `pageScript.js`. Toggle is persisted to localStorage under key `seasonal-effects-enabled`.
- Blog post metadata: `blog/posts.json` objects use fields: `title`, `date` (YYYY-MM-DD), `description`, `file` (relative `blog/posts/*.md`), optional booleans `nsfw`, `forRebelliousTakeover`, `hidden`, and `nsfwWarningDescription`. Keep these fields consistent for correct filtering/routing.
- Routing: the blog uses hash-based routing. Examples:
  - All posts: `jdrblog.html#` or `jdrblog.html#` (default)
  - Rebellious Takeover category: `jdrblog.html#/rebellioustakeover`
  - Single post: `jdrblog.html#/post/<slug>` where slug = filename without `.md` (e.g. `#/post/hello-world`)

Integration notes & external dependencies
- Firebase is used for likes/comments and requires a correctly configured project with Anonymous Auth enabled for likes to function. The config object is defined in `blogscript.js`.
- External scripts used at runtime (CDNs in HTML):
  - Showdown (Markdown converter) loaded in `jdrblog.html`
  - Font Awesome kit and simple-icons CSS
- Media and images are in `Images/` and referenced by exact paths; ensure paths remain correct when moving files.

Testing and quick checks for PRs
- Visual/regression checks: open the page locally (`index.html`, `jdrblog.html`, and `blog/index.html` redirect) and verify:
  - The header loads (include-html) and theme applies.
  - Blog list loads posts from `blog/posts.json` and single posts render via `blog/posts/<slug>.md`.
  - If changing blog metadata, check filters (nsfw, forRebelliousTakeover, hidden) behave as expected.
- JS errors: open the browser console (F12) and look for fetch/Firebase errors. `blogscript.js` prints actionable errors when Firestore/Auth config is missing.

Examples from the codebase
- Fetch latest visible blog post in `index.html` (see inline script): fetch('blog/posts.json') -> filter nsfw -> sort by date -> link `jdrblog.html#/post/<slug>`.
- includeHTML usage: pages declare <div include-html="header.html"></div> and `pageScript.js` replaces that fragment via XHR.

When to ask the repo owner / limits
- Do not change Firebase config unless asked — it's the live site's social backend. If you need to run interactive features locally, request a dedicated Firebase project credentials or disable social features (the app degrades to static rendering).

If anything here is unclear, tell me which area (routing, blog data shape, theme names, Firebase) and I'll expand with concrete examples or add CI/local dev scripts.

Persona & character guidance (for AI agents)
- Purpose: when asked to generate character dialogue, scenarios, or scene-editor content, follow the character and tone rules below. Keep this section concise and use it as the authoritative source for in-repo character personality behavior.
- Addressing Jake: refer to the repo owner as "Jake". If a last-name initial is required, use "Jake D".
- Tone & style: keep conversation casual, comedic, and aimed at young adults in their 20s. Use quick, clever humor when appropriate. Keep scenarios longer when they are meant to tell a story; otherwise be concise (3–4 sentences). Use *italics* for emphasis on words only (not whole sentences). Use square brackets [ ] for scene-setting or big actions. Use normal parentheses ( ) for small character actions directly before a character speaks.

- Goober (Goober Origins)
  - Minimalist greyscale pixel character: round head, large vertical black eyes, grey tank top, wide dark grey pants.
  - Personality: hyperactive, goofy, believes "pop" is literal (he thinks he pops like a bubble, but visually he just goes limp and falls). When "popped" he eventually respawns at a spawn point (location depends on context). If he loses all health he comics-rolls and slides face-first. He is extremely against swearing and is shocked/terrified when it happens.
  - Gameplay rules to mention when relevant: must collect exactly 200 coins to win; timer and coins deplete; going out-of-bounds teleports him back with slight health loss; enemies are suited goons with batons; failure causes limp reset, not death.

- Envo (Lost Memories)
  - Visuals/world: greyscale items, liminal corridors filled with sadistic notes and inanimate props. Many doors are handle-less; real doors loop; corridors loop until game end.
  - Personality: tired, scared, quiet in-person (coma patient), potty-mouthed in-game (uses swearing to calm himself). Envo is the protagonist of a short, intense liminal horror sprint.

- Rebellious Takeover cast (brief rules)
  - Key protagonists: Deren Kael (Derpz), Phenn Ashcroft, Jayce, Lyra, Ral, Cel, Mae, Luca. Antagonists include Exyler and Rick Didn't Askley.
  - Nicknames: Use full names in casual contexts; use nicknames in high-heat/battle moments (exceptions: Mae, Ral & Cel who use nicknames often).
  - Swearing: most characters are heavy swearers; Be careful with Goober — he hates swearing and should react strongly.
  - Character details: keep descriptions short (3–4 sentences) unless requested to expand. Use nicknames sparingly and only in appropriate contexts.

- Interaction rules & small behaviors
  - If Jake asks trivial questions (e.g., "What's 2+2?"), prepend a snarky remark like: "You couldn't of googled it, used a calculator, or used your head for that?" then answer succinctly.
  - Formatting: scenario example:
    - [Scene: A wet forest clearing with a waterfall in the background.]
    - Goober: (stumbles) "I think I popped again!"
    - Phenn: (quietly) "Stay here."

- Safety and boundaries
  - You may include adult/NSFW content about the user's original characters only when explicitly requested by Jake. Be mindful: Goober is squeamish about profanity.

How to add a blog post (quick snippet)
- Steps (minimal):
  1. Add an entry to `blog/posts.json` describing the post (title, date, description, file, optional flags).
  2. Create the corresponding Markdown file in `blog/posts/<filename>.md` (the `file` field should match this filename).
  3. Commit both files and push. The client-side blog will pick it up automatically. When testing locally, refresh the page (cache-busting is used in the code but a hard refresh helps).

- Example `blog/posts.json` entry (add to the array):

  {
    "title": "My New Post",
    "date": "2025-10-15",
    "description": "Short description shown in lists.",
    "file": "my-new-post.md",
    "readingTime": "Short read",
    "tags": ["update","notes"]
  }

- Minimal `blog/posts/my-new-post.md` template:

  # My New Post

  First paragraph of the post. You can use Markdown normally. Images are referenced relative to the repository (e.g., `/Images/blog/...`).

  - Bullet points are fine
  - Use standard Markdown for headings, code blocks, and images

  *End*

- Important notes:
  - If the post should be hidden from the main blog list, add `"hidden": true` to the JSON entry.
  - To mark a post NSFW, add `"nsfw": true` and optionally `"nsfwWarningDescription": "Custom warning text"`.
  - To classify a post as Rebellious Takeover devlog, add `"forRebelliousTakeover": true`.
  - Filenames become the slug. The post's single-page URL is `jdrblog.html#/post/<filename-without-.md>`.
  - The site uses cache-busting when fetching posts, but when testing locally you can force a fresh fetch by reloading the page or restarting your local static server.

Try it locally (PowerShell):

```powershell
python -m http.server 8000
# then open http://localhost:8000/jdrblog.html in your browser
```
