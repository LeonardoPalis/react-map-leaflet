import React, { Component } from 'react';
import L, { latLng } from 'leaflet';
import Draw from 'leaflet-draw';
// postCSS import of Leaflet's CSS
import './leaflet.css';
import './leaflet-draw.css';

let config = {};
config.params = {
  center: [40.655769,-73.938503],
  zoomControl: false,
  zoom: 13,
  maxZoom: 19,
  minZoom: 11,
  scrollwheel: false,
  legends: true,
  infoControl: false,
  attributionControl: true
};
config.tileLayer = {
  uri: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  params: {
    minZoom: 11,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    id: '',
    accessToken: ''
  }
};


let pontoInicial = {
  "type": "Feature",
  "properties": {},
  "geometry": {
      "type": "Polygon",
      "coordinates": [
          [
              [
                  -43.94716054201126,
                  -19.98394368218628
              ],
              [
                  -43.94724905490875,
                  -19.984127693835777
              ],
              [
                  -43.94749313592911,
                  -19.984107528186048
              ],
              [
                  -43.94726246595383,
                  -19.98424112556744
              ],
              [
                  -43.94727855920791,
                  -19.984432698973247
              ],
              [
                  -43.94714444875717,
                  -19.984306663864057
              ],
              [
                  -43.946975469589226,
                  -19.984344474407408
              ],
              [
                  -43.9470773935318,
                  -19.984203314999295
              ],
              [
                  -43.946959376335144,
                  -19.98411256959871
              ],
              [
                  -43.94710958003998,
                  -19.98412517312971
              ],
              [
                  -43.94716054201126,
                  -19.98394368218628
              ]
          ]
      ]
  }
};

let pontoFinal = {
  "type": "Feature",
  "properties": {},
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [
          -43.93663555383682,
          -19.92967608545008
        ],
        [
          -43.936914503574364,
          -19.929764340588378
        ],
        [
          -43.937163949012756,
          -19.930346823265015
        ],
        [
          -43.93686085939407,
          -19.930624195213507
        ],
        [
          -43.936670422554016,
          -19.930477944610452
        ],
        [
          -43.93696814775467,
          -19.930374560481784
        ],
        [
          -43.936697244644165,
          -19.93037203891681
        ],
        [
          -43.936839401721954,
          -19.930240917483516
        ],
        [
          -43.93671602010727,
          -19.93023839591642
        ],
        [
          -43.93679916858673,
          -19.930082058678167
        ],
        [
          -43.93652826547623,
          -19.930066929259812
        ],
        [
          -43.93676966428757,
          -19.92993832914525
        ],
        [
          -43.93652021884918,
          -19.929930764429383
        ],
        [
          -43.9367750287056,
          -19.929819815221524
        ],
        [
          -43.93663555383682,
          -19.92967608545008
        ]
      ]
    ]
  }
};

let saveControl = null;
// http://leafletjs.com/examples/geojson/

class Map extends Component {

  constructor(props) {
    super(props);
    this.state = {
      map: null,
      tileLayer: null,
      editableLayers: null,
      pontoInicial: null,
      pontoInicialLayer: null,
      pontoFinal: null,
      pontoFinalLayer: null,
      paradas: [],
      paradasLayer: null,
      isEditing: false,
      isDeleting: false
    };
    this.leafletMap = null;
    this.newId = -1;
    this.paradasSelecionadas = [];
    this.onEachFeature = this.onEachFeature.bind(this);
  }

  componentDidMount() {
    
    this.loadPontoInicial();
    this.loadPontoFinal();
    this.loadParadas();

    // create the Leaflet map object
    if (!this.state.map) 
      this.init(this.leafletMap);
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('componentDidUpdate prevProps', prevProps);
    console.log('componentDidUpdate prevState', prevState);

    if(this.state.map) {
      if(this.state.pontoInicial && !this.state.pontoInicialLayer) {
        this.addPontoInicialLayer(this.state.pontoInicial);
      }
      if(this.state.pontoFinal && !this.state.pontoFinalLayer) {
        this.addPontoFinalLayer(this.state.pontoFinal);
      }
      if(this.state.paradas && !this.state.paradasLayer) {
        this.addParadasLayers(this.state.paradas);
      }
    }

    if(this.state.map && this.state.pontoInicialLayer && this.state.pontoFinalLayer) {
      let boundsInicial = this.state.pontoInicialLayer.getBounds();
      let boundsFinal = this.state.pontoFinalLayer.getBounds();
      let bounds = boundsInicial.extend(boundsFinal);
      this.state.map.fitBounds(bounds);
    }

  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    this.state.map.remove();
  }

  loadPontoInicial() {
    console.log('loadPontoInicial');
    this.setState({ pontoInicial });
  }

  loadPontoFinal() {
    console.log('loadPontoFinal');
    this.setState({ pontoFinal: pontoFinal });
  }

  loadParadas() {
    console.log('loadParadas');

    let paradas = JSON.parse(localStorage.getItem('paradas')) || [];
    this.setState({ paradas });
  }

  addPontoInicialLayer(pontoInicial) {
    console.log('addPontoInicialLayer');
    const pontoInicialLayer = this.getLayer(pontoInicial);
    pontoInicialLayer.addTo(this.state.map);
    this.setState({ pontoInicialLayer });
  }

  addPontoFinalLayer(pontoFinal) {
    console.log('addPontoFinalLayer');
    const pontoFinalLayer = this.getLayer(pontoFinal);
    pontoFinalLayer.addTo(this.state.map);
    this.setState({ pontoFinalLayer });
  }

  addParadasLayers(paradas) {
    console.log('addParadasLayers');
    let paradasLayersTmp = paradas.map(parada => {
      parada.layer.id = parada.id;
      return parada.layer;
    });
    const paradasLayer = this.getLayer(paradasLayersTmp);
    paradasLayer.addTo(this.state.map);
    this.setState({ paradasLayer });
  }

  getLayer(geojson) {
    return L.geoJSON(geojson, {
      pointToLayer: this.pointToLayer,
      onEachFeature: this.onEachFeature
    });
  }

  pointToLayer(feature, latlng) {
    console.log('pointToLayer pointToLayer', feature);
    console.log('pointToLayer latlng', latlng);

    let layer = null;
    const type = feature.geometry.type;
    if(type === 'Point') {
      // let markerOptions = {

      // };
      layer = L.marker(latlng);//, markerOptions);
    } else if(type === 'Polygon') {
      const polygonOptions = {
        radius: 4,
        fillColor: 'orange',
        color: '#fff',
        weight: 1,
        opacity: 0.5,
        fillOpacity: 0.8
      };
      layer = L.polygon(latlng, polygonOptions);
    }

    return layer;
  }

  /**
   * Carregar possívels popups nas layers recuperadas
   * Configura todos s itens pertecentes a layer
   * Configura a função do click no marker
   * Esta função são para as layers recuperadas no BD
   * @param {*} feature 
   * @param {*} layer 
   */
  onEachFeature(feature, layer) {
    console.log('onEachFeature feature', feature);
    console.log('onEachFeature layer', layer);
    if(feature.geometry.type === 'Point') {
      layer.on('click', e => {
        console.log('click layer', e);
        let id = e.sourceTarget.id;
        let paradas = this.state.paradas;
        let paradaSelecionada = null;
        for(let i=0; i<paradas.length; i++) {
          if(paradas[i].id === id) {
            paradaSelecionada = paradas[i];
            i = paradas.length;
          }
        }
        if (this.state.isDeleting === false && this.state.isEditing === false){
          alert("Insere nome do local e hora");
        }        
        this.setState({ paradaSelecionada });
        this.paradasSelecionadas.push(paradaSelecionada);
      });
      layer.id = feature.id;
      this.state.editableLayers.addLayer(layer);
    }
      
  }

  /**
   * 
   * @param {*} id 
   */
  init(id) {
    console.log('init');

    if (this.state.map) return;

    const map = L.map(id, config.params);
    const editableLayers = new L.FeatureGroup();
    map.addLayer(editableLayers);

    L.control.zoom({ position: "bottomleft"}).addTo(map);
    L.control.scale({ position: "bottomleft"}).addTo(map);

    const tileLayer = L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(map);

    const drawControl = new L.Control.Draw({
      position: "topleft",
      draw: {
        // Disabled options
        polyline: false,
        circlemarker: false,
        circle: false,
        rectangle: false,
        polygon: false,
      },
      edit: {
        featureGroup: editableLayers
      }
    });
    drawControl.addTo(map);

    const SaveControl = L.Control.extend({
      options: {
        position: 'topleft' 
      },
      onAdd: (function (map) {
        let container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
 
        container.style.backgroundColor = 'blue';
        container.style.width = '30px';
        container.style.height = '30px';
    
        container.onclick = () => {
          console.log('buttonClicked');
          
          this.salvaParadas(this.state.paradas);
          map.removeControl(saveControl);
        }
        return container;
      }).bind(this),
    });

    //TODO: rewrites some of the tooltip text

    map.on(L.Draw.Event.EDITSTART, (e => {
      console.log('L.Draw.Event.EDITSTART', e);
      let isEditing = true;
      let isDeleting = false;
      this.paradasFocus = [];
      this.setState({ isEditing, isDeleting });
    }).bind(this));

    map.on(L.Draw.Event.EDITED, e => {
      let paradas = this.state.paradas;
      let layers = e.layers._layers;
      Object.values(layers).forEach(layer => {
        for(let i=0; i<paradas.length; i++) {
          if(paradas[i].id === layer.id) {
            this.paradasSelecionadas.push({
              createdData: paradas[i].createdData,
              layer: layer.toGeoJSON(),
              id: layer.id
            });
            i = paradas.length;
          }
        }
      });

      console.log('L.Draw.Event.EDITED', e);
      this.paradasSelecionadas.forEach(parada => {
        this.atualizaParada(parada);
      });
      this.paradasSelecionadas = [];

      if(!saveControl)
        saveControl = new SaveControl();
      map.addControl(saveControl);
    });

    map.on(L.Draw.Event.CREATED, (e => {
      console.log('L.Draw.Event.CREATED', e);
      if(!saveControl)
        saveControl = new SaveControl();
      map.addControl(saveControl);

      let type = e.layerType;
      let layer = e.layer;
  
      if (type === 'marker') {

      }

      const parada = {
        createdData: new Date(),
        layer: layer.toGeoJSON(),
        nomeLocalizacao: "",
        hora: "",
        id: ++this.newId
      };
      this.addParada(parada);

      layer.id = parada.id;

      layer.on('click', e => {
        console.log('click layer', e);
        let id = e.sourceTarget.id;
        let paradas = this.state.paradas;
        let paradaSelecionada = null;
        for(let i=0; i<paradas.length; i++) {
          if(paradas[i].id === id) {
            paradaSelecionada = paradas[i];
            i = paradas.length;
          }
        }
        this.setState({ paradaSelecionada });
        this.paradasSelecionadas.push(paradaSelecionada);
      });
      editableLayers.addLayer(layer);
    }).bind(this));

    map.on(L.Draw.Event.DELETESTART, e => {
      console.log('L.Draw.Event.DELETESTART', e);
      let isDeleting = true;
      let isEditing = false;
      this.paradasSelecionadas = [];
      this.setState({ isDeleting, isEditing });
    });

    map.on(L.Draw.Event.DELETED, (e => {
      console.log('L.Draw.Event.DELETED', e);
      this.paradasSelecionadas.forEach(parada => {
        this.removeParada(parada);
      });
      this.paradasSelecionadas = [];
      
      if(!saveControl)
        saveControl = new SaveControl();
      map.addControl(saveControl);

    }).bind(this));

    this.setState({ map, tileLayer, editableLayers });
  }

  addParada(parada) {
    console.log('addParada', parada);
    let paradas = this.state.paradas;
    paradas.push(parada);
    this.setState({ paradas });
  }

  atualizaParada(parada) {
    console.log('atualizaParada', parada);
    let paradas = this.state.paradas;
    let index = paradas.findIndex(paradaI => paradaI.id === parada.id);
    paradas[index] = parada;
    this.setState({ paradas });
  }

  removeParada(parada) {
    let paradas = this.state.paradas;
    let index = paradas.findIndex(paradaI => paradaI.id === parada.id);
    paradas.splice(index, 1);
    this.setState({ paradas });
  }

  salvaParadas(paradas) {
    console.log('salvaParadas', paradas);
    localStorage.setItem('paradas', JSON.stringify(paradas));
  }

  render() {
    // const { subwayLinesFilter } = this.state;
    return (
      <div id="mapUI">
      
        <div ref={(map) => this.leafletMap = map} id="map" />
        
      </div>
    );
  }
}

export default Map;
