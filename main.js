(function () {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const username = (cfg.githubUsername || "").trim();
  const resumeUrl = (cfg.resumeUrl || "").trim();
  const hasGithub = username.length > 0;
  const githubProfile = hasGithub
    ? `https://github.com/${encodeURIComponent(username)}`
    : "#";

  const resumeModal = document.getElementById("resume-modal");
  const openResumeNav = document.getElementById("open-resume-nav");
  const openResumeBtn = document.getElementById("open-resume-btn");
  const closeResumeModalBtn = document.getElementById("close-resume-modal");
  const resumeFrame = document.getElementById("resume-frame");
  const resumeFallback = document.getElementById("resume-fallback");

  function openResumeModal(event) {
    if (event) event.preventDefault();
    if (!resumeModal) return;
    if (resumeFrame && resumeFallback) {
      if (resumeUrl) {
        resumeFrame.hidden = false;
        resumeFallback.hidden = true;
        resumeFrame.src = resumeUrl;
      } else {
        resumeFrame.hidden = true;
        resumeFallback.hidden = false;
      }
    }
    resumeModal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeResumeModal() {
    if (!resumeModal) return;
    resumeModal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  if (openResumeNav) openResumeNav.addEventListener("click", openResumeModal);
  if (openResumeBtn) openResumeBtn.addEventListener("click", openResumeModal);
  if (closeResumeModalBtn) {
    closeResumeModalBtn.addEventListener("click", closeResumeModal);
  }
  if (resumeModal) {
    resumeModal.addEventListener("click", function (event) {
      if (event.target === resumeModal) closeResumeModal();
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && resumeModal && !resumeModal.hidden) {
      closeResumeModal();
    }
  });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const heroName = document.querySelector(".hero-name");
  if (heroName && cfg.displayName) heroName.textContent = cfg.displayName;

  const heroRole = document.querySelector(".hero-role");
  if (heroRole && cfg.heroRole) heroRole.textContent = cfg.heroRole;

  const heroGithub = document.getElementById("hero-github-link");
  if (heroGithub) {
    if (hasGithub) {
      heroGithub.href = githubProfile;
    } else {
      heroGithub.style.display = "none";
    }
  }

  const contactEmail = document.getElementById("contact-email");
  if (contactEmail && cfg.contactEmail) {
    contactEmail.href = `mailto:${cfg.contactEmail}`;
    contactEmail.textContent = cfg.contactEmail;
  }

  const contactGithubWrap = document.getElementById("contact-github-wrap");
  const contactGithub = document.getElementById("contact-github");
  if (!hasGithub) {
    if (contactGithubWrap) contactGithubWrap.style.display = "none";
  } else if (contactGithub) {
    contactGithub.href = githubProfile;
  }

  const activitySection = document.getElementById("activity");
  const activityGraphLink = document.getElementById("activity-graph-link");
  const activityGraphImg = document.getElementById("activity-graph-img");
  const activityFallback = document.getElementById("activity-fallback");
  if (activitySection && activityGraphLink && activityGraphImg && activityFallback) {
    if (!hasGithub) {
      activitySection.hidden = true;
    } else {
      activityGraphLink.href = githubProfile;
      const cacheBust = "t=" + String(Date.now());
      const activityGraphUrl =
        "https://github-readme-activity-graph.vercel.app/graph?username=" +
        encodeURIComponent(username) +
        "&theme=github-dark&hide_border=true&area=true&" +
        cacheBust;
      const activityFallbackUrl =
        "https://ghchart.rshah.org/6ee7b7/" +
        encodeURIComponent(username) +
        "?" +
        cacheBust;
      let usingFallbackGraph = false;
      activityGraphImg.src = activityGraphUrl;
      activityGraphImg.addEventListener("error", function () {
        if (!usingFallbackGraph) {
          usingFallbackGraph = true;
          activityGraphImg.src = activityFallbackUrl;
          return;
        }
        activityGraphImg.hidden = true;
        activityFallback.hidden = false;
      });
      activityGraphImg.addEventListener("load", function () {
        activityGraphImg.hidden = false;
        activityFallback.hidden = true;
      });
    }
  }

  const root = document.getElementById("projects-root");
  const status = document.getElementById("projects-status");
  if (!root || !status) return;

  if (!hasGithub) {
    status.textContent =
      "Add your GitHub username in config.js to list public repositories here.";
    status.classList.remove("is-error");
    return;
  }

  const apiUrl = `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`;

  fetch(apiUrl)
    .then(function (res) {
      if (!res.ok) throw new Error(res.status === 404 ? "User not found" : "Could not load repos");
      return res.json();
    })
    .then(function (repos) {
      status.remove();
      const list = Array.isArray(repos) ? repos : [];
      const visible = list.filter(function (r) {
        return !r.fork && !r.archived;
      });
      const show = visible.length ? visible.slice(0, 8) : list.slice(0, 8);

      if (show.length === 0) {
        const p = document.createElement("p");
        p.className = "projects-status";
        p.textContent = "No public repositories to show.";
        root.appendChild(p);
        return;
      }

      show.forEach(function (repo) {
        const a = document.createElement("a");
        a.className = "card";
        a.href = repo.html_url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";

        const title = document.createElement("h3");
        title.className = "card-title";
        title.textContent = repo.name;

        const desc = document.createElement("p");
        desc.className = "card-desc";
        desc.textContent = repo.description || "No description.";

        const meta = document.createElement("div");
        meta.className = "card-meta";
        const stars = repo.stargazers_count ?? 0;
        const lang = repo.language || "—";
        meta.textContent = stars + " * · " + lang;

        a.appendChild(title);
        a.appendChild(desc);
        a.appendChild(meta);
        root.appendChild(a);
      });
    })
    .catch(function () {
      status.textContent =
        "Could not load GitHub projects. Check githubUsername in config.js and your connection.";
      status.classList.add("is-error");
    });
})();
