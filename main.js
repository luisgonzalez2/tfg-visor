// *** CARGA DE DATOS ************************************************************************************************
// Lee el archivo csv con medias de indicadores, necesario para indicar info general sobre de los indicadores
// *******************************************************************************************************************

let csv_medias_indicadores_cluster = [];

function loadCSV_medias(filePath) {
  return fetch(filePath)
    .then((response) => response.text())
    .then((data) => {
      const rows = data.split("\n").slice(1);
      return rows.map((row) => {
        const values = row.split(";");
        return { Indicador: values[0], Tipo_agrupacion: values[1], Cluster: values[2], Media: parseFloat(values[3]) };
      });
    });
}

loadCSV_medias("./data/csv/medias_indicadores_cluster.csv")
  .then((data) => {
    csv_medias_indicadores_cluster = data;
  })
  .catch((error) => {
    console.error("Error al cargar el CSV:", error);
  });

// *** MENÚ **********************************************************************************************************
// Gestiona el funcionamiento del menú: selección de indicador/cluster
// *******************************************************************************************************************

// Función que gestiona la selección de elementos del menú
document.addEventListener("DOMContentLoaded", () => {
  const uls = document.querySelectorAll("ul");
  uls.forEach((ul) => {
    const listItems = ul.querySelectorAll("li");
    listItems.forEach((item) => {
      item.addEventListener("click", () => {
        const isSelected = item.classList.contains("selected");
        listItems.forEach((li) => li.classList.remove("selected"));
        if (!isSelected) item.classList.add("selected");
        updateSubtitle();
      });
    });
  });
});

// Función que gestiona los desplegables del menú
document.addEventListener("DOMContentLoaded", () => {
  const dropdowns = document.querySelectorAll(".dropdown");
  dropdowns.forEach((dropdown) => {
    const listItems = dropdown.querySelectorAll(".dropdown-content li");
    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = dropdown.classList.contains("active");
      dropdowns.forEach((d) => {
        if (d !== dropdown) d.classList.remove("active");
      });
      dropdown.classList.toggle("active", !isActive);
    });
    listItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        listItems.forEach((li) => li.classList.remove("selected"));
        item.classList.add("selected");
        updateSubtitle();
      });
    });
  });
});

// Función que indica que agrupación se ha seleccionado
function updateSubtitle() {
  const selectedIndicator = document.querySelector(".menu-title + ul > li.selected");
  const selectedClusterType = document.querySelector(".dropdown-content li.selected");
  const infoSubtitle = document.getElementById("info-subtitle");
  if (selectedIndicator && selectedClusterType) {
    const selectedCluster = selectedClusterType.closest(".dropdown");
    const parentText = selectedCluster ? selectedCluster.firstChild.textContent.trim() : "";
    infoSubtitle.textContent = `(Agrupado por ${parentText.toLowerCase()}: ${selectedClusterType.textContent})`;
  } else {
    infoSubtitle.textContent = "* del grupo seleccionado";
  }
}

// *** ACTUALIZACIÓN DE INFO SOBRE INDICADORES ***********************************************************************
// Incorpora datos (2015-2020) sobre los valores medios de los indicadores
// *******************************************************************************************************************

const infoTitle = document.getElementById("info-title"); // Título: ¿qué info muestra?
const infoContent = document.getElementById("info-content"); // Info a mostrar
let clusterElegido; // Variable global para almacenar el valor del cluster elegido
let selectedIndicator = ""; // Variable global para almacenar el valor del indicador elegido
let selectedCluster = ""; // Variable global para almacenar el valor del cluster elegido

// Función para formatear los números que se muestran - dos decimales
const formatNumber = (number) => {
  return number.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Función para actualizar el contenido de #info-content
const updateInfoContent = (title, data) => {
  infoTitle.textContent = title;
  infoContent.innerHTML = data
    .map((d) => `<p class="data">${d.Indicador} ${d.Year || ""}: ${formatNumber(d.Media)}</p>`)
    .join("");
  // Llamar a la función para actualizar el gráfico
  updateChart(data);
};

// Correspondencia para modificar los títulos
const menuItems = {
  "Variación de PIB": "Media de PIB",
  "Variación de PIB per cápita": "Media de PIB per cápita",
  "Variación de unidades productivas": "Media de Unidades productivas",
  "Variación de número de empresas totales": "Media de Número de empresas totales",
};

// Función para obtener el indicador
const getIndicator = (menuItem) => {
  const indicators = {
    "Variación de PIB": "pib",
    "Variación de PIB per cápita": "pib_capita",
    "Variación de unidades productivas": "u_productivas",
    "Variación de número de empresas totales": "nempresas_total",
  };
  return indicators[menuItem] || "";
};

// Función para obtener el tipo de agrupación
const getAggregationType = (dropdownItem) => {
  const aggregationTypes = {
    Población: "Poblacion",
    Densidad: "Densidad",
    "Distancia a la capital (km)": "Distancia",
    "Zonas estadísticas": "Zona_Estadistica",
  };
  return aggregationTypes[dropdownItem] || "";
};

// Función para obtener el cluster
const getCluster = (dropdownItem) => {
  const clusterText = dropdownItem.textContent.trim();
  if (clusterText.startsWith("C")) return clusterText.charAt(1);
  return clusterText;
};

// Función para manejar la selección de elementos del menú
const handleMenuSelection = () => {
  const selectedMenuItem = document.querySelector(".menu-title + ul > li.selected");
  const selectedDropdownItem = document.querySelector(".dropdown-content li.selected");
  if (selectedMenuItem) {
    selectedIndicator = selectedMenuItem.textContent.trim();
    infoTitle.textContent = menuItems[selectedIndicator];
  }
  if (selectedMenuItem && selectedDropdownItem) {
    selectedCluster = selectedDropdownItem.textContent.trim();
    // Asignar el valor a clusterElegido según la correspondencia
    if (selectedCluster === "C0 - 55 a 4.306 habitantes") {
      clusterElegido = "poblacion_c0";
    } else if (selectedCluster === "C1 - 22.453 a 34.653 habitantes") {
      clusterElegido = "poblacion_c1";
    } else if (selectedCluster === "C2 - 12.542 a 20.704 habitantes") {
      clusterElegido = "poblacion_c2";
    } else if (selectedCluster === "C3 - 4.436 a 10.699 habitantes") {
      clusterElegido = "poblacion_c3";
    } else if (selectedCluster === "C0 - 1,8 a 150,04 personas por km") {
      clusterElegido = "densidad_c0";
    } else if (selectedCluster === "C1 - 930,46 a 1734,84 personas por km") {
      clusterElegido = "densidad_c1";
    } else if (selectedCluster === "C2 - 420,84 a 767,6 personas por km") {
      clusterElegido = "densidad_c2";
    } else if (selectedCluster === "C3 - 175,3 a 391,28 personas por km") {
      clusterElegido = "densidad_c3";
    } else if (selectedCluster === "C0 - 54,784 a 72,696 km") {
      clusterElegido = "distancia_c0";
    } else if (selectedCluster === "C1 - 21,041 a 40,449 km") {
      clusterElegido = "distancia_c1";
    } else if (selectedCluster === "C2 - 74,92 a 103,62 km") {
      clusterElegido = "distancia_c2";
    } else if (selectedCluster === "C3 - 41,51 a 53,9 km") {
      clusterElegido = "distancia_c3";
    } else if (selectedCluster === "Sierra Norte") {
      clusterElegido = "zona_sierra_norte";
    } else if (selectedCluster === "Este Metropolitano") {
      clusterElegido = "zona_este_metropolitano";
    } else if (selectedCluster === "Sudoeste Comunidad") {
      clusterElegido = "zona_sudoeste_comunidad";
    } else if (selectedCluster === "Norte Metropolitano") {
      clusterElegido = "zona_norte_metropolitano";
    } else if (selectedCluster === "Sur Metropolitano") {
      clusterElegido = "zona_sur_metropolitano";
    } else if (selectedCluster === "Sierra Central") {
      clusterElegido = "zona_sierra_central";
    } else if (selectedCluster === "Sudeste Comunidad") {
      clusterElegido = "zona_sudeste_comunidad";
    } else if (selectedCluster === "Oeste Metropolitano") {
      clusterElegido = "zona_oeste_metropolitano";
    } else if (selectedCluster === "Sierra Sur") {
      clusterElegido = "zona_sierra_sur";
    } else if (selectedCluster === "Nordeste Comunidad") {
      clusterElegido = "zona_nordeste_comunidad";
    } else if (selectedCluster === "Municipio de Madrid") {
      clusterElegido = "zona_municipio_madrid";
    }
    const indicador = getIndicator(selectedIndicator);
    const tipoAgrupacion = getAggregationType(selectedDropdownItem.closest(".dropdown").firstChild.textContent.trim());
    const cluster = getCluster(selectedDropdownItem);
    if (indicador && tipoAgrupacion && cluster) {
      loadCSV_medias("./data/csv/medias_indicadores_cluster.csv").then((data) => {
        let filteredData;
        if (indicador === "pib") {
          filteredData = data.filter(
            (d) =>
              (d.Indicador === "pib_2015" ||
                d.Indicador === "pib_2016" ||
                d.Indicador === "pib_2017" ||
                d.Indicador === "pib_2018" ||
                d.Indicador === "pib_2019" ||
                d.Indicador === "pib_2020") &&
              d.Tipo_agrupacion === tipoAgrupacion &&
              d.Cluster === cluster
          );
        } else if (indicador === "nempresas_total") {
          filteredData = data.filter(
            (d) =>
              (d.Indicador === "nempresas_total_2015" ||
                d.Indicador === "nempresas_total_2016" ||
                d.Indicador === "nempresas_total_2017" ||
                d.Indicador === "nempresas_total_2018" ||
                d.Indicador === "nempresas_total_2019" ||
                d.Indicador === "nempresas_total_2020") &&
              d.Tipo_agrupacion === tipoAgrupacion &&
              d.Cluster === cluster
          );
        } else {
          filteredData = data.filter(
            (d) => d.Indicador.startsWith(indicador) && d.Tipo_agrupacion === tipoAgrupacion && d.Cluster === cluster
          );
        }
        updateInfoContent(menuItems[selectedIndicator], filteredData);
        updateMap();
      });
    }
  }
};

// Añade eventos a los elementos del menú y desplegables
const indicadoresListItems = document.querySelectorAll(".menu-title + ul > li");
indicadoresListItems.forEach((item) => {
  item.addEventListener("click", handleMenuSelection);
});
const dropdownItems = document.querySelectorAll(".dropdown-content li");
dropdownItems.forEach((item) => {
  item.addEventListener("click", handleMenuSelection);
});

// Verifica si algún elemento está seleccionado y actualiza #info-content y #var
const checkSelection = () => {
  const selectedItems = document.querySelectorAll(".menu-title + ul > li.selected");
  const separators = document.querySelectorAll(".separator");
  const infoSubtitle = document.getElementById("info-subtitle");
  if (selectedItems.length === 0) {
    infoTitle.textContent = "";
    infoContent.innerHTML = "";
    separators.forEach((separator) => (separator.style.display = "none"));
    infoSubtitle.style.display = "none";
  } else {
    separators.forEach((separator) => (separator.style.display = "block"));
    infoSubtitle.style.display = "block";
  }
};

// Llama a checkSelection al cargar la página y después de cada clic en los elementos del menú
document.addEventListener("DOMContentLoaded", checkSelection);
indicadoresListItems.forEach((item) => {
  item.addEventListener("click", checkSelection);
});
dropdownItems.forEach((item) => {
  item.addEventListener("click", checkSelection);
});

// Gráfico para ver la evolución del valor medio de los indicadores
let myChart;
document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("myChart").getContext("2d");
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["2015", "2016", "2017", "2018", "2019", "2020"],
      datasets: [{ label: "", data: [], borderColor: "#6e5796", borderWidth: 2, fill: false }],
    },
    options: {
      scales: {
        x: { beginAtZero: true, ticks: { color: "#ffffff" }, grid: { color: "#9589ac" } },
        y: { beginAtZero: true, ticks: { color: "#ffffff" }, grid: { color: "#9589ac" } },
      },
      plugins: { legend: { display: false } },
    },
  });
});

// Actualiza el gráfico tomando los valores de los indicadores por año
const updateChart = (data) => {
  const years = ["2015", "2016", "2017", "2018", "2019", "2020"];
  const values = data.map((d) => parseFloat(d.Media.toString().replace(",", ".")));
  myChart.data.labels = years;
  myChart.data.datasets[0].data = values;
  myChart.options.scales.y.min = Math.min(...values) * 0.95;
  myChart.options.scales.y.max = Math.max(...values) * 1.05;
  myChart.update();
  document.getElementById("myChart").style.display = "block";
};

// *** MAPA  *********************************************************************************************************
// Dibuja las dos capas del mapa, lo colorea, lo actualiza y muestra los popups de cada municipio
// *******************************************************************************************************************

let map; // Mapa
let municipiosLayer; // Capa de municipios

// Colorea los municipios representados, los que presentan un valor de indicador más alto, tienen color más oscuro
function getColor(value, min, max) {
  const ratio = (value - min) / (max - min);
  const lightPurple = { r: 216, g: 191, b: 216 };
  const darkPurple = { r: 66, g: 48, b: 99 };
  const red = Math.floor(lightPurple.r + ratio * (darkPurple.r - lightPurple.r));
  const green = Math.floor(lightPurple.g + ratio * (darkPurple.g - lightPurple.g));
  const blue = Math.floor(lightPurple.b + ratio * (darkPurple.b - lightPurple.b));
  return `rgba(${red}, ${green}, ${blue}, 0.35)`;
}

window.onload = initMap; // Inicializa el mapa al abrir la página

// Función que dibuja el mapa por defecto
function initMap() {
  map = new ol.Map({
    target: "main",
    layers: [new ol.layer.Tile({ source: new ol.source.OSM(), opacity: 0.7 })],
    view: new ol.View({
      center: ol.proj.fromLonLat([-3.70379, 40.41678]),
      zoom: 9,
      maxZoom: 10,
      minZoom: 9,
    }),
  });
  map.addControl(new ol.control.ScaleLine());
  map.addControl(new ol.control.ZoomSlider());
  updateMap();
  const fillStyle = new ol.style.Fill({
    color: [29, 185, 84, 0.1],
  });
  const strokeStyle = new ol.style.Stroke({
    color: [46, 45, 45, 0.8],
  });
  municipiosLayer = new ol.layer.VectorImage({
    source: new ol.source.Vector({
      url: "./data/vector_data/vacio.geojson",
      format: new ol.format.GeoJSON(),
    }),
    visible: true,
    title: "Capa de municipios",
    style: new ol.style.Style({
      fill: fillStyle,
      stroke: strokeStyle,
    }),
  });
  map.addLayer(municipiosLayer);
  const overlayContainerElement = document.querySelector(".overlay-container");
  const overlayLayer = new ol.Overlay({
    element: overlayContainerElement,
  });
  // Popup con nombre de ID, nombre de municipio e indicadores
  map.addOverlay(overlayLayer);
  const overlayID = document.getElementById("popup-id");
  const overlayMunicipio = document.getElementById("popup-municipio");
  const overlayIndicador15 = document.getElementById("popup-indicador-15");
  const overlayIndicador16 = document.getElementById("popup-indicador-16");
  const overlayIndicador17 = document.getElementById("popup-indicador-17");
  const overlayIndicador18 = document.getElementById("popup-indicador-18");
  const overlayIndicador19 = document.getElementById("popup-indicador-19");
  const overlayIndicador20 = document.getElementById("popup-indicador-20");
  map.on("click", function (e) {
    overlayLayer.setPosition(undefined);
    map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
      let clickedCoordinate = e.coordinate;
      let clickedID = feature.get("codigo_geo");
      let clickedMunicipio = feature.get("municipio_distrito");
      let clickedInd15, clickedInd16, clickedInd17, clickedInd18, clickedInd19, clickedInd20;
      if (selectedIndicator === "Variación de PIB") {
        if (selectedCluster.includes("habitantes")) {
          clickedInd15 = feature.get("Variacion_pib_2015_Cluster_Poblacion");
          clickedInd16 = feature.get("Variacion_pib_2016_Cluster_Poblacion");
          clickedInd17 = feature.get("Variacion_pib_2017_Cluster_Poblacion");
          clickedInd18 = feature.get("Variacion_pib_2018_Cluster_Poblacion");
          clickedInd19 = feature.get("Variacion_pib_2019_Cluster_Poblacion");
          clickedInd20 = feature.get("Variacion_pib_2020_Cluster_Poblacion");
        } else if (selectedCluster.includes("personas por km")) {
          clickedInd15 = feature.get("Variacion_pib_2015_Cluster_Densidad");
          clickedInd16 = feature.get("Variacion_pib_2016_Cluster_Densidad");
          clickedInd17 = feature.get("Variacion_pib_2017_Cluster_Densidad");
          clickedInd18 = feature.get("Variacion_pib_2018_Cluster_Densidad");
          clickedInd19 = feature.get("Variacion_pib_2019_Cluster_Densidad");
          clickedInd20 = feature.get("Variacion_pib_2020_Cluster_Densidad");
        } else if (selectedCluster.includes("km")) {
          clickedInd15 = feature.get("Variacion_pib_2015_Cluster_Distancia");
          clickedInd16 = feature.get("Variacion_pib_2016_Cluster_Distancia");
          clickedInd17 = feature.get("Variacion_pib_2017_Cluster_Distancia");
          clickedInd18 = feature.get("Variacion_pib_2018_Cluster_Distancia");
          clickedInd19 = feature.get("Variacion_pib_2019_Cluster_Distancia");
          clickedInd20 = feature.get("Variacion_pib_2020_Cluster_Distancia");
        } else {
          clickedInd15 = feature.get("Variacion_pib_2015_Zona_Estadistica");
          clickedInd16 = feature.get("Variacion_pib_2016_Zona_Estadistica");
          clickedInd17 = feature.get("Variacion_pib_2017_Zona_Estadistica");
          clickedInd18 = feature.get("Variacion_pib_2018_Zona_Estadistica");
          clickedInd19 = feature.get("Variacion_pib_2019_Zona_Estadistica");
          clickedInd20 = feature.get("Variacion_pib_2020_Zona_Estadistica");
        }
      } else if (selectedIndicator === "Variación de PIB per cápita") {
        if (selectedCluster.includes("habitantes")) {
          clickedInd15 = feature.get("Variacion_pib_capita_2015_Cluster_Poblacion");
          clickedInd16 = feature.get("Variacion_pib_capita_2016_Cluster_Poblacion");
          clickedInd17 = feature.get("Variacion_pib_capita_2017_Cluster_Poblacion");
          clickedInd18 = feature.get("Variacion_pib_capita_2018_Cluster_Poblacion");
          clickedInd19 = feature.get("Variacion_pib_capita_2019_Cluster_Poblacion");
          clickedInd20 = feature.get("Variacion_pib_capita_2020_Cluster_Poblacion");
        } else if (selectedCluster.includes("personas por km")) {
          clickedInd15 = feature.get("Variacion_pib_capita_2015_Cluster_Densidad");
          clickedInd16 = feature.get("Variacion_pib_capita_2016_Cluster_Densidad");
          clickedInd17 = feature.get("Variacion_pib_capita_2017_Cluster_Densidad");
          clickedInd18 = feature.get("Variacion_pib_capita_2018_Cluster_Densidad");
          clickedInd19 = feature.get("Variacion_pib_capita_2019_Cluster_Densidad");
          clickedInd20 = feature.get("Variacion_pib_capita_2020_Cluster_Densidad");
        } else if (selectedCluster.includes("km")) {
          clickedInd15 = feature.get("Variacion_pib_capita_2015_Cluster_Distancia");
          clickedInd16 = feature.get("Variacion_pib_capita_2016_Cluster_Distancia");
          clickedInd17 = feature.get("Variacion_pib_capita_2017_Cluster_Distancia");
          clickedInd18 = feature.get("Variacion_pib_capita_2018_Cluster_Distancia");
          clickedInd19 = feature.get("Variacion_pib_capita_2019_Cluster_Distancia");
          clickedInd20 = feature.get("Variacion_pib_capita_2020_Cluster_Distancia");
        } else {
          clickedInd15 = feature.get("Variacion_pib_capita_2015_Zona_Estadistica");
          clickedInd16 = feature.get("Variacion_pib_capita_2016_Zona_Estadistica");
          clickedInd17 = feature.get("Variacion_pib_capita_2017_Zona_Estadistica");
          clickedInd18 = feature.get("Variacion_pib_capita_2018_Zona_Estadistica");
          clickedInd19 = feature.get("Variacion_pib_capita_2019_Zona_Estadistica");
          clickedInd20 = feature.get("Variacion_pib_capita_2020_Zona_Estadistica");
        }
      } else if (selectedIndicator === "Variación de unidades productivas") {
        if (selectedCluster.includes("habitantes")) {
          clickedInd15 = feature.get("Variacion_u_productivas_2015_Cluster_Poblacion");
          clickedInd16 = feature.get("Variacion_u_productivas_2016_Cluster_Poblacion");
          clickedInd17 = feature.get("Variacion_u_productivas_2017_Cluster_Poblacion");
          clickedInd18 = feature.get("Variacion_u_productivas_2018_Cluster_Poblacion");
          clickedInd19 = feature.get("Variacion_u_productivas_2019_Cluster_Poblacion");
          clickedInd20 = feature.get("Variacion_u_productivas_2020_Cluster_Poblacion");
        } else if (selectedCluster.includes("personas por km")) {
          clickedInd15 = feature.get("Variacion_u_productivas_2015_Cluster_Densidad");
          clickedInd16 = feature.get("Variacion_u_productivas_2016_Cluster_Densidad");
          clickedInd17 = feature.get("Variacion_u_productivas_2017_Cluster_Densidad");
          clickedInd18 = feature.get("Variacion_u_productivas_2018_Cluster_Densidad");
          clickedInd19 = feature.get("Variacion_u_productivas_2019_Cluster_Densidad");
          clickedInd20 = feature.get("Variacion_u_productivas_2020_Cluster_Densidad");
        } else if (selectedCluster.includes("km")) {
          clickedInd15 = feature.get("Variacion_u_productivas_2015_Cluster_Distancia");
          clickedInd16 = feature.get("Variacion_u_productivas_2016_Cluster_Distancia");
          clickedInd17 = feature.get("Variacion_u_productivas_2017_Cluster_Distancia");
          clickedInd18 = feature.get("Variacion_u_productivas_2018_Cluster_Distancia");
          clickedInd19 = feature.get("Variacion_u_productivas_2019_Cluster_Distancia");
          clickedInd20 = feature.get("Variacion_u_productivas_2020_Cluster_Distancia");
        } else {
          clickedInd15 = feature.get("Variacion_u_productivas_2015_Zona_Estadistica");
          clickedInd16 = feature.get("Variacion_u_productivas_2016_Zona_Estadistica");
          clickedInd17 = feature.get("Variacion_u_productivas_2017_Zona_Estadistica");
          clickedInd18 = feature.get("Variacion_u_productivas_2018_Zona_Estadistica");
          clickedInd19 = feature.get("Variacion_u_productivas_2019_Zona_Estadistica");
          clickedInd20 = feature.get("Variacion_u_productivas_2020_Zona_Estadistica");
        }
      } else if (selectedIndicator === "Variación de número de empresas totales") {
        if (selectedCluster.includes("habitantes")) {
          clickedInd15 = feature.get("Variacion_nempresas_total_2015_Cluster_Poblacion");
          clickedInd16 = feature.get("Variacion_nempresas_total_2016_Cluster_Poblacion");
          clickedInd17 = feature.get("Variacion_nempresas_total_2017_Cluster_Poblacion");
          clickedInd18 = feature.get("Variacion_nempresas_total_2018_Cluster_Poblacion");
          clickedInd19 = feature.get("Variacion_nempresas_total_2019_Cluster_Poblacion");
          clickedInd20 = feature.get("Variacion_nempresas_total_2020_Cluster_Poblacion");
        } else if (selectedCluster.includes("personas por km")) {
          clickedInd15 = feature.get("Variacion_nempresas_total_2015_Cluster_Densidad");
          clickedInd16 = feature.get("Variacion_nempresas_total_2016_Cluster_Densidad");
          clickedInd17 = feature.get("Variacion_nempresas_total_2017_Cluster_Densidad");
          clickedInd18 = feature.get("Variacion_nempresas_total_2018_Cluster_Densidad");
          clickedInd19 = feature.get("Variacion_nempresas_total_2019_Cluster_Densidad");
          clickedInd20 = feature.get("Variacion_nempresas_total_2020_Cluster_Densidad");
        } else if (selectedCluster.includes("km")) {
          clickedInd15 = feature.get("Variacion_nempresas_total_2015_Cluster_Distancia");
          clickedInd16 = feature.get("Variacion_nempresas_total_2016_Cluster_Distancia");
          clickedInd17 = feature.get("Variacion_nempresas_total_2017_Cluster_Distancia");
          clickedInd18 = feature.get("Variacion_nempresas_total_2018_Cluster_Distancia");
          clickedInd19 = feature.get("Variacion_nempresas_total_2019_Cluster_Distancia");
          clickedInd20 = feature.get("Variacion_nempresas_total_2020_Cluster_Distancia");
        } else {
          clickedInd15 = feature.get("Variacion_nempresas_total_2015_Zona_Estadistica");
          clickedInd16 = feature.get("Variacion_nempresas_total_2016_Zona_Estadistica");
          clickedInd17 = feature.get("Variacion_nempresas_total_2017_Zona_Estadistica");
          clickedInd18 = feature.get("Variacion_nempresas_total_2018_Zona_Estadistica");
          clickedInd19 = feature.get("Variacion_nempresas_total_2019_Zona_Estadistica");
          clickedInd20 = feature.get("Variacion_nempresas_total_2020_Zona_Estadistica");
        }
      }
      overlayLayer.setPosition(clickedCoordinate);
      overlayID.innerHTML = clickedID;
      overlayMunicipio.innerHTML = clickedMunicipio;
      overlayIndicador15.innerHTML = `${selectedIndicator} 2015: ${clickedInd15}`;
      overlayIndicador16.innerHTML = `${selectedIndicator} 2016: ${clickedInd16}`;
      overlayIndicador17.innerHTML = `${selectedIndicator} 2017: ${clickedInd17}`;
      overlayIndicador18.innerHTML = `${selectedIndicator} 2018: ${clickedInd18}`;
      overlayIndicador19.innerHTML = `${selectedIndicator} 2019: ${clickedInd19}`;
      overlayIndicador20.innerHTML = `${selectedIndicator} 2020: ${clickedInd20}`;
    });
  });
}

// Función que actualiza el mapa dependiendo de los clusteres / indicadores escogidos
function updateMap() {
  if (municipiosLayer) map.removeLayer(municipiosLayer);
  const filePath = `./data/2-mapa/${clusterElegido}.txt`;
  fetch(filePath)
    .then((response) => response.text())
    .then((txtContent) => {
      let geojsonContent;
      try {
        geojsonContent = JSON.parse(txtContent);
      } catch (error) {
        console.error("Error al convertir el contenido del archivo .txt a GeoJSON:", error);
        return;
      }
      const vectorSource = new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(geojsonContent, { featureProjection: "EPSG:3857" }),
      });
      const features = vectorSource.getFeatures();
      const values = features.map((feature) =>
        parseFloat(getFeatureProperty(feature, selectedIndicator, selectedCluster))
      );
      const min = Math.min(...values);
      const max = Math.max(...values);
      municipiosLayer = new ol.layer.Vector({
        source: vectorSource,
        style: (feature) =>
          new ol.style.Style({
            fill: new ol.style.Fill({
              color: getColor(parseFloat(getFeatureProperty(feature, selectedIndicator, selectedCluster)), min, max),
            }),
            stroke: new ol.style.Stroke({
              color: [46, 45, 45, 0.8],
            }),
          }),
      });
      map.addLayer(municipiosLayer);
    })
    .catch((error) => {
      console.error("Error al cargar el archivo .txt:", error);
    });
}

// Función auxiliar que obtiene la propiedad que debe emplearse para elegir el color de cada municipio
function getFeatureProperty(feature, indicator, cluster) {
  let property = "";
  if (indicator === "Variación de PIB") {
    if (cluster.includes("habitantes")) {
      property = "Variacion_pib_2020_Cluster_Poblacion";
    } else if (cluster.includes("personas por km")) {
      property = "Variacion_pib_2020_Cluster_Densidad";
    } else if (cluster.includes("km")) {
      property = "Variacion_pib_2020_Cluster_Distancia";
    } else {
      property = "Variacion_pib_2020_Zona_Estadistica";
    }
  } else if (indicator === "Variación de PIB per cápita") {
    if (cluster.includes("habitantes")) {
      property = "Variacion_pib_capita_2020_Cluster_Poblacion";
    } else if (cluster.includes("personas por km")) {
      property = "Variacion_pib_capita_2020_Cluster_Densidad";
    } else if (cluster.includes("km")) {
      property = "Variacion_pib_capita_2020_Cluster_Distancia";
    } else {
      property = "Variacion_pib_capita_2020_Zona_Estadistica";
    }
  } else if (indicator === "Variación de unidades productivas") {
    if (cluster.includes("habitantes")) {
      property = "Variacion_u_productivas_2020_Cluster_Poblacion";
    } else if (cluster.includes("personas por km")) {
      property = "Variacion_u_productivas_2020_Cluster_Densidad";
    } else if (cluster.includes("km")) {
      property = "Variacion_u_productivas_2020_Cluster_Distancia";
    } else {
      property = "Variacion_u_productivas_2020_Zona_Estadistica";
    }
  } else if (indicator === "Variación de número de empresas totales") {
    if (cluster.includes("habitantes")) {
      property = "Variacion_nempresas_total_2020_Cluster_Poblacion";
    } else if (cluster.includes("personas por km")) {
      property = "Variacion_nempresas_total_2020_Cluster_Densidad";
    } else if (cluster.includes("km")) {
      property = "Variacion_nempresas_total_2020_Cluster_Distancia";
    } else {
      property = "Variacion_nempresas_total_2020_Zona_Estadistica";
    }
  }
  return feature.get(property);
}