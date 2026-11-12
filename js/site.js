(function () {
  "use strict";

  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close menu" : "Menu";
    });
  }

  var quoteForm = document.getElementById("quote-form");
  if (quoteForm) initQuote(quoteForm);

  var bookForm = document.getElementById("book-form");
  if (bookForm) initNoSubmitForm(bookForm, "book-status");

  var applyForm = document.getElementById("apply-form");
  if (applyForm) initNoSubmitForm(applyForm, "apply-status");

  var contactForm = document.getElementById("contact-form");
  if (contactForm) initNoSubmitForm(contactForm, "contact-status");

  function initNoSubmitForm(form, statusId) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var status = document.getElementById(statusId);
      if (status) {
        status.hidden = false;
        status.focus();
      }
    });
  }

  function initQuote(form) {
    var roomsWrap = document.getElementById("rooms");
    var addRoomBtn = document.getElementById("add-room");
    var estimateEl = document.getElementById("estimate-figure");
    var breakdownEl = document.getElementById("estimate-breakdown");
    var roomIndex = 0;
    var objectUrls = [];

    function addRoom() {
      roomIndex += 1;
      var id = "room-" + roomIndex;
      var article = document.createElement("article");
      article.className = "room-card";
      article.innerHTML =
        "<h3>Room " + roomIndex + "</h3>" +
        "<div class=\"form-row\">" +
        "<p><label for=\"" + id + "-type\">Room type</label>" +
        "<select id=\"" + id + "-type\" name=\"room-type-" + roomIndex + "\">" +
        "<option value=\"living\">Living room</option>" +
        "<option value=\"kitchen\">Kitchen</option>" +
        "<option value=\"bedroom\">Bedroom</option>" +
        "<option value=\"bathroom\">Bathroom</option>" +
        "<option value=\"other\">Other</option>" +
        "</select></p>" +
        "<p><label for=\"" + id + "-photos\">Photos of this room</label>" +
        "<span class=\"hint\" id=\"" + id + "-hint\">Photos stay on this device. They are not uploaded anywhere yet.</span>" +
        "<input id=\"" + id + "-photos\" name=\"room-photos-" + roomIndex + "\" type=\"file\" accept=\"image/*\" multiple aria-describedby=\"" + id + "-hint\"></p>" +
        "</div>" +
        "<div class=\"previews\" id=\"" + id + "-previews\" hidden></div>";
      roomsWrap.appendChild(article);

      var input = article.querySelector("input[type='file']");
      var previews = article.querySelector(".previews");
      input.addEventListener("change", function () {
        previews.innerHTML = "";
        var files = Array.prototype.slice.call(input.files || []);
        if (!files.length) {
          previews.hidden = true;
          return;
        }
        previews.hidden = false;
        files.forEach(function (file, i) {
          if (!file.type || file.type.indexOf("image/") !== 0) return;
          var url = URL.createObjectURL(file);
          objectUrls.push(url);
          var img = document.createElement("img");
          img.src = url;
          img.alt = "Local preview of " + (file.name || "photo " + (i + 1)) + " for room " + roomIndex + ". This image has not been uploaded.";
          previews.appendChild(img);
        });
      });
    }

    addRoom();
    if (addRoomBtn) {
      addRoomBtn.addEventListener("click", function () {
        addRoom();
      });
    }

    window.addEventListener("beforeunload", function () {
      objectUrls.forEach(function (url) {
        URL.revokeObjectURL(url);
      });
    });

    var fields = form.querySelectorAll("input, select");
    Array.prototype.forEach.call(fields, function (field) {
      field.addEventListener("change", updateEstimate);
      field.addEventListener("input", updateEstimate);
    });
    form.addEventListener("change", updateEstimate);
    updateEstimate();

    function checkedAddons() {
      var total = 0;
      var labels = [];
      Array.prototype.forEach.call(form.querySelectorAll("input[name='addon']:checked"), function (box) {
        var amount = Number(box.getAttribute("data-amount") || 0);
        total += amount;
        labels.push(box.getAttribute("data-label") + " ($" + amount + ")");
      });
      return { total: total, labels: labels };
    }

    function updateEstimate() {
      var service = (form.querySelector("input[name='service']:checked") || {}).value || "standard";
      var home = (form.querySelector("select[name='home-size']") || {}).value || "condo";
      var timing = (form.querySelector("input[name='timing']:checked") || {}).value || "scheduled";
      var recurring = (form.querySelector("input[name='recurring']:checked") || {}).value || "no";
      var addons = checkedAddons();

      var base = { min: 0, max: 0, fromOnly: false, label: "" };

      if (service === "move") {
        base = { min: 400, max: 650, fromOnly: false, label: "Move-in or move-out" };
      } else if (service === "airbnb") {
        base = { min: 160, max: 160, fromOnly: true, label: "Airbnb turnover" };
      } else {
        if (home === "condo") {
          base = { min: 150, max: 150, fromOnly: true, label: "Condo or 1-bedroom" };
        } else if (home === "two") {
          base = { min: 200, max: 260, fromOnly: false, label: "2-bedroom" };
        } else if (home === "three") {
          base = { min: 260, max: 340, fromOnly: false, label: "3-bedroom" };
        }
        if (service === "deep") {
          base.min = Math.round(base.min * 1.7);
          base.max = Math.round(base.max * 1.7);
          base.label += ", deep clean (about 1.7 times standard)";
          if (home === "condo") base.fromOnly = true;
        } else {
          base.label += ", standard clean";
        }
      }

      var afterAddMin = base.min + addons.total;
      var afterAddMax = base.max + addons.total;

      var timeNote = "Scheduled visit, no timing premium.";
      var tMin = afterAddMin;
      var tMax = afterAddMax;
      if (timing === "nextday") {
        tMin = Math.round(afterAddMin * 1.15);
        tMax = Math.round(afterAddMax * 1.15);
        timeNote = "Next-day timing premium of 15%.";
      } else if (timing === "instant") {
        var pMin = Math.max(Math.round(afterAddMin * 0.3), 60);
        var pMax = Math.max(Math.round(afterAddMax * 0.4), 60);
        tMin = afterAddMin + pMin;
        tMax = afterAddMax + pMax;
        timeNote = "Same-day, or instant, timing premium of 30% to 40%, with a $60 minimum premium.";
      }

      var recNote = "No recurring discount applied.";
      if (recurring !== "no") {
        var low = Math.round(tMin * 0.85);
        var high = Math.round(tMax * 0.9);
        tMin = Math.min(low, high);
        tMax = Math.max(low, high);
        recNote = "Recurring discount of 10% to 15% applied as a range.";
      }

      if (tMin > tMax) {
        var swap = tMin;
        tMin = tMax;
        tMax = swap;
      }

      var figure;
      if (tMin === tMax) {
        figure = (base.fromOnly ? "From " : "") + formatMoney(tMin) + " CAD, plus HST";
      } else if (base.fromOnly && service !== "move") {
        figure = formatMoney(tMin) + " – " + formatMoney(tMax) + " CAD, plus HST";
      } else {
        figure = formatMoney(tMin) + " – " + formatMoney(tMax) + " CAD, plus HST";
      }

      if (estimateEl) estimateEl.textContent = figure;

      var lines = [];
      lines.push("Base: " + base.label + ".");
      if (addons.labels.length) {
        lines.push("Add-ons: " + addons.labels.join(", ") + ".");
      } else {
        lines.push("No paid add-ons selected.");
      }
      lines.push(timeNote);
      lines.push(recNote);
      lines.push("Number of cleaners does not change this draft estimate.");
      lines.push("Draft pricing, pending owner approval. This is a simple on-page estimate, not an AI quote. The real AI quote is coming, and photos are not uploaded anywhere yet.");
      if (breakdownEl) breakdownEl.textContent = lines.join(" ");
    }
  }

  function formatMoney(value) {
    return "$" + Number(value).toLocaleString("en-CA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
})();
