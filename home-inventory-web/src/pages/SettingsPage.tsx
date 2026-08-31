import React, { useState } from "react";
import { getApiBaseUrl, setApiBaseUrl, getHouseholdId, setHouseholdId } from "@/api/client";

export default function SettingsPage() {
  const [apiBaseUrl, setApiBaseUrlInput] = useState(getApiBaseUrl());
  const [householdId, setHouseholdIdInput] = useState(getHouseholdId());
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setApiBaseUrl(apiBaseUrl.trim());
    setHouseholdId(householdId.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
      </div>
      <p className="helper-text">
        The household ID stands in for real login until JWT auth is built (see backend README —{" "}
        <code>HouseholdContext</code>). Every request needs it; without it the API returns 401.
      </p>
      <form className="form-grid" onSubmit={handleSave}>
        <label className="form-field form-field-wide">
          <span>API base URL</span>
          <input className="input" value={apiBaseUrl} onChange={(e) => setApiBaseUrlInput(e.target.value)} />
        </label>
        <label className="form-field form-field-wide">
          <span>Household ID</span>
          <input className="input" value={householdId} onChange={(e) => setHouseholdIdInput(e.target.value)} />
        </label>
        <div className="form-actions form-field-wide">
          <button type="submit" className="button-primary">
            Save
          </button>
          {saved && <span className="helper-text">Saved.</span>}
        </div>
      </form>
    </div>
  );
}
