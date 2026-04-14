(function () {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const username = (cfg.githubUsername || "").trim();
  const resumeUrl = (cfg.resumeUrl || "./resume.pdf").trim();
  const degreeUrl = (cfg.degreeUrl || "./degree.png").trim();
  const transcriptUrl = (cfg.transcriptUrl || "./transcript.png").trim();
  const unofficialTranscriptUrl = (cfg.unofficialTranscriptUrl || "").trim();
  const recommendationUrl = (cfg.recommendationUrl || "").trim();
  const contactFormEndpoint = (cfg.contactFormEndpoint || "").trim();
  const rootEl = document.documentElement;
  const hasGithub = username.length > 0;
  const githubProfile = hasGithub
    ? `https://github.com/${encodeURIComponent(username)}`
    : "#";

  const themeDarkBtn = document.getElementById("theme-dark-btn");
  const themeLightBtn = document.getElementById("theme-light-btn");

  function applyTheme(theme) {
    const nextTheme = theme === "light" ? "light" : "dark";
    rootEl.setAttribute("data-theme", nextTheme);
    if (themeDarkBtn) {
      themeDarkBtn.setAttribute("aria-pressed", String(nextTheme === "dark"));
    }
    if (themeLightBtn) {
      themeLightBtn.setAttribute("aria-pressed", String(nextTheme === "light"));
    }
    try {
      localStorage.setItem("portfolio-theme", nextTheme);
    } catch (e) {
      // Ignore storage restrictions.
    }
  }

  if (themeDarkBtn) {
    themeDarkBtn.addEventListener("click", function () {
      applyTheme("dark");
    });
  }
  if (themeLightBtn) {
    themeLightBtn.addEventListener("click", function () {
      applyTheme("light");
    });
  }

  applyTheme(rootEl.getAttribute("data-theme") || "dark");

  const documentModal = document.getElementById("document-modal");
  const openDocumentsNav = document.getElementById("open-documents-nav");
  const openDocumentsBtn = document.getElementById("open-documents-btn");
  const closeDocumentModalBtn = document.getElementById("close-document-modal");
  const documentFrame = document.getElementById("document-frame");
  const documentImage = document.getElementById("document-image");
  const documentFallback = document.getElementById("document-fallback");
  const documentModalTitle = document.getElementById("document-modal-title");
  const documentTabs = Array.from(document.querySelectorAll(".document-tab"));
  let activeDocumentType = "file";
  let activeDocumentKey = "resume";
  const documentSources = {
    resume: { label: "Resume", url: resumeUrl },
    degree: { label: "Degree", url: degreeUrl },
    transcript: { label: "Official Transcript", url: transcriptUrl },
    unofficialTranscript: {
      label: "Unofficial Transcript",
      url: unofficialTranscriptUrl,
    },
    recommendation: {
      label: "Recommendation Letter",
      url: recommendationUrl,
    },
  };

  function showDocumentFallback() {
    if (documentFallback) documentFallback.hidden = false;
    if (documentFrame) {
      documentFrame.hidden = true;
      documentFrame.src = "";
    }
    if (documentImage) {
      documentImage.hidden = true;
      documentImage.src = "";
    }
  }

  function setActiveDocument(documentKey) {
    const safeKey = Object.prototype.hasOwnProperty.call(documentSources, documentKey)
      ? documentKey
      : "resume";
    activeDocumentKey = safeKey;
    const source = documentSources[safeKey];
    const title = source.label;
    const url = source.url;

    if (!documentModal) return;
    if (documentModalTitle) documentModalTitle.textContent = title || "Document";
    documentTabs.forEach(function (tab) {
      const isActive = tab.getAttribute("data-doc") === safeKey;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });
    if (documentFrame && documentImage && documentFallback) {
      if (url) {
        const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(url);
        activeDocumentType = isImage ? "image" : "frame";
        documentFallback.hidden = true;
        if (isImage) {
          documentFrame.hidden = true;
          documentFrame.src = "";
          documentImage.hidden = false;
          documentImage.src = url + (url.includes("?") ? "&" : "?") + "t=" + String(Date.now());
        } else {
          documentImage.hidden = true;
          documentImage.src = "";
          documentFrame.hidden = false;
          documentFrame.src = url;
        }
      } else {
        documentFallback.textContent =
          (title || "Document") +
          " is not uploaded yet. Available upon request.";
        documentFrame.hidden = true;
        documentImage.hidden = true;
        documentFallback.hidden = false;
      }
    }
  }

  function openDocumentModal(event, initialKey) {
    if (event) event.preventDefault();
    if (!documentModal) return;
    setActiveDocument(initialKey || activeDocumentKey);
    documentModal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeDocumentModal() {
    if (!documentModal) return;
    documentModal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  if (openDocumentsNav) {
    openDocumentsNav.addEventListener("click", function (event) {
      openDocumentModal(event, "resume");
    });
  }
  if (openDocumentsBtn) {
    openDocumentsBtn.addEventListener("click", function (event) {
      openDocumentModal(event, "resume");
    });
  }
  documentTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      const key = tab.getAttribute("data-doc") || "resume";
      setActiveDocument(key);
    });
  });
  if (closeDocumentModalBtn) {
    closeDocumentModalBtn.addEventListener("click", closeDocumentModal);
  }
  if (documentModal) {
    documentModal.addEventListener("click", function (event) {
      if (event.target === documentModal) closeDocumentModal();
    });
  }
  if (documentImage) {
    documentImage.addEventListener("error", function () {
      if (activeDocumentType === "image") showDocumentFallback();
    });
    documentImage.addEventListener("load", function () {
      if (activeDocumentType === "image" && documentFallback) {
        documentFallback.hidden = true;
      }
    });
  }
  if (documentFrame) {
    documentFrame.addEventListener("error", function () {
      if (activeDocumentType === "frame") showDocumentFallback();
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && documentModal && !documentModal.hidden) {
      closeDocumentModal();
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

  const contactForm = document.getElementById("contact-form");
  const contactFormStatus = document.getElementById("contact-form-status");
  if (contactForm && contactFormStatus) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const message = String(formData.get("message") || "").trim();

      if (!name || !email || !message) {
        contactFormStatus.hidden = false;
        contactFormStatus.textContent = "Please fill in all fields.";
        return;
      }

      if (contactFormEndpoint) {
        fetch(contactFormEndpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData,
        })
          .then(function (response) {
            if (!response.ok) throw new Error("Submit failed");
            contactForm.reset();
            contactFormStatus.hidden = false;
            contactFormStatus.textContent = "Thanks! Your message has been sent.";
          })
          .catch(function () {
            contactFormStatus.hidden = false;
            contactFormStatus.textContent =
              "Could not submit form right now. Please email me directly.";
          });
        return;
      }

      if (!cfg.contactEmail) {
        contactFormStatus.hidden = false;
        contactFormStatus.textContent =
          "Set contactEmail in config.js to enable mail fallback.";
        return;
      }

      const subject = encodeURIComponent("Portfolio contact from " + name);
      const body = encodeURIComponent(
        "Name: " +
          name +
          "\nEmail: " +
          email +
          "\n\nMessage:\n" +
          message
      );
      window.location.href = `mailto:${cfg.contactEmail}?subject=${subject}&body=${body}`;
      contactFormStatus.hidden = false;
      contactFormStatus.textContent =
        "Opening your email app to send this message.";
    });
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
  const projectsSection = document.getElementById("projects");
  const activitySection = document.getElementById("activity");
  const activityGraphLink = document.getElementById("activity-graph-link");
  const activityGraphImg = document.getElementById("activity-graph-img");
  const activityFallback = document.getElementById("activity-fallback");
  let reposLoaded = false;
  let activityLoaded = false;

  function observeOnce(target, callback) {
    if (!target || typeof callback !== "function") return;
    if (typeof IntersectionObserver === "undefined") {
      callback();
      return;
    }
    const observer = new IntersectionObserver(
      function (entries, instance) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            instance.disconnect();
            callback();
          }
        });
      },
      { rootMargin: "180px 0px" }
    );
    observer.observe(target);
  }

  function loadActivityGraph() {
    if (activityLoaded || !activitySection || !activityGraphLink || !activityGraphImg || !activityFallback) {
      return;
    }
    activityLoaded = true;
    if (!hasGithub) {
      activitySection.hidden = true;
      return;
    }

    activityGraphLink.href = githubProfile;
    const cacheBust = "t=" + String(Date.now());
    const activityGraphUrl =
      "https://github-readme-activity-graph.vercel.app/graph?username=" +
      encodeURIComponent(username) +
      "&theme=github-dark&hide_border=true&area=true&" +
      cacheBust;
    const activityFallbackUrl =
      "https://ghchart.rshah.org/6ee7b7/" + encodeURIComponent(username) + "?" + cacheBust;
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

  function loadGithubProjects() {
    if (reposLoaded || !root || !status) return;
    reposLoaded = true;
    if (!hasGithub) {
      status.textContent = "Add your GitHub username in config.js to list public repositories here.";
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
          const card = document.createElement("article");
          card.className = "card project-card";

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

          const actions = document.createElement("div");
          actions.className = "project-actions";

          const repoBtn = document.createElement("a");
          repoBtn.className = "project-link-btn";
          repoBtn.href = repo.html_url;
          repoBtn.target = "_blank";
          repoBtn.rel = "noopener noreferrer";
          repoBtn.textContent = "Repository";

          const demoBtn = document.createElement("a");
          demoBtn.className = "project-link-btn project-link-btn--ghost";
          demoBtn.target = "_blank";
          demoBtn.rel = "noopener noreferrer";
          if (repo.homepage) {
            demoBtn.href = repo.homepage;
            demoBtn.textContent = "Live Demo";
          } else {
            demoBtn.href = "#";
            demoBtn.textContent = "No Demo";
            demoBtn.classList.add("is-disabled");
            demoBtn.setAttribute("aria-disabled", "true");
            demoBtn.addEventListener("click", function (event) {
              event.preventDefault();
            });
          }

          actions.appendChild(repoBtn);
          actions.appendChild(demoBtn);

          card.appendChild(title);
          card.appendChild(desc);
          card.appendChild(meta);
          card.appendChild(actions);
          root.appendChild(card);
        });
      })
      .catch(function () {
        status.textContent =
          "Could not load GitHub projects. Check githubUsername in config.js and your connection.";
        status.classList.add("is-error");
      });
  }

  if (activitySection) observeOnce(activitySection, loadActivityGraph);
  if (projectsSection) observeOnce(projectsSection, loadGithubProjects);
})();
