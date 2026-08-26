/* ---------------------------------------------------------------
   projects.js  -  all site content lives here.

   Edit this by opening admin.html in your browser, or by hand.

   SITE_DATA has two parts:

   profile  -  the headshot and its crop.
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
   {
     section: "baseball" | "football" | "basketball" | "hockey"
              | "health" | "articles" | "blogs",
     title:   "Project name",
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
      x: 55,
      y: 38
    }
  },

  entries: [

    /* ---------------- BASEBALL ---------------- */
    {
      section: "baseball",
      title: "Bayesian Stuff+ index for MLB pitchers",
      pinned: true,
      year: "2026",
      tags: ["Master's portfolio", "Best portfolio, Duke Statistical Science"],
      status: "",
      body: [
        "A continuous pitch-quality index built on multi-year Statcast data, modeled with a Student-t likelihood, pitch-type-specific slopes, and pitcher-level random intercepts. The result is one comparable grade per pitch type that a coach can read without a stats background."
      ],
      stack: "R, brms, Stan, Quarto",
      links: [],
      files: []
    },
    {
      section: "baseball",
      title: "Daily reporting dashboard",
      year: "2025",
      tags: [],
      status: "in-progress",
      body: [
        "An interactive dashboard summarizing every day of the MLB season: batter and pitcher profile views, Stuff+ metrics, percentile rankings, and leaderboards. An automated pipeline pulls from the MLB Stats API, Baseball Savant, Baseball Reference, and FanGraphs each morning, precomputes to cloud storage, and falls back to a live fetch when the cache misses.",
        "A recursive Bayesian layer projects outcomes with a 90 percent credible interval, updated daily through conjugate Beta-Bernoulli filtering."
      ],
      stack: "R, Shiny, tidyverse, public APIs",
      links: [],
      files: []
    },
    {
      section: "baseball",
      title: "Expected outcomes model, Duke Baseball",
      year: "2024 to 2026",
      tags: ["Head of Data Analytics"],
      status: "",
      body: [
        "Gradient-boosted expected outcome models paired with run value calculators, delivered to a new coaching staff through Shiny dashboards with spray charts and strength and conditioning views. Also taught undergraduate staff the R and statistics needed to keep it running."
      ],
      stack: "R, XGBoost, Shiny",
      links: [],
      files: []
    },
    {
      section: "baseball",
      title: "Cumulative OPS trajectories",
      year: "2026",
      tags: [],
      status: "in-progress",
      body: [
        "A Statcast pull that turns raw pitch events into a season-to-date OPS series for every hitter averaging at least two at bats per game, one row per player per day. Built as the input layer for time series models of how a hitter's season actually unfolds."
      ],
      stack: "Python, pybaseball, pandas",
      links: [],
      files: []
    },
    {
      section: "baseball",
      title: "Motion and sensor analysis, Driveline",
      year: "2024",
      tags: ["Independent project"],
      status: "",
      body: [
        "Cleaning, transformation, and analysis of a large open-source motion capture and sensor dataset to assess pitcher performance, with findings framed around development decisions rather than model fit."
      ],
      stack: "Python, pandas",
      links: [],
      files: []
    },

    /* ---------------- BASKETBALL ---------------- */
    {
      section: "basketball",
      title: "True shooting projection, Bayesian AR",
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
      title: "Salary model and pricing tool",
      year: "2026",
      tags: [],
      status: "in-progress",
      body: [
        "A gradient-boosted model that prices a player's next contract from his production, tuned by grid search and cross validation, with counting stats normalized to a per-36 rate and minutes kept as its own feature. Conformalized quantile intervals turn a point estimate into a defensible price range.",
        "The goal is to surface players a team can sign below what they are worth, so a clustering step adds shot-location and defensive archetypes as a predictor: stretch big against rim protector, three-and-D wing against point forward."
      ],
      stack: "Python, XGBoost, scikit-learn, Jupyter",
      links: [],
      files: []
    },
    {
      section: "basketball",
      title: "Positional scarcity and replacement level",
      year: "2026",
      tags: [],
      status: "in-progress",
      body: [
        "What a roster spot is actually worth depends on how deep the league is at that position. This project sets a replacement baseline by position and prices production against it, so a front office can compare offers across positions on one scale."
      ],
      stack: "Python, pandas",
      links: [],
      files: []
    },
    {
      section: "basketball",
      title: "NBA data warehouse, 2000 to present",
      year: "2026",
      tags: ["Infrastructure"],
      status: "",
      body: [
        "A scraper that pulls every season since 2000-01 into a single combined table: base box score and advanced production, plus all player tracking categories, drives, defense, catch and shoot, passing, pull-up, rebounding, speed and distance, and elbow, post, and paint touches. It is the shared foundation the shooting, salary, and valuation projects all read from."
      ],
      stack: "Python, nba_api, pandas",
      links: [],
      files: []
    },
    {
      section: "basketball",
      title: "Player projection system",
      year: "2025",
      tags: ["Personal project"],
      status: "",
      body: [
        "A player projection system following DARKO methodology, aging curves and prior-informed updates applied to per-possession production."
      ],
      stack: "Python",
      links: [],
      files: []
    },
    {
      section: "basketball",
      title: "Shot quality grade",
      year: "2026",
      tags: [],
      status: "shelved",
      body: [
        "A grading metric that scores a shot on shooter efficiency plus tracking context rather than outcome alone. Shelved after the public tracking feeds turned out to be aggregated by season instead of by possession, which is not enough resolution for the version worth building."
      ],
      stack: "Python, nba_api",
      links: [],
      files: []
    },

    /* ---------------- HOCKEY ---------------- */
    {
      section: "hockey",
      title: "What makes a good skater",
      pinned: true,
      year: "2026",
      tags: ["Tracking data"],
      status: "",
      body: [
        "Seven games of positional tracking data, roughly ninety thousand timestamps and one hundred twenty skaters, reduced to a question a scout would ask: who skates well, and how would you know from coordinates alone?",
        "The pipeline downsamples every feed to whole-second frames so that speed, acceleration, and change of direction are all measured against the same one-second interval, then screens outliers before any player is ranked. A rink view plots all skaters and the puck for a chosen game and period, with a time slider to step through a shift."
      ],
      stack: "Python, pyarrow, pandas, matplotlib",
      links: [],
      files: []
    },

    /* ---------------- HEALTH ---------------- */
    {
      section: "health",
      title: "Compliance dashboards, NBA",
      year: "2025 to 2026",
      tags: ["Data Analyst"],
      status: "",
      body: [
        "The league's first compliance dashboards for a new large-scale assessment program, covering assessment window logic, team-level completion views, edit tracking, and a full audit trail so any number on screen can be traced back to who changed it and when."
      ],
      stack: "Python, Streamlit, Snowflake, Polars",
      links: [],
      files: []
    },
    {
      section: "health",
      title: "Sensor data pipeline",
      year: "2025 to 2026",
      tags: ["Data Analyst"],
      status: "",
      body: [
        "An end-to-end automated pipeline for high-volume sensor and operational data, built with data engineering, replacing manual processing and feeding the longitudinal views that analysts use to spot trends across seasons."
      ],
      stack: "Python, SQL, Snowflake",
      links: [],
      files: []
    },
    {
      section: "health",
      title: "Pitcher biomechanics, Phillies FCL",
      year: "2025",
      tags: ["Research project"],
      status: "",
      body: [
        "Biomechanical modeling of complex league pitchers using Bayesian LASSO and horseshoe priors to pull signal out of a wide, correlated set of mechanical measurements, with a boosted model as a benchmark. Results are delivered through an interactive figure a coach can click through joint by joint."
      ],
      stack: "Python, PyMC, XGBoost, Streamlit, Plotly",
      links: [],
      files: []
    },
    {
      section: "health",
      title: "Survival analysis for availability",
      year: "2025",
      tags: ["Graduate coursework"],
      status: "",
      body: [
        "Time-to-event methods applied to questions of who is available and for how long, including multilevel and mixed-effects models for repeated measures on the same athlete."
      ],
      stack: "R, survival, tidyverse",
      links: [],
      files: []
    }

    /* ---------------- ARTICLES and BLOGS ----------------
       Nothing here yet. Add entries with section "articles"
       or "blogs" and they will appear on those tabs.        */

  ]
};
