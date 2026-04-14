(function () {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const username = (cfg.githubUsername || "").trim();
  const hasGithub = username.length > 0;
  const githubProfile = hasGithub
    ? `https://github.com/${encodeURIComponent(username)}`
    : "#";

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
