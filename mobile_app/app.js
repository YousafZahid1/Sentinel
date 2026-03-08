// Replace these with your own Supabase project values
const SUPABASE_URL = "https://phxzeycrmkdpvegztaib.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoeHpleWNybWtkcHZlZ3p0YWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NjMwMTUsImV4cCI6MjA4ODQzOTAxNX0.VL5Ivba37Y14xPOj6GH0x_WLFIwMakKk3i65GrB9jo0";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "Supabase URL or anon key is missing. Update SUPABASE_URL and SUPABASE_ANON_KEY in app.js."
  );
}

const { createClient } = supabase;
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authScreen = document.getElementById("auth-screen");
const homeScreen = document.getElementById("home-screen");
const userEmailEl = document.getElementById("user-email");
const userAvatarEl = document.getElementById("user-avatar");
const authMessageEl = document.getElementById("auth-message");

// Home screen elements
const accountEmailEl = document.getElementById("account-email");
const accountRoleEl = document.getElementById("account-role");
const locationStatusEl = document.getElementById("location-status");
const locationCoordsEl = document.getElementById("location-coords");
const getLocationButton = document.getElementById("btn-get-location");
const emergencyListEl = document.getElementById("emergency-list");
const emergencyEmptyEl = document.getElementById("emergency-empty");
const emergencyPopupOverlayEl = document.getElementById("emergency-popup-overlay");
const emergencyPopupTitleEl = document.getElementById("emergency-popup-title");
const emergencyPopupDescEl = document.getElementById("emergency-popup-desc");
const emergencyPopupLocationEl = document.getElementById("emergency-popup-location");
const emergencyPopupCloseEl = document.getElementById("emergency-popup-close");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginSubmit = document.getElementById("login-submit");
const signupSubmit = document.getElementById("signup-submit");
const signOutButton = document.getElementById("sign-out");

const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");

// Map & current user state
let mapInstance = null;
let userMarker = null;
let emergencyMarker = null; // legacy single marker (not used for list)
let emergencyMarkers = [];
let currentUser = null;
let locationIntervalId = null;
let emergenciesChannel = null;
let audioCtx = null;
let emergenciesList = [];

function setAuthMessage(message, type = "info") {
  authMessageEl.textContent = message || "";
  authMessageEl.classList.remove("auth-message--error", "auth-message--success");
  if (type === "error") {
    authMessageEl.classList.add("auth-message--error");
  } else if (type === "success") {
    authMessageEl.classList.add("auth-message--success");
  }
}

function firstLetterFromEmail(email) {
  if (!email) return "?";
  return email.trim().charAt(0).toUpperCase();
}

function formatDateTime(isoString) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function showAuth() {
  authScreen.classList.remove("card--hidden");
  homeScreen.classList.add("card--hidden");
  homeScreen.setAttribute("aria-hidden", "true");
  currentUser = null;
  setLocationIdle();
  stopLocationUpdates();
}

function showHome(user) {
  const email = user?.email ?? "";
  const role = user?.user_metadata?.role ?? "";

  currentUser = user || null;

  userEmailEl.textContent = email;
  if (accountEmailEl) accountEmailEl.textContent = email;
  if (accountRoleEl) accountRoleEl.textContent = role || "—";

  userAvatarEl.textContent = firstLetterFromEmail(email);
  authScreen.classList.add("card--hidden");
  homeScreen.classList.remove("card--hidden");
  homeScreen.removeAttribute("aria-hidden");

  setLocationIdle();
  fetchEmergencies();
}

function setLoading(button, isLoading, text) {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = text;
    button.disabled = true;
  } else {
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
    }
    button.disabled = false;
  }
}

function supportsGeolocation() {
  return "geolocation" in navigator;
}

function setLocationIdle() {
  if (locationStatusEl) {
    locationStatusEl.textContent = supportsGeolocation()
      ? "Location not requested yet."
      : "Location is not available on this device.";
  }

  if (locationCoordsEl) {
    locationCoordsEl.textContent = "—";
  }
}

function setLocationLoading(isLoading) {
  if (!getLocationButton) return;

  if (isLoading) {
    getLocationButton.dataset.originalText = getLocationButton.textContent;
    getLocationButton.textContent = "Getting location…";
    getLocationButton.disabled = true;
  } else {
    getLocationButton.textContent =
      getLocationButton.dataset.originalText || "Get current location";
    getLocationButton.disabled = false;
  }
}

function stopLocationUpdates() {
  if (locationIntervalId !== null) {
    clearInterval(locationIntervalId);
    locationIntervalId = null;
  }
}

function updateMapWithLocation(latitude, longitude, accuracy) {
  const mapElement = document.getElementById("map");
  if (!mapElement || typeof L === "undefined") {
    return;
  }

  const center = [latitude, longitude];

  if (!mapInstance) {
    mapInstance = L.map(mapElement, {
      center,
      zoom: 18,
      zoomControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        attribution: "© OpenStreetMap, © CARTO",
      }
    ).addTo(mapInstance);
  } else {
    mapInstance.setView(center, 18);
  }

  if (!userMarker) {
    userMarker = L.marker(center, {
      title: "Your location",
    }).addTo(mapInstance);
  } else {
    userMarker.setLatLng(center);
  }
}

function updateMapWithEmergency(latitude, longitude) {
  const mapElement = document.getElementById("map");
  if (!mapElement || typeof L === "undefined") {
    return;
  }

  const center = [latitude, longitude];

  if (!mapInstance) {
    mapInstance = L.map(mapElement, {
      center,
      zoom: 17,
      zoomControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        attribution: "© OpenStreetMap, © CARTO",
      }
    ).addTo(mapInstance);
  } else {
    mapInstance.setView(center, 17);
  }

  if (!emergencyMarker) {
    emergencyMarker = L.circleMarker(center, {
      radius: 10,
      color: "#b91c1c",
      fillColor: "#ef4444",
      fillOpacity: 0.9,
      weight: 2,
      title: "Emergency location",
    }).addTo(mapInstance);
  } else {
    emergencyMarker.setLatLng(center);
  }
}

function refreshEmergencyMarkers() {
  const mapElement = document.getElementById("map");
  if (!mapElement || typeof L === "undefined") {
    return;
  }

  // Remove old markers
  if (mapInstance && Array.isArray(emergencyMarkers)) {
    emergencyMarkers.forEach((m) => {
      try {
        mapInstance.removeLayer(m);
      } catch (e) {
        console.error(e);
      }
    });
  }
  emergencyMarkers = [];

  let bounds = null;

  for (const e of emergenciesList) {
    const rawLat = e.latitude ?? e.lat ?? e.lat_deg ?? e.Latitude;
    const rawLon = e.longitude ?? e.lon ?? e.lng ?? e.lon_deg ?? e.Longitude;
    let lat = typeof rawLat === "number" ? rawLat : parseFloat(rawLat);
    let lon = typeof rawLon === "number" ? rawLon : parseFloat(rawLon);

    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      if (lon >= -90 && lon <= 90 && lat >= -180 && lat <= 180) {
        [lat, lon] = [lon, lat];
      }
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const center = [lat, lon];

    if (!mapInstance) {
      mapInstance = L.map(mapElement, {
        center,
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          attribution: "© OpenStreetMap, © CARTO",
        }
      ).addTo(mapInstance);
    }

    const marker = L.circleMarker(center, {
      radius: 8,
      color: "#b91c1c",
      fillColor: "#ef4444",
      fillOpacity: 0.9,
      weight: 2,
      title: e.title || "Emergency location",
    }).addTo(mapInstance);

    emergencyMarkers.push(marker);

    if (!bounds) {
      bounds = L.latLngBounds(center, center);
    } else {
      bounds.extend(center);
    }
  }

  // Include user location in bounds if present
  if (mapInstance && userMarker && userMarker.getLatLng) {
    const userLatLng = userMarker.getLatLng();
    if (userLatLng) {
      if (!bounds) {
        bounds = L.latLngBounds(userLatLng, userLatLng);
      } else {
        bounds.extend(userLatLng);
      }
    }
  }

  if (mapInstance && bounds) {
    mapInstance.fitBounds(bounds, { padding: [20, 20], maxZoom: 17 });
  }
}

function playEmergencySound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;

    if (!audioCtx) {
      audioCtx = new Ctx();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";

    // Three urgent beeps: high–low–high
    const scheduleBeep = (startOffset, duration, freq) => {
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(0.001, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(
        0.7,
        now + startOffset + 0.02
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + startOffset + duration
      );
    };

    scheduleBeep(0.0, 0.25, 1400);
    scheduleBeep(0.35, 0.25, 900);
    scheduleBeep(0.7, 0.3, 1500);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  } catch (e) {
    console.error(e);
  }
}

function showEmergencyPopup(title, description, locationText) {
  if (!emergencyPopupOverlayEl) return;

  if (emergencyPopupTitleEl) {
    emergencyPopupTitleEl.textContent = title || "Emergency alert";
  }
  if (emergencyPopupDescEl) {
    emergencyPopupDescEl.textContent = description || "An emergency has been reported.";
  }
  if (emergencyPopupLocationEl) {
    emergencyPopupLocationEl.textContent = locationText ? `Location: ${locationText}` : "";
    emergencyPopupLocationEl.style.display = locationText ? "block" : "none";
  }

  emergencyPopupOverlayEl.classList.remove("emergency-popup--hidden");
  emergencyPopupOverlayEl.classList.add("emergency-popup--visible");
}

function hideEmergencyPopup() {
  if (!emergencyPopupOverlayEl) return;
  emergencyPopupOverlayEl.classList.remove("emergency-popup--visible");
  emergencyPopupOverlayEl.classList.add("emergency-popup--hidden");
}

function handleIncomingEmergency(emergency) {
  if (!emergency) return;

  const title = emergency.title || "Emergency";
  const description = emergency.description || "";
  const emergencyRoleRaw = emergency.role ?? emergency.Role;
  const emergencyRole = emergencyRoleRaw ? String(emergencyRoleRaw).toLowerCase() : "";
  const userRole = currentUser?.user_metadata?.role
    ? String(currentUser.user_metadata.role).toLowerCase()
    : "";
  const userId = currentUser?.id || null;

  // Only show emergencies whose id matches this user's id (assigned to them)
  if (userId && emergency.id && emergency.id !== userId) {
    return;
  }

  // Filter by role: show all if user has no role, or if emergency has no role / 'all',
  // or if roles match.
  if (
    userRole &&
    emergencyRole &&
    emergencyRole !== "all" &&
    emergencyRole !== userRole
  ) {
    return;
  }

  // Support multiple column names (Supabase/Postgres can vary) and parse strings
  const rawLat =
    emergency.latitude ?? emergency.lat ?? emergency.lat_deg ?? emergency.Latitude;
  const rawLon =
    emergency.longitude ?? emergency.lon ?? emergency.lng ?? emergency.lon_deg ?? emergency.Longitude;
  let lat = typeof rawLat === "number" ? rawLat : parseFloat(rawLat);
  let lon = typeof rawLon === "number" ? rawLon : parseFloat(rawLon);

  // Fix swapped lat/lon: latitude must be [-90,90], longitude [-180,180]
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      // Valid as-is
    } else if (lon >= -90 && lon <= 90 && lat >= -180 && lat <= 180) {
      [lat, lon] = [lon, lat]; // was swapped
    } else {
      lat = Number.NaN;
      lon = Number.NaN;
    }
  }

  const coordsValid = Number.isFinite(lat) && Number.isFinite(lon);

  // Add to list and re-render
  emergenciesList.unshift(emergency);
  renderEmergencyList(emergenciesList);

  const locationText = coordsValid
    ? `${lat.toFixed(4)}, ${lon.toFixed(4)}`
    : "";

  showEmergencyPopup(title, description, locationText);
  playEmergencySound();
}

function renderEmergencyList(emergencies) {
  if (!emergencyListEl) return;

  emergencyListEl.innerHTML = "";

  if (emergencyEmptyEl) {
    emergencyEmptyEl.style.display = emergencies.length === 0 ? "block" : "none";
  }

  for (const e of emergencies) {
    const rawLat = e.latitude ?? e.lat ?? e.lat_deg ?? e.Latitude;
    const rawLon = e.longitude ?? e.lon ?? e.lng ?? e.lon_deg ?? e.Longitude;
    let lat = typeof rawLat === "number" ? rawLat : parseFloat(rawLat);
    let lon = typeof rawLon === "number" ? rawLon : parseFloat(rawLon);
    if (lon >= -90 && lon <= 90 && lat >= -180 && lat <= 180) {
      [lat, lon] = [lon, lat];
    }
    const coordsValid = Number.isFinite(lat) && Number.isFinite(lon);
    const title = e.title || "Emergency";
    const description = e.description || "";
    const rawRole = e.role ?? e.Role;
    const role = rawRole ? String(rawRole) : "";
    const rawImportance = e.importance ?? e.Importance;
    const importanceNum = Number.isFinite(rawImportance)
      ? rawImportance
      : parseInt(rawImportance, 10);
    let importanceLabel = "";
    let importanceClass = "normal";
    if (Number.isFinite(importanceNum)) {
      if (importanceNum >= 3) {
        importanceLabel = "Critical";
        importanceClass = "critical";
      } else if (importanceNum === 2) {
        importanceLabel = "High";
        importanceClass = "high";
      } else {
        importanceLabel = "Normal";
        importanceClass = "normal";
      }
    }

    const li = document.createElement("li");
    li.className = "emergency-item";

    const roleClass =
      role && typeof role === "string"
        ? `emergency-role-pill--${role.toLowerCase()}`
        : "";

    li.innerHTML =
      `<div class="emergency-status-dot emergency-status-dot--${importanceClass}"></div>` +
      `<div class="emergency-item-main">` +
      `<span class="emergency-item-title">${escapeHtml(title)}</span>` +
      (description
        ? `<p class="emergency-item-desc">${escapeHtml(description)}</p>`
        : "") +
      (coordsValid
        ? `<p class="emergency-item-coords">${lat.toFixed(
            4
          )}, ${lon.toFixed(4)}</p>`
        : "") +
      `</div>` +
      `<div class="emergency-item-meta">` +
      (role
        ? `<span class="emergency-role-pill ${roleClass}">${escapeHtml(
            String(role).toUpperCase()
          )}</span>`
        : "") +
      (importanceLabel
        ? `<span class="emergency-importance">${importanceLabel}</span>`
        : "") +
      `</div>`;
    emergencyListEl.appendChild(li);
  }

  refreshEmergencyMarkers();
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function fetchEmergencies() {
  if (!client) return;
  try {
    const { data, error } = await client
      .from("emergencies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    const all = data || [];
    const userId = currentUser?.id || null;
    const userRole = currentUser?.user_metadata?.role
      ? String(currentUser.user_metadata.role).toLowerCase()
      : "";

    const filtered = all.filter((e) => {
      if (userId && e.id && e.id !== userId) {
        return false;
      }
      const rawRole = e.role ?? e.Role;
      const emergencyRole = rawRole ? String(rawRole).toLowerCase() : "";
      if (!userRole) return true;
      if (!emergencyRole || emergencyRole === "all") return true;
      return emergencyRole === userRole;
    });

    emergenciesList = filtered;
    renderEmergencyList(emergenciesList);
  } catch (err) {
    console.error(err);
  }
}

function setupEmergencyRealtime() {
  if (emergenciesChannel || !client) return;

  emergenciesChannel = client
    .channel("public:emergencies")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "emergencies" },
      (payload) => {
        handleIncomingEmergency(payload.new);
      }
    )
    .subscribe();
}

function requestLocationOnce() {
  if (!supportsGeolocation()) {
    if (locationStatusEl) {
      locationStatusEl.textContent =
        "Location is not available on this device.";
    }
    return;
  }

  setLocationLoading(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      setLocationLoading(false);
      const { latitude, longitude, accuracy } = position.coords;

      if (locationCoordsEl) {
        locationCoordsEl.textContent = `${latitude.toFixed(
          5
        )}, ${longitude.toFixed(5)}`;
      }

      if (locationStatusEl) {
        const acc = Number.isFinite(accuracy) ? Math.round(accuracy) : null;
        locationStatusEl.textContent = acc
          ? `Accurate to about ${acc} meters.`
          : "Location updated.";
      }

      updateMapWithLocation(latitude, longitude, accuracy);

      try {
        const userForLocation = currentUser;
        if (!userForLocation) {
          if (locationStatusEl) {
            locationStatusEl.textContent +=
              " (Not signed in; not sent to server.)";
          }
          return;
        }

        const { error: upsertError } = await client
          .from("user_locations")
          .upsert(
            {
              user_id: userForLocation.id,
              latitude,
              longitude,
              accuracy_m: Number.isFinite(accuracy) ? accuracy : null,
              role: userForLocation.user_metadata?.role || null,
            },
            { onConflict: "user_id" }
          );

        if (upsertError) {
          console.error(upsertError);
          if (locationStatusEl) {
            locationStatusEl.textContent += " (Could not sync to server.)";
          }
        } else if (locationStatusEl) {
          locationStatusEl.textContent += " Location synced to server.";
        }
      } catch (err) {
        console.error(err);
        if (locationStatusEl) {
          locationStatusEl.textContent += " (Could not sync to server.)";
        }
      }
    },
    (error) => {
      setLocationLoading(false);
      if (!locationStatusEl) return;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          locationStatusEl.textContent =
            "Location permission was denied. You can change this in your browser settings.";
          break;
        case error.POSITION_UNAVAILABLE:
          locationStatusEl.textContent =
            "Location information is unavailable on this device.";
          break;
        case error.TIMEOUT:
          locationStatusEl.textContent =
            "Getting your location timed out. Try again.";
          break;
        default:
          locationStatusEl.textContent = "Could not get your location.";
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }
  );
}

async function deleteLocationForCurrentUser() {
  const userForLocation = currentUser;
  if (!userForLocation) return;

  try {
    const { error } = await client
      .from("user_locations")
      .delete()
      .eq("user_id", userForLocation.id);

    if (error) {
      console.error(error);
    }
  } catch (err) {
    console.error(err);
  }
}

async function refreshSessionView() {
  try {
    const {
      data: { session },
      error,
    } = await client.auth.getSession();

    if (error) {
      console.error(error);
      showAuth();
      return;
    }

    if (session?.user) {
      showHome(session.user);
    } else {
      showAuth();
    }
  } catch (e) {
    console.error(e);
    showAuth();
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = loginForm.elements.email.value.trim();
  const password = loginForm.elements.password.value;

  if (!email || !password) {
    setAuthMessage("Enter your email and password.", "error");
    return;
  }

  setAuthMessage("");
  setLoading(loginSubmit, true, "Signing in…");

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  setLoading(loginSubmit, false);

  if (error) {
    console.error(error);
    setAuthMessage(error.message || "Unable to sign in.", "error");
    return;
  }

  setAuthMessage("Signed in successfully.", "success");
  if (data.session?.user) {
    showHome(data.session.user);
  } else {
    await refreshSessionView();
  }
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = signupForm.elements.email.value.trim();
  const password = signupForm.elements.password.value;
  const passwordConfirm = signupForm.elements.passwordConfirm.value;
  const role = (signupForm.elements.role?.value || "").trim();

  if (!email || !password || !role) {
    setAuthMessage("Email, password, and role are required.", "error");
    return;
  }

  if (password.length < 6) {
    setAuthMessage("Password must be at least 6 characters.", "error");
    return;
  }

  if (password !== passwordConfirm) {
    setAuthMessage("Passwords do not match.", "error");
    return;
  }

  setAuthMessage("");
  setLoading(signupSubmit, true, "Creating…");

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
      },
    },
  });

  setLoading(signupSubmit, false);

  if (error) {
    console.error(error);
    setAuthMessage(error.message || "Unable to sign up.", "error");
    return;
  }

  if (data.session?.user) {
    setAuthMessage("Account created. You are now signed in.", "success");
    showHome(data.session.user);
  } else {
    setAuthMessage(
      "Check your email to confirm your account, then return here to sign in.",
      "success"
    );
  }
});

signOutButton.addEventListener("click", async () => {
  signOutButton.disabled = true;
  stopLocationUpdates();
  await deleteLocationForCurrentUser();

  const { error } = await client.auth.signOut();
  signOutButton.disabled = false;

  if (error) {
    console.error(error);
    setAuthMessage("Unable to sign out right now.", "error");
    return;
  }

  setAuthMessage("Signed out.", "success");
  await refreshSessionView();
});

tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("tab-button--active");
  tabSignup.classList.remove("tab-button--active");
  loginForm.classList.add("active");
  signupForm.classList.remove("active");
  setAuthMessage("");
});

tabSignup.addEventListener("click", () => {
  tabSignup.classList.add("tab-button--active");
  tabLogin.classList.remove("tab-button--active");
  signupForm.classList.add("active");
  loginForm.classList.remove("active");
  setAuthMessage("");
});

if (emergencyPopupCloseEl) {
  emergencyPopupCloseEl.addEventListener("click", () => {
    hideEmergencyPopup();
  });
}

if (getLocationButton) {
  getLocationButton.addEventListener("click", () => {
    requestLocationOnce();

    if (locationIntervalId === null) {
      locationIntervalId = setInterval(() => {
        requestLocationOnce();
      }, 15000);
    }
  });
}

window.addEventListener("beforeunload", () => {
  stopLocationUpdates();
  // Fire and forget; may not always complete before tab closes.
  deleteLocationForCurrentUser();
});

client.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    showHome(session.user);
  } else {
    showAuth();
  }
});

setupEmergencyRealtime();

refreshSessionView();

