(function () {
  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function formatTimestamp(date) {
    const year = date.getFullYear();
    const month = pad2(date.getMonth() + 1);
    const day = pad2(date.getDate());
    const hours = pad2(date.getHours());
    const minutes = pad2(date.getMinutes());
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  function getEndpoint(form) {
    const fromForm = form.dataset.endpoint && form.dataset.endpoint.trim();
    if (fromForm && fromForm !== "YOUR_APPS_SCRIPT_URL") {
      return fromForm;
    }
    return window.FormConfig && window.FormConfig.GOOGLE_FORMS_ENDPOINT;
  }

  const PROJECT_TYPE_LABELS = {
    narrative: "Narrative Film / Cinematic Collaboration",
    commercial: "High-End Commercial Campaign",
    corporate: "Corporate Production (Monthly Retainer)",
    music: "Music Video Production",
    other: "Specialized Cinematography / Other",
  };

  const LIVE_SCOPE_LABELS = {
    internal: "Intimate / Boardroom (up to 100 guests)",
    medium: "Mid-Size Corporate or Performance (100-500 guests)",
    large: "Large Venue or Festival (500+ guests)",
  };

  function buildFormData(form) {
    const payload = new FormData(form);

    payload.set("source", window.location.pathname || "unknown");
    payload.set("submitted_at", formatTimestamp(new Date()));

    if (form.id === "project-planner-form") {
      const type = payload.get("type") || "";
      const details = payload.get("details") || payload.get("project_details") || "";
      const serviceLabel = PROJECT_TYPE_LABELS[type] || type || "Video Production";

      payload.set("form_name", "filmworks_project_planner");
      payload.set("project_details", String(details).trim());
      payload.set("project_type", serviceLabel);
      payload.append("services[]", serviceLabel);
      payload.delete("details");
      payload.delete("type");
    }

    if (form.id === "live-consultation-form") {
      const eventDate = payload.get("event_date") || "";
      const scope = payload.get("scope") || "";
      const scopeLabel = LIVE_SCOPE_LABELS[scope] || scope;
      const name = payload.get("name") || "";
      const email = payload.get("email") || "";

      payload.set("form_name", "live_event_inquiry");
      payload.set("project_deadline", String(eventDate));
      payload.set(
        "project_details",
        [
          "Live event production inquiry",
          `Contact: ${name}`,
          `Email: ${email}`,
          `Event date: ${eventDate}`,
          `Event size: ${scopeLabel}`,
        ].join("\n")
      );
      payload.append("services[]", "Live Event Production / AV");
      payload.delete("scope");
      payload.delete("event_date");
    }

    return payload;
  }

  async function submitToGoogleForm(form) {
    const endpoint = getEndpoint(form);
    if (!endpoint) {
      throw new Error("Form endpoint is not configured.");
    }

    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      body: buildFormData(form),
    });
  }

  window.GoogleForms = {
    submitToGoogleForm,
    buildFormData,
  };
})();
