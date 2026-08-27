/* ---------------------------------------------------------------
   projects.js  -  all site content lives here.

   Edit this by opening admin.html in your browser, or by hand.

   SITE_DATA has two parts:

   profile  -  the headshot and its crop, the resume download, and the
                degrees shown under the name.
   {
     headshot: {
       src:  "files/headshot.jpg",  // path to the image in this repo
       zoom: 2,                     // 1 = fit the frame width, higher = closer in
       x:    55,                    // the point of the image, left to right (%),
       y:    38                     // and top to bottom (%), centred in the frame
     }
   }
   The crop is applied with CSS, so the original photo is never altered.
   Drag and zoom it visually under "Headshot" in admin.html.

   entries  -  every project, article and blog post.

   A card shows `summary` and nothing else until someone presses Read more,
   at which point `body` opens in its place. Keep the summary to one line;
   an entry without one falls back to its first paragraph.
   {
     section: "baseball" | "football" | "basketball" | "hockey"
              | "health" | "markets" | "articles" | "blogs",
     title:   "Project name",
     summary: "The one line the card shows.",   // the rest opens on click
     year:    "2026",
     tags:    ["Front office tool"],        // shown after the year
     status:  "" | "in-progress" | "shelved",
     pinned:  true,                          // shows in "Start here" up top
     body:    ["First paragraph.", "Second paragraph."],
     stack:   "Python, PyMC, pandas",
     links:   [{ label: "View code", url: "https://..." }],
     files:   [{ name: "report.pdf", path: "files/report.pdf" }]
   }

   Counts on the Projects tab are calculated from this list,
   so you never have to update them.
--------------------------------------------------------------- */

window.SITE_DATA = {

  profile: {
    headshot: {
      src: "files/headshot.jpg",
      zoom: 2,
      x: 57.5,
      y: 39
    },

    /* The resume download button. The label is derived from the file
       extension, so swapping the .docx for a .pdf is the only change
       needed. Clear src to hide the button entirely. */
    resume: {
      src: "files/trey_chase_resume.docx"
    },

    /* Degrees, shown under the name. Each row stays on one line and the
       columns line up, so the degrees and schools read down the page.
       logo:     path to a school logo in this repo. Drop the official
                 file in and it appears; until then, or if the file is
                 missing, `initials` is drawn as a monogram instead.
       initials: 1 to 3 letters for that fallback.
       color:    background for that monogram, so it reads as the school's
                 even before a logo is added. Optional. */
    education: [
      {
        degree: "M.S. Statistical Science",
        school: "Duke University",
        logo: "files/duke.svg",
        initials: "D",
        color: "#012169"
      },
      {
        degree: "B.S. Mathematics",
        school: "Cal Poly San Luis Obispo",
        logo: "files/calpoly.svg",
        initials: "CP",
        color: "#154734"
      }
    ]
  },

  entries: [

    /* ---------------- BASEBALL ---------------- */
    {
      section: "baseball",
      title: "Bayesian Stuff+ index for MLB pitchers",
      summary: "One comparable grade per pitch type, built on run value per 100 pitches across three seasons of Statcast.",
      pinned: true,
      year: "2026",
      tags: ["Master's thesis", "Best portfolio, Duke Statistical Science"],
      status: "",
      body: [
        "Quantifying pitcher quality by modeling run value per 100 pitches against the physical properties of the pitch. ERA and WHIP confound a pitcher's own ability with his defense, his sequencing luck, and his park; velocity, spin, break, arm angle, extension, and plate location do not. Three seasons of Statcast, 2023 through 2025, aggregated to the pitcher by pitch-type by season level, with cells under 50 pitches dropped.",
        "One joint Bayesian Student-t regression across all eight pitch types, fit in brms and Stan: every predictor gets a pitch-type-specific slope, so what makes a slider good is allowed to differ from what makes a sinker good, and a pitcher-level random intercept pools information across a pitcher's whole arsenal. That partial pooling is doing the most work exactly where it is needed, on low-usage pitch types with few observations. The Student-t likelihood, with degrees of freedom estimated rather than assumed, absorbs the heavy tails a Gaussian would chase. Posterior fitted values are standardized within pitch type into a Stuff+ index where 100 is league average and higher is better.",
        "Convergence is clean, R-hat 1.006 with no divergent transitions, and the index passes face validity: higher Stuff+ tracks lower run value across all eight pitch types, and the top of each list is Chapman's sinker, Clase's cutter, and Yamamoto's split-finger. Plate height is among the most credible predictors nearly everywhere, which says command is foundational rather than incidental; horizontal break leads for four-seams and sinkers, extension and the velocity by vertical break interaction for cutters and sweepers. Prediction R-squared runs 0.114 to 0.164 by pitch type, and the report is direct about why: pitch-level outcomes are dominated by batter decisions and defense, and the point is to isolate the mechanics-driven component, not to maximize fit. Opponent quality is named as the next covariate worth adding."
      ],
      stack: "R, brms, Stan, Quarto",
      links: [
        { label: "Read the thesis", url: "files/quantifying-pitcher-quality.pdf", primary: true }
      ],
      files: []
    },
    {
      section: "baseball",
      title: "MLB Daily Report",
      summary: "Every game from the previous day, plus pitch run value, Bayesian win projections, and vig-free prop pricing.",
      pinned: true,
      year: "2025 to present",
      tags: ["Shiny dashboard", "Live"],
      status: "",
      body: [
        "A Shiny dashboard summarizing every MLB game from the previous day: box scores, the top hitting and pitching performances, monthly leaderboards, and click-through player cards carrying Statcast percentiles, pitch arsenals, movement profiles, and spray charts.",
        "A Pitch Run Value tab ranks individual pitches rather than pitchers, one row per pitcher per pitch type. A Win Projections tab carries a recursive Bayesian filter that projects every team's final win total with a 90 percent credible interval and tracks how each projection moves day by day. A Betting tab prices player props off posterior-predictive game logs and reports vig-free fair odds.",
        "The slow datasets are rebuilt once each morning by a scheduled job, validated, and published to a dataset repo the app reads from, so a page load never waits on the source APIs."
      ],
      stack: "R, Shiny, bslib, baseballr, Hugging Face, GitHub Actions",
      links: [
        { label: "Launch the app", url: "https://treychase.shinyapps.io/mlb_daily_report/", primary: true },
        { label: "Full documentation", url: "projects/mlb-daily-report.html" }
      ],
      files: []
    },
    {
      section: "baseball",
      title: "Expected outcomes and run values, Duke Baseball",
      summary: "Expected outcome models, a run value matrix, and the dashboards a new coaching staff reads them in.",
      year: "2024 to 2026",
      tags: ["Head of Data Analytics"],
      status: "",
      body: [
        "Gradient-boosted expected outcome models paired with run value calculators, delivered to a new coaching staff through Shiny dashboards with spray charts and strength and conditioning views. Also taught the undergraduate staff the R and statistics needed to keep it running.",
        "The run value matrix underneath the calculators is published here: what every outcome is worth in runs, given the count, the number of outs, and which bases are occupied. It is the table the apps price events against, and it is the only part that leaves the program. The dashboards, their code, and anything that could identify a player stay inside it."
      ],
      stack: "R, XGBoost, Shiny",
      links: [
        { label: "Open the run value matrix", url: "projects/run-value-matrix.html", primary: true }
      ],
      files: []
    },
    {
      section: "baseball",
      title: "OpenBiomechanics pitching dashboard",
      summary: "Pick a pitcher, watch the delivery in 3D, and read where the velocity comes from and what it costs the elbow.",
      pinned: true,
      year: "2024 to present",
      tags: ["Independent project", "Live"],
      status: "",
      body: [
        "Motion capture, force plates, and joint energy flow from the Driveline OpenBiomechanics pitching dataset, cleaned and aligned on one clock so a delivery can be read as a single picture: the 3D pose animating on a mound inferred from the foot markers, ground reaction force under each leg with the delivery phases shaded, and a body colored by the work each joint generated against the dataset.",
        "A Bayesian Lasso written from scratch in NumPy predicts release velocity from all 76 point-of-interest metrics at once, reaching roughly 0.8 R-squared and 2 mph RMSE out of sample. It returns a posterior rather than a point estimate, so the diagnostics show which mechanics actually carry the prediction. A mechanical efficiency score then separates velocity driven from the trunk and legs from velocity bought with elbow valgus torque, mapped to a dataset percentile so it reads across pitchers.",
        "It runs as a Gradio app on Hugging Face with a searchable pitcher picker, sourcing every file on demand rather than vendoring a dataset that is licensed non-commercially."
      ],
      stack: "Python, NumPy, Gradio, Plotly, Hugging Face Spaces",
      links: [
        { label: "Launch the dashboard", url: "https://huggingface.co/spaces/treychase/driveline-pitching", primary: true },
        { label: "Open the sample dashboard", url: "projects/driveline-dashboard.html" },
        { label: "Full documentation", url: "projects/driveline-pitching.html" },
        { label: "View code", url: "https://github.com/treychase/driveline-pitching" }
      ],
      files: []
    },
    {
      section: "baseball",
      title: "Driveline hitting dashboard",
      summary: "Pick a swing and read it: bat speed, weight shift, and predicted exit velocity against what the ball actually did.",
      year: "2026",
      tags: ["Independent project", "Live"],
      status: "",
      body: [
        "The same open motion capture turned on hitters: pick a swing and watch the skeleton and the bat move through contact, next to bat speed and the vertical force each leg puts into the ground on a timeline where zero is the ball.",
        "Exit velocity is modeled from eight biomechanics features with a Gaussian process, a Matern 3/2 kernel carrying one length scale per feature. It was chosen over a random forest and XGBoost on cross-validated RMSE, 6.16 mph against 6.57 and 6.71, and everything plotted is an out-of-fold prediction. One of the eight features is swing efficiency, bat speed over hand speed, which separates a hitter who generates barrel speed from one who is only moving his hands fast.",
        "A self-contained HTML page carries eight hitters from a 73.5 mph average exit velocity to 107.0, and a Streamlit app reaches any of the 687 swings with the download, the swing index, and the model fit all cached."
      ],
      stack: "Python, scikit-learn, Plotly, Streamlit, pandas",
      links: [
        { label: "Open the dashboard", url: "projects/driveline-hitting-dashboard.html", primary: true },
        { label: "Full documentation", url: "projects/driveline-hitting.html" },
        { label: "View code", url: "https://github.com/treychase/driveline-hitting" }
      ],
      files: []
    },

    /* ---------------- BASKETBALL ---------------- */
    {
      section: "basketball",
      title: "True shooting projection, Bayesian AR",
      summary: "What a player is likely to shoot next season, which is not the same question as what he shot last season.",
      year: "2026",
      tags: ["Front office tool"],
      status: "",
      body: [
        "An autoregressive model that predicts next-season true shooting percentage from age and prior shooting rates, fit both pooled and hierarchically so young players with short histories borrow strength from the league. Built for free agency decisions, where the question is not how a player shot last year but what he is likely to shoot next year."
      ],
      stack: "Python, PyMC, pandas",
      links: [{ label: "View code", url: "https://github.com/treychase" }],
      files: []
    },
    {
      section: "basketball",
      title: "Finding undervalued NBA players",
      summary: "A salary model that ranks production against what the market pays for it, and names who a rival could actually sign.",
      year: "2026",
      tags: ["Salary model"],
      status: "",
      body: [
        "Which players produce more than their contract pays for, and which of those could a team realistically sign? Basketball Reference per-game and advanced stats for 2025-26, joined to 2026-27 salaries, so last season's production is read against next season's pay: salary is set at signing, and regressing this year's pay on this year's production mostly recovers decisions made three offseasons ago. Counting stats are normalized to a per-36 rate, which splits the question in two, since minutes then carries role on its own and the rates carry productivity. Arithmetic identities and features correlated above 0.9 are pruned, leaving 28 across 370 players.",
        "Gradient boosted trees on log salary, grid searched with five-fold cross validation: 0.58 R-squared on the log scale out of sample and a mean absolute error around 5.7 million dollars. That supports ranking and screening, not pricing an individual contract. Rookie scale is an explicit feature rather than a hidden confound, and every player is scored twice by the fold that held him out, once as himself and once as an open-market player, so surplus is measured against open-market pricing instead of blending two regimes. The median CBA discount on a rookie deal comes out around half a million dollars.",
        "The market pays for volume and role, not efficiency: points, shots, and minutes correlate with pay between 0.6 and 0.75, while true shooting and the other rate statistics sit near zero. Two biases are structural rather than basketball, and the write-up is explicit about both: cheap players are predicted upward and expensive ones downward, and a tree ensemble cannot predict past the salary range it was trained on, so max-contract stars are forced into the overvalued tail no matter how they play. Filtering to players above the minimum band and off rookie scale leaves the twenty names a rival could actually pursue."
      ],
      stack: "Python, XGBoost, scikit-learn, pandas, Jupyter",
      links: [
        { label: "Read the report", url: "files/finding-undervalued-nba-players.pdf", primary: true },
        { label: "Read the notebook", url: "projects/nba-salary-model.html" }
      ],
      files: [
        { name: "nba_salary_model.ipynb", path: "files/nba_salary_model.ipynb" }
      ]
    },

    /* ---------------- HOCKEY ---------------- */
    {
      section: "hockey",
      title: "What makes a good skater",
      summary: "Seven games of tracking data reduced to a scout's question: who skates well, and how would you know from coordinates alone?",
      pinned: true,
      year: "2026",
      tags: ["Tracking data"],
      status: "",
      body: [
        "Seven games of positional tracking at twenty-five frames a second, roughly ninety thousand timestamps and one hundred twenty skaters, reduced to a question a scout would ask: who skates well, and how would you know from coordinates alone?",
        "Everything is measured in seconds against the feed's own clock rather than bucketed into whole seconds. Speed is a displacement over a one-second baseline, deliberately: the tracked positions are rounded to a tenth of a foot, and over a single frame that rounding alone is worth about 2.5 ft/s, enough to pin every skater to the 40 ft/s ceiling and rank nobody. Outliers are screened before anyone reaches a leaderboard, and shifts and line changes are read off the same feed.",
        "A replay puts the period back in motion: every skater and the puck moving across the rink at the speed it happened, with a scrub bar, playback speed, trails, and velocity arrows measured over that same one-second baseline. It draws to a canvas with the positions embedded, so it opens with nothing to install and nothing to fetch."
      ],
      stack: "Python, pyarrow, pandas, matplotlib",
      links: [
        { label: "Watch the replay", url: "projects/skater-tracking-dashboard.html", primary: true }
      ],
      files: []
    },

    /* ---------------- HEALTH ---------------- */
    {
      section: "health",
      title: "Projecting peak velocity from biomechanics",
      summary: "Which of these arms throws hardest in five years? Peak velocity projected from delivery mechanics, with the uncertainty kept.",
      year: "2025",
      tags: ["Research project"],
      status: "",
      body: [
        "A complex-league group of pitchers, a wide set of joint angles and segment velocities measured at foot plant, maximum external rotation, and ball release, and one question: which of them throws the hardest five years from now? That is a question about peak velocity rather than today's radar reading, so the target is the 95th percentile of a pitcher's velocity rather than his maximum, which is one noisy pitch.",
        "The unit of observation had to move first. Pitches per pitcher run from three to over four hundred, so pitch-level correlations are dominated by whoever threw the most and violate independence besides; everything collapses to one row per pitcher. Mechanics are winsorized to the 1st and 99th percentiles before that aggregation, because an outlier scan turned up tracking errors no body produces, a hip flexion of minus 260 degrees among them.",
        "Three models on the aggregated data: gradient boosting with SHAP as a nonlinearity check, a Bayesian LASSO with Laplace priors, and a regularized horseshoe following Piironen and Vehtari, both fit in PyMC on standardized predictors and a standardized target so the priors live on a common scale, and compared by PSIS-LOO. Projections carry 90 percent posterior predictive intervals, which include the pitcher-level residual scale, so they answer what velocity you would expect to see rather than where the mean sits. Every projection is then read against within-pool percentiles for each modeled metric, so a coach can see which mechanics put an arm at the top rather than being handed a ranking."
      ],
      stack: "Python, PyMC, XGBoost, SHAP, Streamlit, Docker",
      links: [
        { label: "Read the notebook", url: "projects/velocity-projection.html", primary: true }
      ],
      files: []
    },

    /* ---------------- MARKETS ---------------- */
    {
      section: "markets",
      title: "Bayesian stock forecasting",
      summary: "A week-ahead price distribution for a universe of stocks. The interval is the product, not the point.",
      year: "2026",
      tags: ["Course project, rewritten"],
      status: "",
      body: [
        "A local-level dynamic linear model on log prices, fit by Gibbs sampler: forward-filter backward-sample for the latent level, conjugate inverse-gamma draws for the observation and state variances. What comes out for each ticker is not a number but a distribution, the posterior predictive price five trading days ahead, and the universe is ranked by expected one-week return into projected top and bottom movers.",
        "The point forecast from a local-level model is, by construction, roughly where the price already is. That is the honest answer for a random walk, and it is why the useful output is the width of the band rather than the line down its middle: the interval widens with the horizon, and how fast it widens is what the model actually learned from that ticker's history.",
        "It began as an R and Quarto course project on a single stock and was rewritten in Python as a universe-wide engine with a dashboard and continuous integration. Every network call funnels through one module and a bundled sample dataset backs the tests, so the whole thing runs with no API access at all — which is exactly what the dashboard here is built from."
      ],
      stack: "Python, NumPy, pandas, Streamlit, Plotly",
      links: [
        { label: "Open the dashboard", url: "projects/stock-forecast-dashboard.html", primary: true },
        { label: "View code", url: "https://github.com/treychase/stock-time-series" }
      ],
      files: []
    }

    /* ---------------- ARTICLES and BLOGS ----------------
       Nothing here yet. Add entries with section "articles"
       or "blogs" and they will appear on those tabs.        */

  ]
};
