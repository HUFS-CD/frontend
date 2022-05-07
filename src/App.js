/*global Tmapv2*/

import "./App.css";
import SearchModal from "./components/SearchModal";
import { useState, useEffect } from "react";

const markRender = (arr, m) => {
  if (arr.length !== 0) {
    for (var i = 0; i < arr.length; i++) {
      //for문을 통하여 배열 안에 있는 값을 마커 생성
      var lonlat = arr[i].lonlat;
      var title = arr[i].title;
      //console.log(lonlat);
      //Marker 객체 생성.
      var marker = new Tmapv2.Marker({
        position: lonlat, //Marker의 중심좌표 설정.
        icon: "https://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_1.png",
        iconSize: new Tmapv2.Size(24, 38),
        map: m, //Marker가 표시될 Map 설정.
        title: title, //Marker 타이틀.
      });
      marker.create(() => {
        console.log("hi");
      });
      console.log(1);
      console.log(marker.isLoaded());
    }
  }
};

function App() {
  const [showModal, setShowModal] = useState(false);

  const ctrlModal = () => setShowModal(!showModal);

  const [markerArr, setMarkerArr] = useState([]);

  const [coords, setCoords] = useState([
    {
      title: "SKT타워",
      lonlat: new Tmapv2.LatLng(37.566369, 126.984895), //좌표 지정
    },
    {
      title: "호텔",
      lonlat: new Tmapv2.LatLng(37.564432, 126.979979),
    },
    {
      title: "명동성당",
      lonlat: new Tmapv2.LatLng(37.5632423, 126.98721),
    },
    {
      title: "을지로3가역",
      lonlat: new Tmapv2.LatLng(37.566337, 126.992703),
    },
    {
      title: "덕수궁",
      lonlat: new Tmapv2.LatLng(37.565861, 126.975194),
    },
    {
      title: "외대",
      lonlat: new Tmapv2.LatLng(37.59644996896789, 127.06004762649577),
    },
  ]);

  const getCoords = (a) => {
    setCoords([...coords, ...a]);
  };

  useEffect(() => {
    var map = new Tmapv2.Map("TMapApp", {
      center: new Tmapv2.LatLng(37.59644996896789, 127.06004762649577),
      width: "100%",
      height: "100%",
      zoom: 18,
    });

    //console.log(coords);

    // if (coords.length !== 0) markRender(coords, map);

    if (coords.length !== 0) {
      console.log(1);
      for (var i = 0; i < coords.length; i++) {
        //for문을 통하여 배열 안에 있는 값을 마커 생성
        var longlat = coords[i].lonlat;
        var title = coords[i].title;
        //Marker 객체 생성.
        const marker = new Tmapv2.Marker({
          position: longlat, //Marker의 중심좌표 설정.
          icon: "https://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_1.png",
          iconSize: new Tmapv2.Size(24, 38),
          map: map, //Marker가 표시될 Map 설정.
          title: title, //Marker 타이틀.
        });
      }
    }
    console.log(coords);
  }, [coords]);

  return (
    <div className="App">
      <div>
        메인페이지
        <button onClick={ctrlModal}>"진짜주소검색"</button>
        <div
          id="TMapApp"
          style={{
            height: "100%",
            width: "100%",
            position: "fixed",
            zIndex: 0,
          }}
        />
        {showModal ? <SearchModal getCoords={getCoords} /> : null}
      </div>
    </div>
  );
}

export default App;
