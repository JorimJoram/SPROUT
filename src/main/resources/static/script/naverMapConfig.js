window.onload = function () {
  mapSetting();
}

var lastClickedButton = null;
var lastButtonText = null;

var map = null;
var markerTypes = {
  '한식': 'darkblue_marker.png',
  '일식': 'darkgreen_marker.png',
  '분식': 'purple_marker.png',
  '중식': 'toquiz_marker.png',
  '양식': 'orange_marker.png',
  '아시아': 'lightblue_marker.png',
  '샐러드': 'green_marker.png',
}
var colorList = {
  '초기화':'#000000',
  '한식':'#0052A4',
  '일식':'#747F00',
  '분식':'#996CAC',
  '중식':'#77C4A3',
  '양식':'#EF7C1C',
  '아시아':'#00A4E3',
  '제로페이':'#00A84D',
  '1만원 이하': '#E6186C',
  '점심팟': '#BDB092'
}
var markList = [];

/**
 * getMyLocation에서 본인위치 먼저 받아오고 나서 실행되는 메서드
 */
async function mapSetting() {
  try {
    const location = await getMyLocation();
    myLat = location.myLat;
    myLon = location.myLon;
  } catch (error) {
    // reject에서 반환한 값을 처리
    myLat = "37.6041272"
    myLon = "127.0370565"//"127.0366509" 
  } finally {
    var mapOptions = {
      center: new naver.maps.LatLng(myLat, myLon),
      zoomControl: true,
      zoomControlOptions: {
        style: naver.maps.ZoomControlStyle.SMALL,
        position: naver.maps.Position.TOP_RIGHT
      },

      zoom:17
    };
    map = new naver.maps.Map('map', mapOptions);

    var mapType = ["NORMAL", "TERRAIN", "SATELLITE", "HYBRID"] //일반, 지형도, 위성도, 혼합

    map.setMapTypeId(naver.maps.MapTypeId[mapType[0]]); // 지도 유형 변경하기


    // naver.maps.Event.addListener(map, 'click', function(e) {
    //   myMark.setPosition(e.coord); <- 이 코드를 통해서 위치가 이동되는 듯 합니다. 아마 좌표값을 인자로 넣으면 변할듯
    // });

    setCustomLocationControl(map);
    markMyLocation(map);   //내 위치
    markSeSACLocation(map);//학원 위치
    markDefaultStore(map);  //가게 위치(default)
  }
}

function selectMapType(type){
  var mapType = ["NORMAL", "TERRAIN", "SATELLITE", "HYBRID"]

  map.setMapTypeId(naver.maps.MapTypeId[mapType[type]]);
}

function setCustomLocationControl(map){
  //var locationBtnHtml = '<button class="btn_mylct"><span class="spr_trff spr_ico_mylct"> 원위치 </span></a>';
  var locationBtnHtml = `<button class="btn btn-outline"><img src="/img/reLocate.png" style="width: 30px; background-color:#ffffff; height: 30px; border-radius:5px; border:1px solid rgba(0,0,0,0.8);"></img></button>`
  naver.maps.Event.once(map, 'init', function(){
    var customControl = new naver.maps.CustomControl(locationBtnHtml, {
      position: naver.maps.Position.LEFT_TOP
    });
    customControl.setMap(map);
    naver.maps.Event.addDOMListener(customControl.getElement(), 'click', function() {
      map.setCenter(new naver.maps.LatLng(37.6041272, 127.0370565));
  });
  });
}

/**
 * 본인의 현재 위치 반환
 * @returns 위치값 lat, lon으로 반환
 */
function getMyLocation() {
  var myLat, myLon;
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // GeolocationPosition 객체에서 coords 속성을 통해 latitude와 longitude 값을 추출합니다.
        myLat = position.coords.latitude;
        myLon = position.coords.longitude;
        resolve({ myLat, myLon });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            console.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            console.error("The request to get user location timed out.");
            break;
          case error.UNKNOWN_ERROR:
            console.error("An unknown error occurred.");
            break;
        }
        // myLat = "37.6043803"
        // myLon = "127.0366509"
        reject(error);
      },
      {
        // 옵션 (선택사항): 위치 정보의 정확도, 타임아웃 시간 등을 설정할 수 있습니다.
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }//설정값
    );
  });
}

/**
 * 현재 본인의 위치 표시
 * @param {*} map 
 */
async function markMyLocation(map) {
  var location = await getMyLocation();
  if(myLat != null){
    var myMark = new naver.maps.Marker({
      position: new naver.maps.LatLng(location.myLat, location.myLon),
      icon: {
        content: [
          `<div style="display: flex; flex-direction: column; align-items: center; width: 20px; height: 20px;">`,
          ` <div style="display: flex; justify-content: center; align-items: center; width: 20px; height: 20px;">`,
          ` <img src="../img/circle.svg" style="width: 20px; background-color:#0099ff; height: 20px; border-radius: 50%;"/>`, //이미지 위치 확인
          ` </div>`,
          `</div>`
        ].join(''),
        size: new naver.maps.Size(25, 25),
        scaledSize: new naver.maps.Size(25, 25),
        origin: new naver.maps.Point(0, 0)
      },
      map: map,
      zIndex:20
    });
  } 
}

function switchIsZero(isZero){
  if(isZero == 1){
    return `<img src="/img/store/bizplay.png" style="width:10vw;height:10vw; display:block;"/>`//`<p style="color:black">제로페이: 가능</p>`
  }else{
    return ""//`<p>제로페이: <span style="color:red">지원하지 않음</span></p>`
  }
}

/**
 * getStoreLocationList()에서 리스트를 가져온 후에 실행됩니다
 * @param {*} map 
 */
async function markDefaultStore(map) {
  var locList = await getStoreLocationList()
  
  removeMarkList(markList);
  
  for (let item of locList) {
    let marker = new naver.maps.Marker({
      icon:{
        content: [
          `<div style="display: flex; flex-direction: column; align-items: center; width: 30px; height: 30px;">`,
          ` <div style="display: flex; justify-content: center; align-items: center; width: 30px; height: 30px;">`,
          ` <img src="../img/map_marker/${markerTypes[item.style]}" style="width: 30px; height: 30px;"/>`, //이미지 위치 확인
          ` </div>`,
          `</div>`
        ].join(''), //border-radius: 50%;"
        size: new naver.maps.Size(30, 30),
        scaledSize: new naver.maps.Size(30, 30),
        origin: new naver.maps.Point(0, 0)
      },
      position: new naver.maps.LatLng(item.lat, item.lon),
      map: map,
      zIndex: 15,
    });

    let contentString = [
      '<div class="iw_inner" style="border-radius:10px;">',
        '<div style="padding:3vw;">',
        `   <div style="display:flex; align-items:center;"><h3>${item.name}</h3><span style="margin-left:1vw;font-size:1em; color: #595959;">${item.style}</span></div>`,
        // `   <p>${item.location}</p>`,
        `   ${switchIsZero(item.isZero)}`,
        `   <br><a href="/store/info/${item.id}" targetx="_blank">자세히 보기</a>`,
        '   </p>',
        '</div>',
      '</div>'
    ].join('');
    
    let infowindow = new naver.maps.InfoWindow({
      content: contentString
    });

    naver.maps.Event.addListener(marker, 'click', function(){
      //location.href=
      if (infowindow.getMap()) {
        infowindow.close();
      } else {
        infowindow.open(map, marker);
      }
    })

    markList.push(marker);
  }

}

/**
 * 제거하는 방법이 이게 유일하다고 합니다 ㅠㅠ
 * @param {*} markList 
 */
function removeMarkList(markList) {
  if (markList.length > 0) {
    for (mark of markList) {
      mark.setMap(null);
    }
  }
}

/**
 * 청년취업사관학교(학원)의 위치를 마킹해줍니다
 * @param {*} map 
 */
function markSeSACLocation(map) {
  var sesacLocation = ["37.6043803", "127.0366509"]
  var SeSACMark = new naver.maps.Marker({
    position: new naver.maps.LatLng(sesacLocation[0], sesacLocation[1]),
    icon: {
      content: [
        `<div style="display: flex; flex-direction: column; align-items: center; width: 40px; height: 40px;">`,
        ` <div style="display: flex; justify-content: center; align-items: center; width: 40px; height: 40px;">`,
        ` <img src="/img/SeSAC.png" style="width: 40px; height: 40px; border-radius: 20%; background-color:#5D5D5D"/>`, //이미지 위치 확인
        ` </div>`,
        `</div>`
      ].join(''),
      size: new naver.maps.Size(30, 30),
      scaledSize: new naver.maps.Size(30, 30),
      origin: new naver.maps.Point(0, 0)
    },
    map: map,
    zIndex:1
  });
}

/**
 * 서버에서 Store 테이블에서 리스트를 가져옵니다
 * @returns Store 테이블 정보
 */
function getStoreLocationList() {
  return axios.get(`/store/api/list`)
    .then(response => {
      return response.data; // axios.get()에서 바로 response.data를 반환
    })
    .catch(error => {
      console.error('Error fetching store data:', error);
      throw error; // 에러 처리를 위해 throw error 추가
    });
}

function getStoreLocationListByStyle(style, event) {
  console.log(event.target, event.target.innerText);
  var button = event.target; // 클릭된 버튼 참조
  var buttonText = button.innerText; // 버튼의 텍스트 가져오기
  var buttonColor = colorList[buttonText];

  // 이전에 눌린 버튼의 스타일 초기화
  if (lastClickedButton && lastClickedButton !== button) {
      if(lastButtonText != null){
        var lastButtonColor = colorList[lastButtonText]
        lastClickedButton.style.border = `1px solid black`;
        lastClickedButton.style.color = `black`
        lastClickedButton.style.backgroundColor = 'white'
      }
  }

  // 현재 클릭된 버튼의 스타일 토글
  if (button.style.border === `1px solid ${buttonColor}` && button.style.color === `${buttonColor}`){
    button.style.border = `1px solid black`;
    button.style.color = `black`
    button.style.backgroundColor = 'white'
    lastClickedButton = null;
    lastButtonText = null;
  }else{
    button.style.border = 'white';
    button.style.color = 'white'
    button.style.backgroundColor = `${buttonColor}`
    lastClickedButton = button;
    lastButtonText = button.innerText;
  }

  // 현재 클릭된 버튼을 마지막으로 눌린 버튼으로 설정
  //lastClickedButton = button.classList.contains('clicked') ? button : null;


  return axios.get(`/store/api/list?style=${style}`)
    .then(response => {
      markStoreByStyle(response.data);
      //return response.data; // axios.get()에서 바로 response.data를 반환
    })
    .catch(error => {
      console.error('Error fetching store data:', error);
      throw error; // 에러 처리를 위해 throw error 추가
    });
}

async function markStoreByStyle(storeList) {
  removeMarkList(markList);
  for (let item of storeList) {
    let marker = new naver.maps.Marker({
      icon:{
        content: [
          `<div style="display: flex; flex-direction: column; align-items: center; width: 30px; height: 30px;">`,
          ` <div style="display: flex; justify-content: center; align-items: center; width: 30px; height: 30px;">`,
          ` <img src="/img/map_marker/${markerTypes[item.style]}" style="width: 30px; height: 30px;"/>`, //이미지 위치 확인
          ` </div>`,
          `</div>`
        ].join(''), //border-radius: 50%;"
        size: new naver.maps.Size(30, 30),
        scaledSize: new naver.maps.Size(30, 30),
        origin: new naver.maps.Point(0, 0)
      },
      position: new naver.maps.LatLng(item.lat, item.lon),
      map: map,
      zIndex:15
    });

    let contentString = [
      '<div class="iw_inner" style="border-radius:10px;">',
        '<div style="padding:3vw;">',
        `   <div style="display:flex; align-items:center;"><h3>${item.name}</h3><span style="margin-left:1vw;font-size:1em; color: #595959;">${item.style}</span></div>`,
        `   ${switchIsZero(item.isZero)}`,
        `   <br><a href="/store/info/${item.id}" targetx="_blank">자세히 보기</a>`,
        '   </p>',
        '</div>',
      '</div>'
    ].join('');
    // `   <p>${item.location}</p>`,
    let infowindow = new naver.maps.InfoWindow({
      content: contentString
    });

    naver.maps.Event.addListener(marker, 'click', function(){
      if (infowindow.getMap()) {
        infowindow.close();
      } else {
        infowindow.open(map, marker);
      }
    })

    markList.push(marker);
  }
}
