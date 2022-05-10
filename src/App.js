/*global Tmapv2*/

import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import $ from "jquery";

function App() {
  let coords = [];

  // const getCoords = (a) => {
  //   setCoords([...coords, ...a]);
  // };

  var positions = [];
  var markers = [];

  const [nameList, setNameList] = useState([]);
  var markerArr = [];
  var marker_mArr = [];
  var counter = 0;

  // 검색 결과 중 선택된 마커와 그 마커의 좌표
  var marker_selected;
  var selected_position;
  var marker_selectedArr = [];

  // 경로 도형을 저장하는 어레이
  var totalMarkerArr = [];
  var drawInfoArr = [];
  var resultdrawArr = [];

  // 보행자 경로 포인트 마커 (경로 선이 꺾이는 지점)
  var marker_points;
  var marker_pointsArr = [];

  // 앱을 켠 순간의 현재 위치 좌표
  var lat_s;
  var lon_s;

  var lat_clicked;
  var lon_clicked;

  var counter2 = 0;

  // 검색을 통해 목적지를 정했는지 판단
  var searched = false;
  useEffect(() => {
    var map = new Tmapv2.Map("TMapApp", {
      center: new Tmapv2.LatLng(37.59644996896789, 127.06004762649577),
      width: "100%",
      height: "100%",
      zoom: 18,
    });

    axios
      .get("http://127.0.0.1:8000/cctv/")
      .then((response) => {
        coords = [...response.data];

        coords.forEach((e, i) => {
          var lat = Number(e.latitude);
          var lon = Number(e.longtitude);
          var name = e.address;

          var markerPosition = new Tmapv2.LatLng(lat, lon);

          //Marker 객체 생성.
          const marker_m = new Tmapv2.Marker({
            position: markerPosition, //Marker의 중심좌표 설정.
            icon: "https://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_1.png",
            iconSize: new Tmapv2.Size(24, 38),
            map: map, //Marker가 표시될 Map 설정.
            title: name, //Marker 타이틀.
            index: i,
          });

          marker_m.setMap(map);
          marker_mArr.push(marker_m);
        });
        console.log(coords);
      })
      .catch(function (error) {
        console.log(error);
      });

    //------ 현재 위치에 마커 생성 ------//
    //------ 외대를 시작위치로 임시 설정 ------//
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        // lat_s = position.coords.latitude;
        // lon_s = position.coords.longitude;
        lat_s = 37.59644996896789;
        lon_s = 127.06004762649577;
        var marker_s = new Tmapv2.Marker({
          position: new Tmapv2.LatLng(lat_s, lon_s),
          icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png",
          iconSize: new Tmapv2.Size(24, 38),
          draggable: true,
          map: map,
        });
        map.setCenter(new Tmapv2.LatLng(lat_s, lon_s));
        map.setZoom(18);
      });
    }

    //------ 클릭시 마커 생성 ------//

    map.addListener("click", function onClick(e) {
      removeMarkers();

      lat_clicked = e.latLng.lat();
      lon_clicked = e.latLng.lng();

      var marker_e = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(lat_clicked, lon_clicked), //Marker의 중심좌표 설정.
        icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png",
        iconSize: new Tmapv2.Size(24, 38),
        map: map,
      });
      markers.push(marker_e);
    });
    //------ --------- ------//

    //------ 명칭 검색 후 마커 생성 ------//

    $("#btn_select").on("click", function () {
      var searchKeyword = $("#searchKeyword").val();

      $.ajax({
        method: "GET",
        url: "https://apis.openapi.sk.com/tmap/pois?version=1&format=json&callback=result",
        async: false,
        data: {
          appKey: "l7xx2eff6322cd2944cab62446d299f7f6e3",
          searchKeyword: searchKeyword,
          resCoordType: "EPSG3857",
          reqCoordType: "WGS84GEO",
          count: 10,
        },
        success: function (response) {
          var resultpoisData = response.searchPoiInfo.pois.poi;
          counter++;

          if (markerArr.length > 0 && counter % 2 === 1) {
            // 이 counter 변수가 없으면 마커를 표시하는 즉시 삭제해버리는 오류 발생, 임시방편으로 counter 변수를 만들었으나 추후 개선 필요
            removeSearchMarkers();
          }

          var positionBounds = new Tmapv2.LatLngBounds();

          resultpoisData.forEach((e, i) => {
            var noorLat = Number(e.noorLat);
            var noorLon = Number(e.noorLon);
            var name = e.name;

            var pointCng = new Tmapv2.Point(noorLon, noorLat);
            var projectionCng = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
              pointCng
            );

            var lat = projectionCng._lat;
            var lon = projectionCng._lng;

            var markerPosition = new Tmapv2.LatLng(lat, lon);

            var marker2 = new Tmapv2.Marker({
              position: markerPosition,
              //icon : "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_a.png",
              icon:
                "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_" +
                i +
                ".png",
              iconSize: new Tmapv2.Size(24, 38),
              title: name,
              map: map,
              index: i,
            });

            marker2.index = i;

            marker2.addListener("click", function onClick() {
              searched = true;
              selected_position = marker2.getPosition();
              removeMarkers();
              removeSearchMarkers();
              console.log(selected_position);
              marker_selected = new Tmapv2.Marker({
                position: selected_position,
                //icon : "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_a.png",
                icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png",

                iconSize: new Tmapv2.Size(24, 38),
                title: name,
                map: map,
                index: i,
              });
            });
            markerArr.push(marker2);

            positionBounds.extend(markerPosition); // LatLngBounds의 객체 확장
          });

          // for (var k in resultpoisData) {
          //   var noorLat = Number(resultpoisData[k].noorLat);
          //   var noorLon = Number(resultpoisData[k].noorLon);
          //   var name = resultpoisData[k].name;

          //   var pointCng = new Tmapv2.Point(noorLon, noorLat);
          //   var projectionCng = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
          //     pointCng
          //   );

          //   var lat = projectionCng._lat;
          //   var lon = projectionCng._lng;

          //   var markerPosition = new Tmapv2.LatLng(lat, lon);

          //   var marker2 = new Tmapv2.Marker({
          //     position: markerPosition,
          //     //icon : "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_a.png",
          //     icon:
          //       "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_" +
          //       k +
          //       ".png",
          //     iconSize: new Tmapv2.Size(24, 38),
          //     title: name,
          //     map: map,
          //   });

          //   marker2.index = k;

          //   marker2.addListener("click", function onClick() {
          //     console.log(marker2.index);
          //   });
          //   markerArr.push(marker2);
          //   positionBounds.extend(markerPosition); // LatLngBounds의 객체 확장
          // }

          map.panToBounds(positionBounds); // 확장된 bounds의 중심으로 이동시키기
          map.zoomOut();
        },
        error: function (request, status, error) {
          console.log(
            "code:" +
              request.status +
              "\n" +
              "message:" +
              request.responseText +
              "\n" +
              "error:" +
              error
          );
        },
      });
    });
    $("#btn_navigate").on("click", function () {
      var the_lat, the_lon;
      if (searched) {
        the_lat = selected_position._lat;
        the_lon = selected_position._lng;
      } else {
        the_lat = lat_clicked;
        the_lon = lon_clicked;
      }
      $.ajax({
        method: "POST",
        url: "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&callback=result",
        async: false,
        data: {
          appKey: "l7xx2eff6322cd2944cab62446d299f7f6e3",
          startX: lon_s,
          startY: lat_s,
          endX: the_lon,
          endY: the_lat,
          reqCoordType: "WGS84GEO",
          resCoordType: "EPSG3857",
          startName: "출발지",
          endName: "도착지",
        },
        success: function (response) {
          counter++;
          var resultData = response.features;

          //결과 출력
          var tDistance =
            "총 거리 : " +
            (resultData[0].properties.totalDistance / 1000).toFixed(1) +
            "km,";
          var tTime =
            " 총 시간 : " +
            (resultData[0].properties.totalTime / 60).toFixed(0) +
            "분";

          $("#result").text(tDistance + tTime);

          //기존 그려진 라인 & 마커가 있다면 초기화
          if (resultdrawArr.length > 0 && counter2 % 2 === 1) {
            for (let i in resultdrawArr) {
              resultdrawArr[i].setMap(null);
            }
            resultdrawArr = [];
          }

          if (marker_pointsArr.length > 0 && counter2 % 2 === 1) {
            for (let i in marker_pointsArr) {
              marker_pointsArr[i].setMap(null);
            }
            marker_pointsArr = [];
          }

          if (marker_selectedArr.length > 0) {
            for (let i in marker_selectedArr) {
              marker_selectedArr[i].setMap(null);
            }
            marker_selectedArr = [];
          }

          drawInfoArr = [];

          for (var i in resultData) {
            //for문 [S]
            var geometry = resultData[i].geometry;
            var properties = resultData[i].properties;
            var polyline_;

            if (geometry.type == "LineString") {
              for (var j in geometry.coordinates) {
                // 경로들의 결과값(구간)들을 포인트 객체로 변환
                var latlng = new Tmapv2.Point(
                  geometry.coordinates[j][0],
                  geometry.coordinates[j][1]
                );
                // 포인트 객체를 받아 좌표값으로 변환
                var convertPoint =
                  new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(latlng);
                // 포인트객체의 정보로 좌표값 변환 객체로 저장
                var convertChange = new Tmapv2.LatLng(
                  convertPoint._lat,
                  convertPoint._lng
                );
                // 배열에 담기
                drawInfoArr.push(convertChange);
              }
            } else {
              var markerImg = "";
              var pType = "";
              var size;

              if (properties.pointType === "S") {
                //출발지 마커
                markerImg =
                  "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png";
                pType = "S";
                size = new Tmapv2.Size(24, 38);
              } else if (properties.pointType === "E") {
                //도착지 마커
                markerImg =
                  "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png";
                pType = "E";
                size = new Tmapv2.Size(24, 38);
              } else {
                //각 포인트 마커
                markerImg = "http://topopen.tmap.co.kr/imgs/point.png";
                pType = "P";
                size = new Tmapv2.Size(8, 8);
              }

              // 경로들의 결과값들을 포인트 객체로 변환
              var latlon = new Tmapv2.Point(
                geometry.coordinates[0],
                geometry.coordinates[1]
              );

              // 포인트 객체를 받아 좌표값으로 다시 변환
              var convertPoint =
                new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(latlon);

              var routeInfoObj = {
                markerImage: markerImg,
                lng: convertPoint._lng,
                lat: convertPoint._lat,
                pointType: pType,
              };

              // Marker 추가
              marker_points = new Tmapv2.Marker({
                position: new Tmapv2.LatLng(routeInfoObj.lat, routeInfoObj.lng),
                icon: routeInfoObj.markerImage,
                iconSize: size,
                map: map,
              });

              marker_pointsArr.push(marker_points);
            }
          } //for문 [E]
          drawLine(drawInfoArr);
          console.log(1);
        },
        error: function (request, status, error) {
          console.log(
            "code:" +
              request.status +
              "\n" +
              "message:" +
              request.responseText +
              "\n" +
              "error:" +
              error
          );
        },
      });
    });
    function addComma(num) {
      var regexp = /\B(?=(\d{3})+(?!\d))/g;
      return num.toString().replace(regexp, ",");
    }

    function drawLine(arrPoint) {
      var polyline_;

      polyline_ = new Tmapv2.Polyline({
        path: arrPoint,
        strokeColor: "#DD0000",
        strokeWeight: 6,
        map: map,
      });
      resultdrawArr.push(polyline_);
    }
  }, []);

  function removeMarkers() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers = [];
  }

  function removeSearchMarkers() {
    for (var i in markerArr) {
      markerArr[i].setMap(null);
    }
    markerArr = [];
  }
  function removeAll() {
    removeMarkers();
    removeSearchMarkers();
    console.log(markerArr);

    if (resultdrawArr.length > 0) {
      for (let i in resultdrawArr) {
        resultdrawArr[i].setMap(null);
      }
      resultdrawArr = [];
    }

    if (marker_pointsArr.length > 0) {
      for (let i in marker_pointsArr) {
        marker_pointsArr[i].setMap(null);
      }
      marker_pointsArr = [];
    }

    if (marker_selectedArr.length > 0) {
      for (let i in marker_selectedArr) {
        marker_selectedArr[i].setMap(null);
      }
      marker_selectedArr = [];
    }
  }

  return (
    <div className="App">
      <div className="search">
        <input
          className="search--input"
          type="text"
          id="searchKeyword"
          name="searchKeyword"
        ></input>
        <button id="btn_select" className="btn">
          검색
        </button>
        <button id="btn_navigate" className="btn">
          안내
        </button>
        <button onClick={removeAll} className="btn">
          초기화
        </button>
      </div>
      <div
        id="TMapApp"
        style={{
          height: "100%",
          width: "100%",
          position: "fixed",
          zIndex: 0,
        }}
      />
      <div id="result" />
    </div>
  );
}

export default App;
