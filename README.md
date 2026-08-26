# treychase.github.io

Personal site for Trey Chase. Plain HTML, CSS and JavaScript, no build step
and no dependencies. GitHub Pages serves the files exactly as they sit here.

```
index.html          the site
admin.html          the editor, opens in a browser, writes data/projects.js
data/projects.js    all content: the headshot crop plus every entry
files/              headshot, resume PDF, anything attached to an entry
.nojekyll           tells Pages to serve the files as-is
```

## Editing the site

Open `admin.html` in a browser. Two ways to save what you change:

**Connected.** Press *Connect*, fill in the repository details and paste a
GitHub token, then press *Publish*. Changes commit straight to the repo and go
live once Pages rebuilds. Create a fine-grained personal access token scoped to
this one repository with a single permission, `Contents: Read and write`. The
token is held in the tab's memory only, so closing the tab forgets it — nothing
is written to disk or to local storage.

**Offline.** Skip Connect, edit, then press *Download* and replace
`data/projects.js` with the file it gives you and commit that.

## Cards open on click

A card shows `summary` — one line, written for that spot — and nothing else.
Pressing *Read more* swaps in `body`, the full description, and *Show less*
puts it back. Categories read as a list of projects rather than a wall of
prose, and nothing is lost: the long version is one click away.

```js
{ title:   "Finding undervalued NBA players",
  summary: "A salary model that ranks production against what the market pays for it.",
  body:    ["The full description, one string per paragraph.", "..."] }
```

Write the summary as a sentence that stands on its own, not a truncation of the
first paragraph — the two are never shown at the same time. An entry with no
summary falls back to its first paragraph, and then the toggle only appears if
there are further paragraphs behind it, so nothing is ever hidden without a way
to open it. Articles and Blogs rows show the summary alone with no toggle,
since the whole row is already a link. Printing ignores the toggle and prints
every description in full.

Every card on the site links to something you can open — a report, a notebook,
a dashboard or a live app. An entry with nothing to click does not earn a card;
either give it an artifact or leave it off.

Everything on the Projects, Articles and Blogs tabs comes from
`data/projects.js`. An entry's `section` is one of `baseball`, `football`,
`basketball`, `hockey`, `health`, `articles` or `blogs`; the first five are the
category squares on the Projects tab, and each is deep-linkable by hash, so
`index.html#hockey` opens that category directly. Adding a new category means
adding it to `CATEGORIES`, `LABELS`, `EMPTY` and `SURFACES` in `index.html` and
to `SECTIONS` in `admin.html`. The counts on the category squares are derived from it, so
they never need updating by hand. The Resume tab is static markup in
`index.html`.

## The resume

The Resume tab's download button is driven by `profile.resume.src` in
`data/projects.js` and takes its label from that file's extension, so a PDF
reads *Download PDF* and a Word file reads *Download DOCX*. Upload a new one
from *Connect → Site files* in the editor and the path updates itself. Clearing
`src` hides the button rather than leaving a link that 404s.

It currently points at `files/trey_chase_resume.docx`, the Word file in the
repo. A PDF is the better thing to hand someone from a portfolio site: export
one and upload it, and the button relabels itself with no other change.

## School logos

The degrees under the name each have a logo slot, set in `profile.education`
in `data/projects.js`:

```js
{ degree: "M.S. Statistical Science", school: "Duke University",
  logo: "files/duke.svg", initials: "D", color: "#012169" }
```

Until a file exists at `logo`, or if it fails to load, the site draws `initials`
as a monogram in `color`, so the row never shows a broken image. The browser
does log a harmless 404 for the missing file while the path is set and the file
is not there; clearing `logo` silences it if you would rather wait. Save the
official artwork as `files/duke.svg` and `files/calpoly.svg` and it appears with
no other change. Both universities publish their marks with usage terms
attached — Duke through its brand guide, Cal Poly through University Marketing —
so download them from there rather than pulling a copy off a search result.

## The headshot

Press *Headshot* in the editor's top bar. The frame shown is the exact shape
the site uses: drag the photo to position it, use the zoom slider to move in
and out, and the crop is saved as three numbers in `data/projects.js`:

```js
profile: { headshot: { src: "files/headshot.jpg", zoom: 2, x: 55, y: 38 } }
```

`zoom` is how far in you are, where 1 fits the frame width. `x` and `y` are the
point of the photo, as percentages, that sits in the middle of the frame. The
crop is applied with CSS at page load, so **the original photo is never
modified** — re-crop it any time without needing the original again.

The values above are preset for the NBA National Intern Day 2025 poster: they
pull a head-and-shoulders portrait out of the white studio panel and leave the
blue border and the "Summer Internship" bar outside the frame. Drop that image
in at `files/headshot.jpg` and it is already framed correctly.

Until an image exists at that path the site falls back to a green `TC`
monogram, so nothing looks broken while the file is missing.

## Adding a project

Every entry on the Projects, Articles and Blogs tabs is a row in
`data/projects.js`, added through *Add entry* in the editor. Two things
usually hang off an entry.

### Linking a GitHub repository

Add a link on the entry with the repository URL:

| Label | URL |
| --- | --- |
| `View code` | `https://github.com/treychase/nba-salary-model` |

Links with a full URL open in a new tab. The first link on an Articles or Blogs
entry also becomes the headline link for that row.

### Publishing a rendered Quarto document

Render the `.qmd` to a **single self-contained HTML file**, so there is no
sidecar `_files/` directory to keep in sync:

```bash
quarto render analysis.qmd --to html -M embed-resources:true
```

Drop the result into `projects/` in this repo under a readable name, commit it,
and point a link at that path:

```
projects/stuff-plus.html
```

| Label | URL |
| --- | --- |
| `Read the report` | `projects/stuff-plus.html` |

Three worked examples live in `projects/`, each a full documentation page styled
to match the site and reached from its project card:

| Page | Project |
| --- | --- |
| `projects/mlb-daily-report.html` | MLB Daily Report |
| `projects/driveline-pitching.html` | OpenBiomechanics pitching dashboard |
| `projects/driveline-hitting.html` | Driveline hitting dashboard |

Two more pages in `projects/` are converted notebooks rather than write-ups:
`nba-salary-model.html` and `velocity-projection.html`. Both were produced with
`jupyter nbconvert --to html --embed-images`, then edited the same way — see
the note under *Publishing a rendered Quarto document* below.

## The hosted dashboards

Four files in `projects/` are not write-ups but the dashboards themselves,
each a single self-contained page, so a project card can link to something that
loads immediately rather than waiting on a Space to wake up:

| File | Built by | Rebuild with |
| --- | --- | --- |
| `projects/driveline-dashboard.html` | [driveline-pitching](https://github.com/treychase/driveline-pitching) | `python dashboard_html.py --out dashboard.html` |
| `projects/driveline-hitting-dashboard.html` | [driveline-hitting](https://github.com/treychase/driveline-hitting) | `save_dashboard(swing_dashboard(...))`, see that repo's README |
| `projects/skater-tracking-dashboard.html` | `tools/` in this repo, from the player-tracking analysis repo | `python tools/build_skater_dashboard.py --games-dir <that repo>/games` |
| `projects/run-value-matrix.html` | `tools/` in this repo, from the run values repo | `python tools/build_run_values_page.py --rds <that repo>/master_run_values.rds` |

Screenshots for the project pages sit in `files/driveline/` and
`files/driveline-hitting/`.

The skater replay is the one built here rather than copied in. `tools/` holds
the two halves: `build_skater_dashboard.py` reads one period out of the
`games/*.parquet` files in the tracking analysis repo and writes the positions
into `skater_dashboard_template.html`, which draws the rink on a canvas and
replays them. The rink geometry and palette are copied from `viz_functions.py`
in that repo, so the web rink and the matplotlib one are the same rink; the positions
are embedded as integers in tenths of a foot, the resolution the feed carries,
which is what keeps a whole twenty-minute period under a megabyte and a half.
The generator belongs with its data and can move into the analysis repo
whenever that repo is the one being edited.

`build_run_values_page.py` works the same way for the run value matrix, reading
`master_run_values.rds` and writing it into `run_values_template.html` as a
diverging heatmap. **Output only, deliberately.** The team's dashboards and
their code stay private; what is published is a table of run value by outcome,
count, outs and base state, which carries no player, game or date. Keep it that
way when regenerating: the check is that nothing identifying anybody ends up in
the payload.

Both copies carry two things appended at the bottom of the file: the footer
described under *Copyright* below, and a short script that starts the animation
that is on screen, at the frame duration the figure's own Play button
specifies. Plotly's own auto-play runs at its 500 ms default, which is
slow enough that a swing or a delivery reads as a still image, and on the
tabbed pitching dashboard it also animated the panels behind `display:none`.
The pitching fix is upstream in `dashboard_html.py`, so a rebuilt file already
carries it; the hitting one is added to the copy here. Re-apply it after
replacing either file — or rebuild from a repo that has it.

Tick **Button** on a link to render it as a filled call to action rather than a
plain arrow link — useful for a "Launch the app" link that should stand out.
Links to a full URL open in a new tab; repo-relative ones open in place.

The link field takes a repo-relative path as happily as a full URL. The page is
served straight from Pages at `https://treychase.github.io/projects/stuff-plus.html`,
so the report keeps working even if someone opens it on its own.

If you would rather not embed everything, `quarto render` without
`embed-resources` produces `analysis.html` plus an `analysis_files/` folder;
copy both into `projects/` and keep them together. `.nojekyll` in the repo root
is what stops GitHub Pages from discarding folders whose names begin with an
underscore, which is exactly what Quarto generates, so leave that file in place.

The alternative is to publish the document from its own repository with
`quarto publish gh-pages` and link out to it with a full URL. That keeps this
repository smaller, at the cost of the report living at a different address.

Notebooks work the same way: `jupyter nbconvert --to html --embed-images
notebook.ipynb` produces a single file for `projects/`.
`projects/nba-salary-model.html` and `projects/velocity-projection.html` are the
worked examples, each with the same two edits made to the converted file:

- **The MathJax script tag is deleted.** nbconvert loads MathJax from a CDN and
  configures `$...$` as inline math, so a page discussing salaries renders
  "under $10M with a thin tail running past $60M" as an italic equation. Nothing
  in that notebook is LaTeX, so dropping the tag both fixes the text and leaves
  the page genuinely self-contained. Keep it if a notebook actually uses math,
  and escape the dollar signs instead.
- **A bar back to the site is prepended** to `<body>`, and the footer from
  *Copyright* is appended, since a converted notebook is otherwise a dead end
  with no way back to the site.

The nbconvert output also carries a mermaid loader, but it exits before
requesting anything when the notebook has no mermaid diagrams, so it can stay.

## Copyright

Every page carries `© 2026 Trey Chase` in its footer. `index.html` and the four
hand-styled pages in `projects/` share the same `<footer class="wrap">` markup,
so a new project page gets it by copying an existing one. The three generated
pages — the converted notebook and the two dashboards — cannot inherit it, so
they carry an inline-styled `<footer>` appended before `</body>`; re-add it
after regenerating any of those files, along with the play script noted above.

Bumping the year is a find and replace across those eight files:

```bash
grep -rl '© 2026 Trey Chase' index.html projects/*.html \
  | xargs sed -i 's/© 2026 Trey Chase/© 2027 Trey Chase/'
```

## Publishing on GitHub Pages

The repository is named `treychase.github.io`, which is what a GitHub Pages
**user site** requires, so it publishes to `https://treychase.github.io`.

In *Settings → Pages*, set the source to the `main` branch, folder `/ (root)`.
Every path in the site is relative, so it also works unchanged if served from
a subdirectory.
