
let map = L.map('map').setView([-17.403868804926827, -66.03924367573562], 13)

//Agregar tilelAyer mapa base desde openstreetmap
/*L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">Geoinformatica Catastral</a> contributors'
}).addTo(map);*/


L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20, // Nivel máximo de zoom
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], // Subdominios utilizados por Google para distribuir la carga
  attribution: 'Map data ©2023 Google' // Atribución de los datos del mapa
}).addTo(map);

var distrito3 = 'http://10.0.38.17:8080/geoserver/fotogrametria_sacaba/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=fotogrametria_sacaba%3Agrilla_d3&maxFeatures=500&outputFormat=application%2Fjson&srsName=EPSG:4326';              

fetch(distrito3)
  .then(response => response.json())
  .then(data => {
    let geojsonLayer = L.geoJSON(data, {
      style: function (feature) {
        // Define el color del polígono según la propiedad 'estado_levantamiento'
        let fillColor;

        // Primer if para determinar el color de relleno
        if (feature.properties.estado_acumulativo == 0) {
          fillColor = '#ababab';
        } else if (feature.properties.estado_acumulativo == 1) {
          fillColor = '#ff540b';
        } else if (feature.properties.estado_acumulativo == 2) {
          fillColor = '#fdec03';
        } else if (feature.properties.estado_acumulativo == 3) {
          fillColor = '#1eca00';
        } else if (feature.properties.estado_acumulativo == 4) {
          fillColor = '#0c45d6';
        }

        // Retornar el objeto de estilo
        return {
          fillColor: fillColor, // Utiliza el color determinado por el if anterior
          weight: 2, // Grosor del borde
          color: '#0d6efd', // Color del borde
          fillOpacity: 0.5 // Opacidad del relleno
        };
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.distrito_a) {
          var statuslev = "";
          if (feature.properties.estado_acumulativo == 1) {
            statuslev = "Levantamiento"
          } else if (feature.properties.estado_acumulativo == 2) {
            statuslev = "procesamiento"
          } else if (feature.properties.estado_acumulativo == 3) {
            statuslev = " post procesamiento"
          } else if (feature.properties.estado_acumulativo == 4) {
            statuslev = "publicado"
          }
          // feature.properties.estado_levantamiento ? "Levantamiento de grilla Completado" : "Grilla en proceso de levantamiento";
          var fechalev = "<p>Fecha de levantamiento: "+feature.properties.fecha_levantamiento+"</p>";
          //var filename = "D"+feature.properties.distrito+"_"+feature.properties.numero_grilla+".ecw";
          var filename = feature.properties.texto + ".ecw";
          var buton2d = '';
          var buton3d = '';

          if (feature.properties.estado_acumulativo == 4) {
            buton2d = '<a href="/users/descargar/' + filename + '"  class="btn btn-primary text-white btn-sm" role="button">Ortomosaico 2D</a>';
            buton3d = '<button class="btn btn-warning btn-sm" id="btnAgregarScript" onclick="addscript(' + feature.properties.texto + ')">Nube de Puntos 3D</button>';
          }

          layer.bindPopup('<div> <img src="/images/adt.png"  width="300px" alt=""></div><div> <h6>Gobierno Autonomo Municipal de Sacaba</h6><p >Distrito: ' + feature.properties.distrito_a + '</p><p>Grilla numero: ' + feature.properties.texto + '</p><p>Estado: ' + statuslev + '</p>' + fechalev + '</div><div style="text-align: center;">' + buton2d + buton3d + '</div>');

        }

        let center = layer.getBounds().getCenter();
        let label = L.marker(center, {
          icon: L.divIcon({
            className: 'label',
            html: feature.properties.texto,
            iconSize: [40, 20]
          })
        });

        // Agregar el label al layer
        layer.label = label;
      }
    }).addTo(map);

    map.on('zoomend', function () {
      let zoom = map.getZoom();
      geojsonLayer.eachLayer(function (layer) {
        if (zoom >= 15) {
          if (!map.hasLayer(layer.label)) {
            map.addLayer(layer.label);
          }
        } else {
          if (map.hasLayer(layer.label)) {
            map.removeLayer(layer.label);
          }
        }
      });
    });
    // Ejecutar el evento una vez para establecer el estado inicial
    map.fire('zoomend');

  });

document.getElementById('fileInput').addEventListener('change', function (e) {
  var file = e.target.files[0];

  if (!file) return;

  var reader = new FileReader();

  reader.onload = function (e) {
    var contents = e.target.result;

    // Check file extension to determine format
    if (file.name.endsWith('.geojson')) {
      L.geoJSON(JSON.parse(contents), {
        style: function (feature) {
          return {
            fillColor: 'green', // Cambiar color de relleno
            weight: 2, // Grosor de la línea del borde
            opacity: 1, // Opacidad del borde
            color: 'white', // Color del borde
            fillOpacity: 0.7 // Opacidad del relleno
          };
        },
        onEachFeature: function (feature, layer) {
          // Agregar información adicional, si es necesario
          layer.bindPopup(feature.properties.name); // Por ejemplo, mostrar el nombre del polígono
        }
      }).addTo(map);
    } else if (file.name.endsWith('.kml')) {
      var kmlLayer = omnivore.kml.parse(contents, null, L.geoJSON(null, {
        style: function (feature) {
          return {
            fillColor: 'blue',
            weight: 2,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
          };
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(feature.properties.name);
        }
      }));
      kmlLayer.addTo(map);
    }
  };

  reader.readAsText(file);
});


var marker = L.marker([28.3949, 84.1240]).addTo(map);

// search button click 
function search() {


  var latlng = document.getElementById('search').value;
  var latlngArr = latlng.split(',');

  var utmZone19S = '+proj=utm +zone=19 +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs';

  // Sistema de referencia de coordenadas: WGS84
  var wgs84 = 'EPSG:4326';

  var eas = parseFloat(latlngArr[0]);
  var nort = parseFloat(latlngArr[1]);
  // Coordenadas UTM
  var easting = eas;
  var northing = nort;

  // Convertir de UTM zona 19 Sur a WGS84
  var latLng = proj4(utmZone19S, wgs84, [easting, northing]);

  /* Mostrar las coordenadas geográficas en la página web
  document.getElementById('result').innerHTML = "Latitud: " + latLng[1].toFixed(14) +
      "<br>Longitud: " + latLng[0].toFixed(14);*/

  map.setView([latLng[1].toFixed(14), latLng[0].toFixed(14)], 19);
  marker.setLatLng([latLng[1].toFixed(14), latLng[0].toFixed(14)]);

};


function addNametocircle() {

  var usuario = document.getElementById('usuario').innerText;
  var textuser = document.getElementById('imagecircle');
  let primerCaracter = usuario.charAt(0);
  textuser.innerHTML = primerCaracter;

  console.log(primerCaracter);

  var role = document.getElementById('role').innerText;
  const div = document.getElementById('dropdown');
  if (role === 'admin' || role === 'root') {
    div.style.display = 'block';
  } else {
    div.style.display = 'none';
  }

}




document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('descargasModal');

  modal.addEventListener('show.bs.modal', async () => {
    try {
      const response = await fetch('/users/descargados');
      const descargas = await response.json();
      const tableBody = document.getElementById('descargasTableBody');
      tableBody.innerHTML = ''; // Limpiar el contenido actual

      descargas.forEach((descarga) => {
        const row = document.createElement('tr');
        //    <td>${descarga.id}</td>
        //    <td>${descarga.tamano_archivo}</td>
        //console.log(descarga.fecha_hora)
        row.innerHTML = `
        
            <td>${descarga.nombre_archivo}</td>
          
            <td>${descarga.fecha_hora}</td>
            <td>${descarga.resultado}</td>
          `;
        tableBody.appendChild(row);
      });
    } catch (err) {
      console.error('Error al cargar las descargas:', err);
    }
  });
});



var puntosDeInteresLayer = "";

fetch('/leaflet/area_urbana.geojson')
  .then(response => response.json())
  .then(data => {
    // Crear una capa GeoJSON con el archivo cargado
    puntosDeInteresLayer = L.geoJSON(data, {


      style: function (feature) {
        // Define el color del polígono según la propiedad 'estado_levantamiento'
        return {
          fillColor: '#9a9fa3bd', // Cambia el color dependiendo de la propiedad 'estado_levantamiento'
          weight: 2, // Grosor del borde
          color: '#cd3685', // Color del borde
          fillOpacity: 0.5 // Opacidad del relleno
        };
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.name) {
          layer.bindPopup(feature.properties.name);
        }
      }

    });

    /* Crear un objeto para las capas de superposición
    var overlayLayers = {
      'Area Urbana': puntosDeInteresLayer,

    };

    // Añadir el control de capas al mapa
    L.control.layers(null, overlayLayers).addTo(map);*/
  })
  .catch(error => console.error('Error cargando el archivo GeoJSON:', error));


fetch('/leaflet/distritos_admin.geojson')
  .then(response => response.json())
  .then(data => {
    // Crear una capa GeoJSON con el archivo cargado
    var puntosDeInteresLayer2 = L.geoJSON(data, {


      style: function (feature) {
        // Define el color del polígono según la propiedad 'estado_levantamiento'
        return {
          fillColor: 'black', // Cambia el color dependiendo de la propiedad 'estado_levantamiento'
          weight: 2, // Grosor del borde
          color: '#cd3685', // Color del borde
          fillOpacity: 0.5 // Opacidad del relleno
        };
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.name) {
          layer.bindPopup(feature.properties.name);
        }
      }
    });

    // Crear un objeto para las capas de superposición
    var overlayLayers = {
      'Area Urbana': puntosDeInteresLayer,
      'Distrios': puntosDeInteresLayer2

    };
    L.control.layers(null, overlayLayers).addTo(map);
  })
  .catch(error => console.error('Error cargando el archivo GeoJSON:', error));


  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function(map) {
      var div = L.DomUtil.create('div', 'legend');
      div.innerHTML += '<h4>Leyenda</h4>';
      div.innerHTML += '<i style="background: #ff540b"></i><span>Grilla en Levantamiento</span><br>';
      div.innerHTML += '<i style="background: #fdec03"></i><span>Grilla en Procesamiento</span><br>';
      div.innerHTML += '<i style="background: #1eca00"></i><span>Grilla en Post Procesamiento</span><br>';
      div.innerHTML += '<i style="background: #0c45d6"></i><span>Grilla Completada Publicado</span><br>';
      return div;
  };
  
  legend.addTo(map);