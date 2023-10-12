import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import ReactMapGL, { Layer, Source } from "react-map-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
mapboxgl.accessToken =
  "pk.eyJ1IjoicGFzdG9yYWwiLCJhIjoiY2xoOTdzbnVtMDR1YTNxbnNqMjBsMHE1MiJ9.O8OuK4hJkGRjvEj9hJ9VyQ";

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);
  const [points, setPoints] = useState([]);
  const [data, setData] = useState([]);
  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true,
    },
    defaultMode: "draw_polygon",
  });
  const geojson = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [-70.828023823626, 42.466560379862216],
        [(-70.79779484244007, 42.37831563732772)],
        [(-70.66039038250327, 42.43614518840832)],
        [(-70.828023823626, 42.466560379862216)],
      ],
    },
  };

  const layerStyle = {
    id: "maine",
    type: "fill",
    source: "maine",
    layout: {},
    paint: {
      "fill-color": "#0080ff",
      "fill-opacity": 0.5,
    },
  };
  const layerOutlineStyle = {
    id: "outline",
    type: "line",
    source: "maine",
    layout: {},
    paint: {
      "line-color": "#000",
      "line-width": 3,
    },
  };
  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
    map.current.addControl(draw);
    map.current.on("draw.create", updateArea);
    map.current.on("draw.delete", updateArea);
    map.current.on("draw.update", updateArea);
  });
  function handeldelete(feature) {
    data.features = data.features.filter((item) => item.id !== feature.id);
    setData(data);
    map.removeSource(`${feature.id}`);
  }
  console.log("data", data);

  function updateArea(e) {
    setData(draw.getAll());
    map.current.on("load", () => {
      map.current.addSource("maine", { ...geojson });
      map.current.addLayer({ ...layerStyle });
      map.current.addLayer({ ...layerOutlineStyle });
    });
    setData(draw.getAll());
  }

  return (
    <div className="main">
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />

      <div>
        {" "}
        <div>Sidebar</div>
        <div id="calculated-area">
          {" "}
          <ol>
            {data?.features?.length > 0
              ? data.features.map((feature, index) => (
                  <li key={index}>
                    <p>
                      <strong>Area:</strong> {turf.area(data).toLocaleString()}{" "}
                      <strong>
                        km<sup>2</sup>
                      </strong>
                      {"     "}
                      <button onClick={() => handeldelete(feature)}>
                        delete
                      </button>{" "}
                      {"     "} <button>edit</button>
                    </p>
                  </li>
                ))
              : null}
          </ol>
          <button>Save</button>
        </div>
      </div>
    </div>
  );
}
