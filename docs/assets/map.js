document.getElementById('mapControls').open = !window.matchMedia('(max-width:680px)').matches;
const typeMeta = {
    "LT01": {
        "label": "Rocky coastal landscape",
        "color": "#5F625C"
    },
    "LT02": {
        "label": "Sandy coastal landscape",
        "color": "#E2DB9B"
    },
    "LT03": {
        "label": "Agricultural fracture-valley landscape",
        "color": "#5B4938"
    },
    "LT04": {
        "label": "Forested fracture-valley landscape",
        "color": "#183D24"
    },
    "LT05": {
        "label": "Plain and agricultural landscape",
        "color": "#EFE36F"
    }
};
    const v9Meta = {
    "1": {
        "label": "Settlement and activity cores",
        "color": "#6E7C91",
        "factor": "F4"
    },
    "2": {
        "label": "Fracture-valley influenced transition landscape",
        "color": "#8B6B45",
        "factor": "F1"
    },
    "3": {
        "label": "Mixed everyday landscape with a low factor profile",
        "color": "#D8C97A",
        "factor": "mixed"
    },
    "4": {
        "label": "Aeolian sand and sandy coast - core zone",
        "color": "#D5B08A",
        "factor": "F2"
    },
    "5": {
        "label": "Fracture valley and steep relief - core zone with sand/coast",
        "color": "#8B6B45",
        "factor": "F1"
    },
    "6": {
        "label": "Open and low-lying mixed landscape",
        "color": "#9AA8B8",
        "factor": "F5"
    },
    "7": {
        "label": "Forest and protected nature - core zone",
        "color": "#5B7F4A",
        "factor": "F3"
    },
    "8": {
        "label": "Sandy and coastal landscape",
        "color": "#D5B08A",
        "factor": "F2"
    }
};
    const factorLabels = {
    "F1": "Fracture valleys and steep relief",
    "F2": "Aeolian sand and sandy coast",
    "F3": "Forest and protected nature",
    "F4": "Settlement and built structure",
    "F5": "Low-lying open land"
};
    const datasets = {
    "10": {
        "label": "R10 detail",
        "url": "../data/landscape-r10.geojson",
        "count": 47117,
        "note": "Source resolution"
    },
    "9": {
        "label": "R9 local",
        "url": "../data/landscape-r9.geojson",
        "count": 6854,
        "note": "Fine rollup"
    },
    "8": {
        "label": "R8 regional",
        "url": "../data/landscape-r8.geojson",
        "count": 1029,
        "note": "Regional view"
    },
    "7": {
        "label": "R7 overview",
        "url": "../data/landscape-r7.geojson",
        "count": 166,
        "note": "Broad overview"
    },
    "6": {
        "label": "R6 whole island",
        "url": "../data/landscape-r6.geojson",
        "count": 32,
        "note": "Most generalized"
    }
};
    const factorLimit = 4.5;
    const dataCache = new Map();
    let activeLayer = null;
    let activeResolution = null;
    let renderedResolution = null;
    let activeView = "landscape";
    let currentFactor = "F1";
    let fillOpacity = 0.72;
    let autoMode = true;
    let firstFit = true;
    let resolutionRequest = 0;

    const map = L.map("map", {
      preferCanvas: true,
      zoomControl: false,
      attributionControl: true
    }).setView([55.14, 14.92], 9);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const statusEl = document.getElementById("status");
    const toolbar = document.getElementById("resolutionToolbar");
    const legend = document.getElementById("legend");
    const factorControls = document.getElementById("factorControls");
    const opacitySlider = document.getElementById("opacitySlider");
    const opacityValue = document.getElementById("opacityValue");

    document.getElementById("zoomIn").addEventListener("click", () => map.zoomIn());
    document.getElementById("zoomOut").addEventListener("click", () => map.zoomOut());

    function escapeHtml(value) {
      return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char]));
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function hexToRgb(hex) {
      const value = hex.replace("#", "");
      return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
    }

    function rgbToHex(rgb) {
      return "#" + rgb.map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0")).join("");
    }

    function lerpColor(left, right, share) {
      const leftRgb = hexToRgb(left);
      const rightRgb = hexToRgb(right);
      return rgbToHex(leftRgb.map((value, index) => value + (rightRgb[index] - value) * share));
    }

    function factorColor(value) {
      const number = Number(value);
      if (!Number.isFinite(number)) {
        return "#d6d6d6";
      }
      const clamped = clamp(number, -factorLimit, factorLimit);
      if (clamped < 0) {
        return lerpColor("#4f6d9a", "#f7f4ec", (clamped + factorLimit) / factorLimit);
      }
      return lerpColor("#f7f4ec", "#b65f57", clamped / factorLimit);
    }

    function clusterKey(props) {
      return String(props.v9_cluster || props.class_km || props.class_k8 || props.cluster || "?");
    }

    function factorValueLine(props, factor) {
      const value = Number(props[factor]);
      return `${factor} ${factorLabels[factor] || factor}: ${Number.isFinite(value) ? value.toFixed(2) : "missing"}`;
    }

    function setFactorControlsEnabled() {
      for (const input of factorControls.querySelectorAll("input")) {
        input.disabled = activeView !== "factor";
      }
    }

    function refreshLegend() {
      legend.innerHTML = "";
      const title = document.createElement("div");
      title.className = "legend-title";
      legend.appendChild(title);

      if (activeView === "factor") {
        title.textContent = `Factor ${currentFactor}`;
        const text = document.createElement("div");
        text.className = "legend-row";
        text.style.gridTemplateColumns = "1fr";
        text.innerHTML = `<span>${escapeHtml(factorLabels[currentFactor] || currentFactor)}</span><div class="factor-ramp"></div><div class="factor-scale"><span>−${factorLimit.toFixed(1)}</span><span>0</span><span>${factorLimit.toFixed(1)}</span></div>`;
        legend.appendChild(text);
        return;
      }

      const meta = activeView === "structure" ? v9Meta : typeMeta;
      title.textContent = activeView === "structure" ? "Structures" : "Landscape types";
      for (const [id, item] of Object.entries(meta)) {
        const row = document.createElement("div");
        row.className = "legend-row";
        row.innerHTML = `<span class="swatch" style="background:${item.color}"></span><span>${escapeHtml(id)} · ${escapeHtml(item.label)}</span>`;
        legend.appendChild(row);
      }
    }

    function colorForFeature(feature) {
      const props = feature.properties || {};
      if (activeView === "factor") {
        return factorColor(props[currentFactor]);
      }
      if (activeView === "structure") {
        const meta = v9Meta[clusterKey(props)] || {};
        return meta.color || "#999999";
      }
      const typeId = props.v10_type_id || props.landscape_type || "LT?";
      const meta = typeMeta[typeId] || {};
      // R9-R6 exports contain an older palette. Use the legend's class palette
      // at every resolution; retain the existing class and geometry rollups.
      return meta.color || "#999999";
    }

    function popupForFeature(feature) {
      const props = feature.properties || {};
      const typeId = props.v10_type_id || props.landscape_type || "LT?";
      const type = typeMeta[typeId] || {};
      const cluster = clusterKey(props);
      const structure = v9Meta[cluster] || {};
      const typeName = type.label || props.v10_type_name_en || props.v10_type_name || typeId;
      const structureName = structure.label || props.v9_cluster_label || `Cluster ${cluster}`;
      const confidence = props.v10_confidence || props.confidence || "";
      return [
        `<strong>${escapeHtml(props.hex_id || "")}</strong>`,
        `<strong>${escapeHtml(typeId)} ${escapeHtml(typeName)}</strong>`,
        `Structure ${escapeHtml(cluster)}: ${escapeHtml(structureName)}`,
        confidence ? `Interpretation confidence: ${escapeHtml(confidence)}` : "",
        factorValueLine(props, "F1"),
        factorValueLine(props, "F2"),
        factorValueLine(props, "F3"),
        factorValueLine(props, "F4"),
        factorValueLine(props, "F5")
      ].filter(Boolean).join("<br>");
    }

    async function loadDataset(resolution) {
      if (dataCache.has(resolution)) {
        return dataCache.get(resolution);
      }
      const dataset = datasets[String(resolution)];
      const response = await fetch(dataset.url);
      if (!response.ok) {
        throw new Error(`Could not load ${dataset.url}`);
      }
      const data = await response.json();
      dataCache.set(resolution, data);
      return data;
    }

    function updateButtons(resolution) {
      for (const button of toolbar.querySelectorAll("button")) {
        const isAuto = button.dataset.mode === "auto";
        const isResolution = button.dataset.resolution === String(resolution);
        button.classList.toggle("active", (autoMode && isAuto) || (!autoMode && isResolution));
      }
    }

    function updateStatus(resolution, loading = false) {
      const dataset = datasets[String(resolution)];
      const count = new Intl.NumberFormat("en-GB").format(dataset.count);
      const viewLabel = activeView === "factor" ? `factor ${currentFactor}` : activeView === "structure" ? "structures" : "landscape types";
      statusEl.innerHTML = `${loading ? "Loading" : "Showing"} ${dataset.label}<span>${dataset.note}. ${count} hexagons. View: ${viewLabel}. ${autoMode ? "Auto rollup is active." : "Manual resolution selected."}</span>`;
    }

    function styleFeature(feature) {
      return {
        color: "rgba(27, 36, 29, 0.10)",
        opacity: 0.65,
        weight: 0.12,
        fillColor: colorForFeature(feature),
        fillOpacity
      };
    }

    async function showResolution(resolution) {
      const requestId = ++resolutionRequest;
      if (renderedResolution === resolution && activeLayer) {
        activeResolution = resolution;
        updateButtons(resolution);
        updateStatus(resolution, false);
        return;
      }
      activeResolution = resolution;
      updateButtons(resolution);
      updateStatus(resolution, true);
      let data;
      try { data = await loadDataset(resolution); }
      catch (error) { if (requestId === resolutionRequest) { activeResolution = null; statusEl.innerHTML = `The map could not be loaded<span>${escapeHtml(error.message)}</span>`; } return; }
      if (requestId !== resolutionRequest) return;
      if (activeLayer) {
        map.removeLayer(activeLayer);
      }
      activeLayer = L.geoJSON(data, {
        style: styleFeature,
        onEachFeature: (feature, layer) => {
          layer.bindPopup(popupForFeature(feature));
          layer.on("mouseover", () => layer.setStyle({ color: "rgba(27, 36, 29, 0.26)", opacity: 0.75, weight: 0.45, fillOpacity: Math.min(fillOpacity + 0.12, 0.95) }));
          layer.on("mouseout", () => layer.setStyle(styleFeature(feature)));
        }
      }).addTo(map);
      renderedResolution = resolution;
      updateStatus(resolution, false);
      refreshLegend();
      if (firstFit) {
        firstFit = false;
        const topPadding = window.innerWidth <= 680 ? document.querySelector('.panel').offsetHeight + 18 : 18;
        map.fitBounds(activeLayer.getBounds(), { paddingTopLeft: [18, topPadding], paddingBottomRight: [18, 18] });
      }
    }

    function resolutionForZoom(zoom) {
      if (zoom >= 12) return 10;
      if (zoom >= 11) return 9;
      if (zoom >= 9) return 8;
      if (zoom >= 7) return 7;
      return 6;
    }

    toolbar.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      if (button.dataset.mode === "auto") {
        autoMode = true;
        showResolution(resolutionForZoom(map.getZoom()));
        return;
      }
      autoMode = false;
      showResolution(Number(button.dataset.resolution));
    });

    map.on("zoomend", () => {
      if (autoMode) {
        showResolution(resolutionForZoom(map.getZoom()));
      }
    });

    document.addEventListener("change", (event) => {
      const target = event.target;
      if (!target) return;
      if (target.name === "viewMode") {
        activeView = target.value;
        setFactorControlsEnabled();
        if (activeLayer) {
          activeLayer.setStyle(styleFeature);
        }
        refreshLegend();
        updateStatus(activeResolution || resolutionForZoom(map.getZoom()), false);
      }
      if (target.name === "factor") {
        currentFactor = target.value;
        if (activeLayer) {
          activeLayer.setStyle(styleFeature);
        }
        refreshLegend();
        updateStatus(activeResolution || resolutionForZoom(map.getZoom()), false);
      }
    });

    opacitySlider.addEventListener("input", () => {
      fillOpacity = Number(opacitySlider.value) / 100;
      opacityValue.textContent = `${opacitySlider.value}%`;
      if (activeLayer) {
        activeLayer.setStyle(styleFeature);
      }
    });

    setFactorControlsEnabled();
    refreshLegend();
    showResolution(resolutionForZoom(map.getZoom())).catch((error) => {
      statusEl.innerHTML = `The map could not be loaded<span>${escapeHtml(error.message)}</span>`;
    });
