let map = L.map('map').setView([-17.403868804926827, -66.03924367573562], 13)

//Agregar tilelAyer mapa base desde openstreetmap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">Geoinformatica Catastral</a> contributors'
}).addTo(map);


fetch('/leaflet/los_pinos.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {

      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.Id) {
          
          //<button class="btn btn-warning btn-sm" id="btnAgregarScript" onclick="addscript('+feature.properties.numero_grilla+')">Nube de Puntos 3D</button>
          layer.bindPopup('<div> <img src="/images/adt.png"  width="300px" alt=""></div><div> <h6>Gobierno Autonomo Municipal de Sacaba</h6><p >Distrito: Lava Lava</p><p>Estado: Levantamiento de grilla Completado </div><div style="text-align: center;"><a href="/ORTOMOSAICO2023/LOSPINOS/los_pinos.ecw" download="los_pinos.ecw" class="btn btn-primary text-white btn-sm" role="button">Ortomosaico 2D</a><a href="/users/lospinos"  class="btn btn-warning btn-sm" role="button">nube de puntos D3</a> </div>');
          
        }
      }
    }).addTo(map);
  });

  var marker = L.marker([28.3949, 84.1240]).addTo(map);

  // search button click 
  function search(){


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


  function addNametocircle(){

    var usuario = document.getElementById('usuario').innerText;
    var textuser = document.getElementById('imagecircle');
    let primerCaracter = usuario.charAt(0);
    textuser.innerHTML =primerCaracter;

    console.log(primerCaracter);

  }
