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
              | "health" | "markets" | "writing",
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

    /* ---------------- FOOTBALL ---------------- */
    {
      section: "football",
      title: "NFL receiver and coverage scouting",
      summary: "Separation, passer rating allowed, and a calibrated catch probability model over every targeted pass of the 2023 season.",
      pinned: true,
      year: "2026",
      tags: ["Front office tool", "NFL Big Data Bowl 2026"],
      status: "",
      body: [
        "Every targeted pass of the 2023 NFL season, 14,057 of them, measured at two moments. The first is the release: how much separation the receiver had, who was covering him, and where the defence was standing relative to where the ball was actually going. The second is the flight - the half second to two seconds while the ball is in the air. The Big Data Bowl 2026 release ships the ball's landing spot alongside the tracking, which makes that second window the only place in this kind of data where a receiver and a defender can be watched reacting to the same known destination and compared on what each did about it.",
        "The scouting output is four tables. Separation at the throw and again on arrival, with an open rate at the three-yard threshold Next Gen Stats uses, so the numbers sit alongside the published ones. Passer rating allowed for every coverage defender. Every route type against man, against zone, and against each coverage shell. And the flight itself: acceleration, best half-second burst and total change of direction for the receiver, and for the defender how much of his angle to the ball he clawed back once it was thrown, how directly he closed on the landing spot, and how fast he shut the gap.",
        "Catch probability is a gradient boosted model over release-time geometry, validated out of fold and grouped by game so that no play is scored by a model that had seen another snap from the same game. It reaches 0.803 AUC and a 0.156 Brier score against 0.494 and 0.213 for the league base rate, and it is calibrated to within two points in every decile - which is what makes catch rate over expected worth reading as a statement about hands rather than about the model's bias. The features stop at the release on purpose. Feeding it the receiver's distance to the ball at the moment the ball arrives would take it past 0.95 AUC and teach it nothing except that a receiver standing on the ball caught it, so the post-release columns are enumerated in code and the test suite fails the build if one reaches the feature list.",
        "Two findings the tables keep returning to. Separation is a position statistic before it is a skill statistic - the leaderboard is running backs from top to bottom, because a back released into the flat is open by ten yards for the simple reason that nobody is covering him there. And every route type is caught more often against zone than against man, but the gap is widest on the routes that are hardest anyway: a go route is completed 39 percent of the time against man and 44 against zone, while a hitch runs 67 and 78.",
        "The dashboard draws all 14,057 plays. Filter to a receiver, a route, a coverage or a week, and any play animates on the field with the route, both flight paths and the landing spot. The season's tracking geometry is packed into base64 typed arrays with the repeated text interned, which is what gets a season of positional data into a page that needs nothing at view time."
      ],
      stack: "Python, scikit-learn, pandas, NumPy, SciPy, pytest",
      links: [
        { label: "Open the dashboard", url: "projects/nfl-scouting.html", primary: true },
        { label: "View code", url: "https://github.com/treychase/NFL_big_data_bowl_2026" }
      ],
      files: []
    },

    /* ---------------- BASKETBALL ---------------- */
    {
      section: "basketball",
      title: "NBA scouting dashboard",
      summary: "Pick a team and a player: shot chart, shooting and touch percentiles, box plus/minus and win shares, and two clusterings — the archetype they play like and the tier they belong to.",
      pinned: true,
      year: "2026",
      tags: ["Tracking data", "Front office tool", "Clustering"],
      status: "",
      body: [
        "A scouting page over the league's tracking and shot chart pulls for 2025-26. Pick a team, pick a player, and get their shot chart with hex size carrying volume and hex colour carrying their field goal percentage against the league's from that same spot, so a chart says where a player is actually better than the shot is rather than only where he takes it. Alongside it, rim, mid-range, three-point and effective field goal percentages, and the share of his touches taken in the paint, the post and at the elbow, each ranked against everyone who clears that row's attempt or touch floor.",
        "The archetype is the part that is not a box score. Position labels stopped describing how NBA players are used a while ago, so every player is clustered on what he actually does with the ball across fifteen tracking features, all taken as per-36 rates so the clustering finds roles rather than rediscovering the minutes rotation. The number of clusters comes off the silhouette score instead of being picked by hand, and each cluster is named by matching its centre against prototype weight vectors; a cluster defined only by what its players do not do is called a low-usage role player rather than borrowing a name it has not earned. Players under 250 minutes are left unclustered, because rate stats on that few minutes would move the cluster centres more than they would describe the player.",
        "This season it settles on seven archetypes over the 450 players who qualify, and the neighbourhoods hold up: Jokic, Sengun, Embiid and Wembanyama land together as post scorers, Gobert as a rim-running big and Holmgren as a stretch big, Gilgeous-Alexander next to Booker, Edwards and Mitchell as primary creators. Every player also gets his six closest neighbours in the same feature space, which reads as used the same way rather than scores the same amount, and each one is clickable.",
        "Box plus/minus and win shares per 48 sit alongside them, which took some doing: the pulls carry no box score, so one is reconstructed. Points and minutes come from the possessions pull, field goals from the shot chart, free throws from the difference between the two, and rebounds, assists, steals, blocks and rim defence from the tracking pulls; summed over the league it lands on the season's real per-team-game rates, which is the check that nobody is being dropped or double counted. Turnovers are the one estimate. Every box event is then priced in points against what a possession is worth, with the estimated prices kept in one table rather than buried in a formula, and one term earns its own paragraph: the tracking pull credits a rim attempt to whoever was nearest, and being nearest is an assignment rather than a choice — a guard is the closest defender at the rim mostly when he has already been beaten. The league shows it, 72% allowed by the defenders who face the fewest attempts against 60% by those who face the most, so the baseline moves with volume instead of paying every centre and charging every guard.",
        "Stars are a second clustering, deliberately on the axis the archetypes throw away. The archetypes divide volume out because their question is what a player does, which is exactly why they cannot tell a bench guard from a franchise guard who takes the same shots; the tiers put volume back in, on per-game features, and are named by where their centres rank rather than by hand. It lands on five tiers and 27 stars, and the top of that list is Jokic, Antetokounmpo, Gilgeous-Alexander, Wembanyama and Doncic — which is the point: star is where the league separates rather than a number somebody picked."
      ],
      stack: "Python, scikit-learn, pandas, Streamlit",
      links: [
        { label: "Open the dashboard", url: "projects/nba-scouting.html", primary: true },
        { label: "View code", url: "https://github.com/treychase/nba-stats" }
      ],
      files: []
    },
    {
      section: "basketball",
      title: "Projected true shooting",
      summary: "What a player is likely to shoot next, which is not the same question as what he shot.",
      pinned: true,
      year: "2026",
      tags: ["Front office tool", "Hierarchical model"],
      status: "",
      body: [
        "A rotation big with 180 attempts at 64% is mostly telling you about variance, and taking that number at face value is how a team talks itself into a contract. This estimates every player's true shooting by pulling what he shot toward the players who are used the way he is used, by an amount his own volume decides. A thousand-attempt starter keeps almost all of his own number; a hundred-attempt reserve is written mostly in terms of his archetype.",
        "Getting true shooting out of the data at all took an arithmetic detour, since the committed pulls carry no box score. Season points come from the possessions tracking and every made field goal comes from the shot chart, so free throws made are points minus what the field goals were worth: exact, not estimated, and non-negative for all 450 players. Turning makes into attempts needs a free throw percentage, taken from the fouls the tracking data does cover and pooled toward the league first, because nine tracked makes should not buy a player a perfect stroke.",
        "The model itself is the hierarchical normal one, which has a closed-form posterior mean and needs no sampler. Two choices do the work. The pool is the player's archetype rather than the league, so a low-volume rim-running big is measured against other rim-running bigs instead of an average that includes pull-up guards. And the pooling constant is fitted rather than picked: splitting the season by date and asking which value best predicts the second half from the first puts it at 140 attempts. Pooling there cuts held-out error 18% overall and 28% for players under a hundred attempts, which is the whole argument, since that is exactly where a season is too short to tell a hot stretch from a shooter."
      ],
      stack: "Python, NumPy, pandas, scikit-learn, Streamlit",
      links: [
        { label: "Open the dashboard", url: "projects/true-shooting-projection.html", primary: true },
        { label: "View code", url: "https://github.com/treychase/nba-stats" }
      ],
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
      summary: "A hidden Markov model with a DLM in each of two regimes, forecasting the next week as a distribution rather than a number.",
      year: "2026",
      tags: ["Course project, rewritten"],
      status: "",
      body: [
        "A hidden Markov model with two states and a local-level dynamic linear model inside each of them, fit on log prices by Gibbs sampler. One regime is calm and one is volatile; the two DLMs differ in how far the price level is allowed to move underneath and how noisy the observation is, and a hidden chain decides which regime each day belongs to. The sweep alternates four conditionals: the level path by forward-filter backward-sample under the variances the current regime implies, the regime path by the same trick over the discrete chain, conjugate inverse-gamma draws for each regime's variances, and Dirichlet draws for the transition matrix.",
        "Regimes are ordered by evolution variance and relabelled whenever a draw violates the ordering, because two exchangeable states can swap mid-run and smear every regime-specific number into the average of the two. The payoff is that the forecast propagates the chain and the level forward together, so the seven-day predictive distribution is a mixture over regime paths rather than one Gaussian: calm today inside a jumpy regime is a wider band than calm and sticky.",
        "The point forecast from a local-level model is, by construction, roughly where the price already is. That is the honest answer for a random walk, and it is why the useful output is the width of the band rather than the line down its middle: how fast the interval widens, and which regime it widens from, is what the model actually learned from that ticker's history.",
        "The dashboard is built from the project's offline sample, which is generated as a constant-volatility random walk. There are no regimes in it to find, and the model correctly finds none: the smoothed probability of the volatile state comes out flat on every day of every ticker, so nothing on the chart is shaded as turbulent. It separates a genuinely volatile stretch from a calm one when there is one to separate, which the test suite checks against data with a known regime change. A model that reports no structure where there is none is worth more than one that always finds something.",
        "It began as an R and Quarto course project on a single stock and was rewritten in Python as a universe-wide engine with a dashboard and continuous integration. Every network call funnels through one module and a bundled sample dataset backs the tests, so the whole thing runs with no API access at all — which is exactly what the dashboard here is built from."
      ],
      stack: "Python, NumPy, pandas, Streamlit, Plotly",
      links: [
        { label: "Open the dashboard", url: "projects/stock-forecast-dashboard.html", primary: true },
        { label: "View code", url: "https://github.com/treychase/stock-time-series" }
      ],
      files: []
    }

    /* ---------------- WRITING ----------------
       Nothing here yet. Add entries with section "writing"
       and they will appear on that tab. Articles and shorter
       posts share it; use a tag to say which one an entry is. */

  ]
};
