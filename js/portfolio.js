/* =========================================================
   Mukeshwar Sah Teli — portfolio interactions
   ========================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var supportsIO = "IntersectionObserver" in window;

  if (supportsIO && !reduceMotion) {
    root.classList.add("js");
  }

  /* -------------------------------------------------------
     Theme
     ------------------------------------------------------- */

  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var themeToggles = Array.prototype.slice.call(document.querySelectorAll("[data-theme-toggle]"));

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function syncThemeControls(theme) {
    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "dark" ? "#070d0a" : "#f5faf7");
    }

    themeToggles.forEach(function (button) {
      var goingTo = theme === "dark" ? "light" : "dark";
      var icon = button.querySelector("i");
      var label = button.querySelector("[data-theme-label]");

      button.setAttribute("aria-pressed", String(theme === "light"));
      button.setAttribute("aria-label", "Switch to " + goingTo + " theme");

      if (icon) {
        icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
      }

      if (label) {
        label.textContent = goingTo === "light" ? "Light mode" : "Dark mode";
      }
    });
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;

    try {
      localStorage.setItem("mukeshwar-theme", theme);
    } catch (error) {
      /* Storage can be unavailable in private or embedded contexts. */
    }

    syncThemeControls(theme);
  }

  syncThemeControls(currentTheme());

  themeToggles.forEach(function (button) {
    button.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });

  /* -------------------------------------------------------
     Top navigation (desktop/mobile)
     ------------------------------------------------------- */

  var topNavToggle = document.getElementById("topNavToggle");
  var topNavMenu = document.getElementById("topNavMenu");
  var topNavLinks = topNavMenu ? Array.prototype.slice.call(topNavMenu.querySelectorAll(".top-navbar__link")) : [];

  function closeTopNav() {
    if (!topNavToggle || !topNavMenu) return;
    topNavMenu.classList.remove("is-open");
    topNavToggle.setAttribute("aria-expanded", "false");
  }

  if (topNavToggle && topNavMenu) {
    topNavToggle.addEventListener("click", function () {
      var isOpen = topNavMenu.classList.contains("is-open");
      if (isOpen) {
        closeTopNav();
      } else {
        topNavMenu.classList.add("is-open");
        topNavToggle.setAttribute("aria-expanded", "true");
      }
    });

    topNavLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        closeTopNav();
        topNavLinks.forEach(function (item) {
          item.classList.remove("active");
          item.removeAttribute("aria-current");
        });
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      });
    });

    document.addEventListener("click", function (event) {
      if (!topNavMenu.classList.contains("is-open")) return;
      if (topNavMenu.contains(event.target) || (topNavToggle && topNavToggle.contains(event.target))) return;
      closeTopNav();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeTopNav();
      }
    });
  }

  /* -------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------- */

  var body = document.body;
  var sidebar = document.getElementById("sidebar");
  var menuToggle = document.getElementById("menuToggle");
  var sidebarClose = document.getElementById("sidebarClose");
  var navOverlay = document.getElementById("navOverlay");
  var mobileQuery = window.matchMedia("(max-width: 1024px)");
  var lastFocused = null;

  function isMenuOpen() {
    return sidebar && sidebar.classList.contains("is-open");
  }

  function openMenu() {
    if (!sidebar || !menuToggle || !mobileQuery.matches) return;

    lastFocused = document.activeElement;
    sidebar.classList.add("is-open");
    body.classList.add("nav-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation");

    if (navOverlay) {
      navOverlay.hidden = false;
    }

    window.setTimeout(function () {
      if (sidebarClose) sidebarClose.focus();
    }, 30);
  }

  function closeMenu(restoreFocus) {
    if (!sidebar || !menuToggle) return;

    var wasOpen = isMenuOpen();
    sidebar.classList.remove("is-open");
    body.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");

    if (navOverlay) {
      navOverlay.hidden = true;
    }

    if (wasOpen && restoreFocus !== false) {
      var target = lastFocused && document.contains(lastFocused) ? lastFocused : menuToggle;
      target.focus();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      if (isMenuOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (sidebarClose) {
    sidebarClose.addEventListener("click", function () {
      closeMenu();
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener("click", function () {
      closeMenu();
    });
  }

  if (sidebar) {
    sidebar.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function () {
        if (mobileQuery.matches) closeMenu(false);
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var href = link.getAttribute("href");
      if (!href || href === "#") return;
      var target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      var offset = window.matchMedia("(max-width: 1024px)").matches ? 90 : 96;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: "smooth" });
      history.pushState(null, "", href);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (!isMenuOpen()) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "Tab" || !sidebar) return;

    var focusable = Array.prototype.slice.call(
      sidebar.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(function (element) {
      return element.offsetParent !== null;
    });

    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  function handleBreakpointChange(event) {
    if (!event.matches) closeMenu(false);
  }

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", handleBreakpointChange);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(handleBreakpointChange);
  }

  /* -------------------------------------------------------
     Scroll progress, back-to-top, scroll spy
     ------------------------------------------------------- */

  var progress = document.getElementById("scrollProgress");
  var backToTop = document.getElementById("backToTop");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var topNavLinksScroll = Array.prototype.slice.call(document.querySelectorAll(".top-navbar__link"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var ticking = false;

  function updateScrollUI() {
    var scrollTop = window.scrollY || window.pageYOffset;
    var maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    var ratio = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

    if (progress) {
      progress.style.width = (ratio * 100).toFixed(2) + "%";
    }

    if (backToTop) {
      backToTop.classList.toggle("is-visible", scrollTop > 520);
    }

    var probe = scrollTop + 200;
    var activeId = sections.length ? sections[0].id : "";

    sections.forEach(function (section) {
      if (section.offsetTop <= probe) activeId = section.id;
    });

    if (scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      activeId = sections.length ? sections[sections.length - 1].id : activeId;
    }

    navLinks.forEach(function (link) {
      var active = link.getAttribute("href") === "#" + activeId;
      link.classList.toggle("active", active);

      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    topNavLinksScroll.forEach(function (link) {
      var active = link.getAttribute("href") === "#" + activeId;
      link.classList.toggle("active", active);

      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    ticking = false;
  }

  function requestScrollUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollUI);
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  updateScrollUI();

  /* -------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------- */

  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (revealItems.length && supportsIO && !reduceMotion) {
    revealItems.forEach(function (item) {
      var parent = item.parentElement;
      var siblings = parent ? Array.prototype.slice.call(parent.querySelectorAll(":scope > .reveal")) : [];
      var index = siblings.indexOf(item);

      if (siblings.length > 1 && index > -1) {
        item.style.transitionDelay = Math.min(index * 55, 220) + "ms";
      }
    });

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* -------------------------------------------------------
     Animated counters
     ------------------------------------------------------- */

  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  function setCounterFinal(counter) {
    counter.textContent = String(parseInt(counter.getAttribute("data-count"), 10) || 0);
  }

  function animateCounter(counter) {
    var target = parseInt(counter.getAttribute("data-count"), 10) || 0;
    var duration = 1100;
    var start = null;

    if (reduceMotion) {
      setCounterFinal(counter);
      return;
    }

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progressValue = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progressValue, 3);
      counter.textContent = String(Math.round(target * eased));

      if (progressValue < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCounterFinal(counter);
      }
    }

    window.requestAnimationFrame(step);
  }

  if (counters.length && supportsIO && !reduceMotion) {
    var counterObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  } else {
    counters.forEach(setCounterFinal);
  }

  /* -------------------------------------------------------
     Hero role rotator
     ------------------------------------------------------- */

  var roleRotator = document.getElementById("roleRotator");
  var roles = ["Full Stack Web Developer", "Angular & Laravel Developer", "Problem Solver"];

  if (roleRotator && !reduceMotion) {
    var roleIndex = 0;
    var charIndex = roles[0].length;
    var deleting = false;
    var roleTimer = null;

    function rotateRole() {
      var word = roles[roleIndex];

      if (!deleting) {
        charIndex += 1;
        roleRotator.textContent = word.slice(0, charIndex);

        if (charIndex >= word.length) {
          deleting = true;
          roleTimer = window.setTimeout(rotateRole, 2200);
          return;
        }

        roleTimer = window.setTimeout(rotateRole, 46);
      } else {
        charIndex -= 1;
        roleRotator.textContent = word.slice(0, Math.max(charIndex, 0));

        if (charIndex <= 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          roleTimer = window.setTimeout(rotateRole, 320);
          return;
        }

        roleTimer = window.setTimeout(rotateRole, 24);
      }
    }

    roleTimer = window.setTimeout(rotateRole, 2600);

    document.addEventListener("visibilitychange", function () {
      window.clearTimeout(roleTimer);
      if (!document.hidden) roleTimer = window.setTimeout(rotateRole, 900);
    });
  }

  /* -------------------------------------------------------
     Project screenshot fallbacks
     ------------------------------------------------------- */

  function markMissingImage(image) {
    var media = image.closest(".project-media");
    if (!media) return;
    media.classList.add("is-missing");
    var fallback = media.querySelector(".project-media__fallback");
    if (fallback) fallback.setAttribute("aria-hidden", "false");
  }

  Array.prototype.slice.call(document.querySelectorAll(".project-media img")).forEach(function (image) {
    image.addEventListener("error", function () {
      markMissingImage(image);
    });

    if (image.complete && image.naturalWidth === 0) {
      markMissingImage(image);
    }
  });

  /* -------------------------------------------------------
     Profile photo fallbacks
     ------------------------------------------------------- */

  Array.prototype.slice.call(document.querySelectorAll(".avatar__img, .portrait__img")).forEach(function (image) {
    function useFallback() {
      var host = image.closest(".avatar, .portrait");
      if (host) host.classList.add("is-missing");
    }

    image.addEventListener("error", useFallback);

    if (image.complete && image.naturalWidth === 0) {
      useFallback();
    }
  });

  /* -------------------------------------------------------
     Contact form
     ------------------------------------------------------- */

  var form = document.getElementById("contactForm");

  if (form) {
    var formStatus = document.getElementById("formStatus");
    var submitButton = document.getElementById("submitBtn");
    var submitLabel = submitButton ? submitButton.querySelector(".btn__label") : null;
    var submitLoading = submitButton ? submitButton.querySelector(".btn__loading") : null;
    var messageField = document.getElementById("message");
    var messageCount = document.getElementById("messageCount");
    var honeyField = form.querySelector('input[name="_honey"]');
    var submitting = false;
    var ajaxEndpoint = "https://formsubmit.co/ajax/mukeshwarsah.np4912@gmail.com";

    var fieldRules = {
      name: {
        validate: function (value) {
          if (!value.trim()) return "Please enter your name.";
          if (value.trim().length < 2) return "Please enter at least 2 characters.";
          if (value.length > 80) return "Please keep your name under 80 characters.";
          return "";
        }
      },
      email: {
        validate: function (value) {
          if (!value.trim()) return "Please enter your email address.";
          if (value.length > 254) return "Please use a shorter email address.";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) {
            return "Please enter a valid email address.";
          }
          return "";
        }
      },
      subject: {
        validate: function (value) {
          return value.length > 120 ? "Please keep the subject under 120 characters." : "";
        }
      },
      message: {
        validate: function (value) {
          if (!value.trim()) return "Please tell me a little about your project.";
          if (value.trim().length < 10) return "Please write at least 10 characters.";
          if (value.length > 2000) return "Please keep your message under 2,000 characters.";
          return "";
        }
      }
    };

    function getField(name) {
      return form.elements.namedItem(name);
    }

    function setFieldError(name, message) {
      var field = getField(name);
      var error = form.querySelector('[data-error-for="' + name + '"]');
      if (!field) return;

      if (message) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }

      if (error) error.textContent = message;
    }

    function validateField(name) {
      var field = getField(name);
      var rule = fieldRules[name];
      if (!field || !rule) return true;

      var message = rule.validate(field.value);
      setFieldError(name, message);
      return !message;
    }

    function validateForm() {
      var valid = true;
      var firstInvalid = null;

      Object.keys(fieldRules).forEach(function (name) {
        var fieldValid = validateField(name);
        if (!fieldValid) {
          valid = false;
          if (!firstInvalid) firstInvalid = getField(name);
        }
      });

      if (firstInvalid) firstInvalid.focus();
      return valid;
    }

    function setStatus(message, type) {
      if (!formStatus) return;
      formStatus.textContent = message || "";
      formStatus.classList.remove("is-success", "is-error");

      if (type) formStatus.classList.add("is-" + type);
    }

    function setSubmitting(state) {
      submitting = state;

      if (submitButton) {
        submitButton.disabled = state;
        submitButton.setAttribute("aria-busy", String(state));
      }

      if (submitLabel) submitLabel.hidden = state;
      if (submitLoading) submitLoading.hidden = !state;
    }

    function updateMessageCount() {
      if (!messageField || !messageCount) return;
      messageCount.textContent = messageField.value.length + " / 2000";
    }

    if (messageField && messageCount) {
      messageField.addEventListener("input", updateMessageCount);
      updateMessageCount();
    }

    Object.keys(fieldRules).forEach(function (name) {
      var field = getField(name);
      if (!field) return;

      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") {
          setFieldError(name, "");
        }
      });

      field.addEventListener("blur", function () {
        if (field.value.trim()) validateField(name);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (submitting) return;

      setStatus("", "");

      if (honeyField && honeyField.value.trim()) {
        setStatus("Thanks — your message has been received.", "success");
        return;
      }

      if (!validateForm()) {
        setStatus("Please fix the highlighted fields and try again.", "error");
        return;
      }

      var payload = {
        name: getField("name").value.trim(),
        email: getField("email").value.trim(),
        subject: getField("subject").value.trim() || "Project inquiry",
        message: getField("message").value.trim(),
        _subject: "New project inquiry from mukeshwarsah.com.np",
        _template: "table",
        _captcha: "false"
      };

      setSubmitting(true);
      setStatus("Sending your message…", "");

      fetch(ajaxEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response
            .json()
            .catch(function () {
              return null;
            })
            .then(function (data) {
              if (!response.ok) {
                throw new Error("Request failed with status " + response.status);
              }

              if (data && String(data.success).toLowerCase() === "false") {
                throw new Error("The form service rejected the message.");
              }

              return data;
            });
        })
        .then(function () {
          form.reset();
          updateMessageCount();
          Object.keys(fieldRules).forEach(function (name) {
            setFieldError(name, "");
          });

          setStatus("Thanks — your message has been sent. I'll get back to you soon.", "success");

          if (formStatus) {
            formStatus.focus({ preventScroll: true });
            formStatus.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
          }
        })
        .catch(function () {
          setStatus(
            "Sorry, your message couldn't be sent right now. Please try again or email mukeshwarsah.np4912@gmail.com directly.",
            "error"
          );
        })
        .finally(function () {
          setSubmitting(false);
        });
    });
  }

  /* -------------------------------------------------------
     Footer year
     ------------------------------------------------------- */

  var year = new Date().getFullYear();
  Array.prototype.slice.call(document.querySelectorAll("[data-year]")).forEach(function (element) {
    element.textContent = String(year);
  });
})();
