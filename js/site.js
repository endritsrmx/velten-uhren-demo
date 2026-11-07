(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktopNav = window.matchMedia("(min-width: 1120px)");

  function initNav() {
    var toggle = document.getElementById("navToggle");
    var panel = document.getElementById("navPanel");
    if (!toggle || !panel) return;

    var iconMenu = toggle.querySelector(".icon-menu");
    var iconClose = toggle.querySelector(".icon-close");

    function setMenu(open) {
      var desktop = desktopNav.matches;
      var show = desktop ? false : open;
      panel.classList.toggle("is-open", show);
      toggle.setAttribute("aria-expanded", show ? "true" : "false");
      document.documentElement.classList.toggle("nav-open", show);
      if (desktop) {
        panel.removeAttribute("aria-hidden");
      } else {
        panel.setAttribute("aria-hidden", show ? "false" : "true");
      }
      if (iconMenu) iconMenu.classList.toggle("is-hidden", show);
      if (iconClose) iconClose.classList.toggle("is-hidden", !show);
    }

    setMenu(false);

    toggle.addEventListener("click", function () {
      setMenu(!panel.classList.contains("is-open"));
    });

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (!desktopNav.matches) setMenu(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });

    desktopNav.addEventListener("change", function () {
      setMenu(false);
    });
  }

  function initReveals() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach(function (node) { node.classList.add("is-in"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    nodes.forEach(function (node) { observer.observe(node); });
  }

  function initFaq() {
    document.querySelectorAll(".faq-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        if (panel) panel.hidden = open;
      });
    });
  }

  var LABELS = {
    finish: { poliert: "Poliert", gebuerstet: "Gebürstet", pvd: "Schwarz PVD" },
    dial: { blau: "Metallblau", silber: "Silber", graphit: "Graphit", elfenbein: "Elfenbein" },
    hands: { dauphine: "Dauphine", baton: "Baton", feuille: "Feuille" },
    strap: {
      stahl: "Stahl",
      "leder-braun": "Leder braun",
      "leder-schwarz": "Leder schwarz",
      kautschuk: "Kautschuk blau"
    }
  };

  function clean(value, max) {
    return String(value || "").replace(/[\u0000-\u001F]/g, "").slice(0, max);
  }

  function wrapText(raw, max) {
    var text = String(raw || "").trim().replace(/\s+/g, " ");
    if (!text) return [];
    var words = text.split(" ");
    var lines = [];
    var current = "";
    words.forEach(function (word) {
      if (word.length > max) {
        if (current) {
          lines.push(current);
          current = "";
        }
        for (var i = 0; i < word.length; i += max) {
          lines.push(word.slice(i, i + max));
        }
        return;
      }
      var next = current ? current + " " + word : word;
      if (next.length > max) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  function initConfigurator() {
    var watch = document.getElementById("watch");
    if (!watch) return;

    var config = {
      finish: watch.getAttribute("data-finish") || "gebuerstet",
      dial: watch.getAttribute("data-dial") || "blau",
      hands: watch.getAttribute("data-hands") || "dauphine",
      strap: watch.getAttribute("data-strap") || "stahl",
      view: watch.getAttribute("data-view") || "front",
      dialText: "",
      engraving: ""
    };

    var dialText = document.getElementById("dialText");
    var engravingText = document.getElementById("engravingText");
    var dialInput = document.getElementById("dialInput");
    var engravingInput = document.getElementById("engravingInput");
    var dialCount = document.getElementById("dialCount");
    var engCount = document.getElementById("engCount");
    var watchTitle = document.getElementById("watchTitle");
    var summaryLinked = false;

    function fitDial(value) {
      if (!dialText) return;
      var len = value.length;
      var size = 13;
      var tracking = 1.5;
      if (len > 16) {
        size = 8;
        tracking = 0.4;
      } else if (len > 12) {
        size = 9.5;
        tracking = 0.7;
      } else if (len > 8) {
        size = 11;
        tracking = 1;
      }
      dialText.setAttribute("font-size", String(size));
      dialText.setAttribute("letter-spacing", String(tracking));
    }

    function paintEngraving(value) {
      if (!engravingText) return;
      while (engravingText.firstChild) engravingText.removeChild(engravingText.firstChild);
      var lines = wrapText(value, 14).slice(0, 3);
      if (!lines.length) return;
      var size = lines.some(function (line) { return line.length > 12; }) ? 12 : 16;
      var lineHeight = size + 5;
      engravingText.setAttribute("font-size", String(size));
      var start = 300 - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach(function (line, index) {
        var tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttribute("x", "210");
        tspan.setAttribute("y", String(start + index * lineHeight));
        tspan.textContent = line;
        engravingText.appendChild(tspan);
      });
    }

    function updateTitle() {
      if (!watchTitle) return;
      var view = config.view === "back" ? "Gehäuseboden" : "Zifferblatt";
      var dialMark = config.dialText ? ", Zeichen " + config.dialText : "";
      var backMark = config.engraving ? ", Gravur " + config.engraving : "";
      watchTitle.textContent = "Skizze, Ansicht " + view + ". Gehäuse " + LABELS.finish[config.finish] + ", Zifferblatt " + LABELS.dial[config.dial] + ", Zeiger " + LABELS.hands[config.hands] + ", Band " + LABELS.strap[config.strap] + dialMark + backMark + ".";
    }

    function renderSummary() {
      var placeholder = document.getElementById("summaryPlaceholder");
      var list = document.getElementById("summaryList");
      if (!list) return;
      var rows = summaryRows();
      list.innerHTML = "";
      rows.forEach(function (row) {
        var wrap = document.createElement("div");
        var dt = document.createElement("dt");
        var dd = document.createElement("dd");
        dt.textContent = row[0];
        dd.textContent = row[1];
        wrap.appendChild(dt);
        wrap.appendChild(dd);
        list.appendChild(wrap);
      });
      list.hidden = false;
      if (placeholder) placeholder.hidden = true;
    }

    function summaryRows() {
      return [
        ["Gehäuse", LABELS.finish[config.finish]],
        ["Zifferblatt", LABELS.dial[config.dial]],
        ["Zeiger", LABELS.hands[config.hands]],
        ["Band", LABELS.strap[config.strap]],
        ["Zifferblatt-Text", config.dialText || "kein Text"],
        ["Gravur Boden", config.engraving || "keine Gravur"]
      ];
    }

    document.querySelectorAll("[data-config]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-config");
        var value = btn.getAttribute("data-value");
        if (!key || !value) return;
        config[key] = value;
        watch.setAttribute("data-" + key, value);
        var group = btn.closest("[role='group']") || btn.parentElement;
        if (group) {
          group.querySelectorAll("[data-config='" + key + "']").forEach(function (peer) {
            peer.setAttribute("aria-pressed", peer === btn ? "true" : "false");
          });
        }
        updateTitle();
        if (summaryLinked) renderSummary();
      });
    });

    if (dialInput) {
      dialInput.addEventListener("input", function () {
        var value = clean(dialInput.value, 20);
        if (value !== dialInput.value) dialInput.value = value;
        config.dialText = value;
        if (dialText) dialText.textContent = value.toLocaleUpperCase("de-CH");
        fitDial(value);
        if (dialCount) dialCount.textContent = value.length + " / 20";
        updateTitle();
        if (summaryLinked) renderSummary();
      });
    }

    if (engravingInput) {
      engravingInput.addEventListener("input", function () {
        var value = clean(engravingInput.value, 42);
        if (value !== engravingInput.value) engravingInput.value = value;
        config.engraving = value;
        paintEngraving(value);
        if (engCount) engCount.textContent = value.length + " / 42";
        updateTitle();
        if (summaryLinked) renderSummary();
      });
    }

    var apply = document.getElementById("applyConfig");
    if (apply) {
      apply.addEventListener("click", function () {
        summaryLinked = true;
        renderSummary();
        var target = document.getElementById("anfrage");
        if (target) {
          target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        }
        var anlass = document.getElementById("anlass");
        if (anlass) anlass.focus({ preventScroll: true });
      });
    }

    document.querySelectorAll("[data-kundentyp]").forEach(function (link) {
      link.addEventListener("click", function () {
        var select = document.getElementById("kundentyp");
        if (select) select.value = link.getAttribute("data-kundentyp") || "";
      });
    });

    watch._atelierSummary = function () {
      return summaryRows();
    };
    watch._atelierLinkSummary = function () {
      summaryLinked = true;
      renderSummary();
    };

    updateTitle();
  }

  function fieldError(id, message) {
    var field = document.getElementById(id);
    if (!field) return;
    var wrap = field.closest(".field");
    var error = document.getElementById(id + "-error");
    if (message) {
      if (wrap) wrap.classList.add("is-invalid");
      field.setAttribute("aria-invalid", "true");
      if (error) {
        error.hidden = false;
        error.textContent = message;
      }
    } else {
      if (wrap) wrap.classList.remove("is-invalid");
      field.removeAttribute("aria-invalid");
      if (error) {
        error.hidden = true;
        error.textContent = "";
      }
    }
  }

  function selectedText(id) {
    var el = document.getElementById(id);
    if (!el) return "";
    if (el.tagName === "SELECT") {
      var option = el.options[el.selectedIndex];
      return option ? option.text : "";
    }
    return el.value.trim();
  }

  function initForm() {
    var form = document.getElementById("requestForm");
    var done = document.getElementById("requestDone");
    if (!form || !done) return;

    var fileInput = document.getElementById("logo");
    var fileName = document.getElementById("fileName");
    var alertBox = document.getElementById("formAlert");
    var doneList = document.getElementById("doneList");
    var editBtn = document.getElementById("editRequest");

    if (fileInput && fileName) {
      fileInput.addEventListener("change", function () {
        var file = fileInput.files && fileInput.files[0];
        fileName.textContent = file ? file.name : "Keine Datei gewählt";
      });
    }

    function validate() {
      var firstInvalid = null;
      function fail(id, message) {
        fieldError(id, message);
        if (!firstInvalid) firstInvalid = document.getElementById(id);
      }
      function ok(id) { fieldError(id, ""); }

      var anlass = document.getElementById("anlass");
      if (!anlass || !anlass.value) fail("anlass", "Bitte den Anlass wählen.");
      else ok("anlass");

      var kundentyp = document.getElementById("kundentyp");
      if (!kundentyp || !kundentyp.value) fail("kundentyp", "Bitte den Kundentyp wählen.");
      else ok("kundentyp");

      var stueck = document.getElementById("stueckzahl");
      var count = stueck ? Number(stueck.value) : NaN;
      if (!stueck || stueck.value === "" || !Number.isInteger(count) || count < 1 || count > 9999) {
        fail("stueckzahl", "Bitte eine Stückzahl ab 1 angeben.");
      } else ok("stueckzahl");

      var name = document.getElementById("name");
      if (!name || name.value.trim().length < 2) fail("name", "Bitte den Namen angeben.");
      else ok("name");

      var email = document.getElementById("email");
      var emailOk = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      if (!emailOk) fail("email", "Bitte eine gültige E-Mail-Adresse angeben.");
      else ok("email");

      if (alertBox) alertBox.hidden = !firstInvalid;
      if (firstInvalid) {
        firstInvalid.focus();
        return false;
      }
      return true;
    }

    function pushRow(list, label, value) {
      if (!value) return;
      var wrap = document.createElement("div");
      var dt = document.createElement("dt");
      var dd = document.createElement("dd");
      dt.textContent = label;
      dd.textContent = value;
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      list.appendChild(wrap);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validate()) return;

      var watch = document.getElementById("watch");
      if (watch && watch._atelierLinkSummary) watch._atelierLinkSummary();

      if (doneList) {
        doneList.innerHTML = "";
        pushRow(doneList, "Anlass", selectedText("anlass"));
        pushRow(doneList, "Kundentyp", selectedText("kundentyp"));
        pushRow(doneList, "Stückzahl", selectedText("stueckzahl"));
        pushRow(doneList, "Wunschtermin", selectedText("wunschtermin"));
        pushRow(doneList, "Budgetrahmen", selectedText("budget"));
        var file = fileInput && fileInput.files && fileInput.files[0];
        pushRow(doneList, "Logo-Datei", file ? file.name + " (nicht übertragen)" : "keine Datei");
        pushRow(doneList, "Nachricht", selectedText("nachricht"));
        pushRow(doneList, "Name", selectedText("name"));
        pushRow(doneList, "E-Mail", selectedText("email"));
        pushRow(doneList, "Telefon", selectedText("telefon"));
        if (watch && watch._atelierSummary) {
          watch._atelierSummary().forEach(function (row) {
            pushRow(doneList, row[0], row[1]);
          });
        }
      }

      form.hidden = true;
      done.hidden = false;
      var title = document.getElementById("doneTitle");
      if (title) title.focus();
    });

    if (editBtn) {
      editBtn.addEventListener("click", function () {
        done.hidden = true;
        form.hidden = false;
        var name = document.getElementById("name");
        if (name) name.focus();
      });
    }
  }

  initNav();
  initReveals();
  initFaq();
  initConfigurator();
  initForm();
})();
