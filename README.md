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

Everything on the Projects, Articles and Blogs tabs comes from
`data/projects.js`. The counts on the category squares are derived from it, so
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

## Publishing on GitHub Pages

The repository is named `treychase.github.io`, which is what a GitHub Pages
**user site** requires, so it publishes to `https://treychase.github.io`.

In *Settings → Pages*, set the source to the `main` branch, folder `/ (root)`.
Every path in the site is relative, so it also works unchanged if served from
a subdirectory.
