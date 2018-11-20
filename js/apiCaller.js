var apiCallerApp = new Vue({
	el: '#apiCallerDiv',
	data : {
		response: {
			responses: [
			{
					landmarkAnnotations: [
							{
									mid: 'dss',
									description: 'The identifed landmark will be displayed here',
									score: 0,
									boundingPoly: {
											vertices: [
													{
															x: 0,
															y: 0
													},
													{
															x: 0,
															y: 0
													},
													{
															x: 0,
															y: 0
													},
													{
															x: 0,
															y: 0
													}
											]
									},
									locations: [
											{
													latLng: {
															latitude: '',
															longitude: ''
																}
														}
												]
										}
								]
						}
				]
      }
		},
	  methods: {
			mapper(plot_lat, plot_lng, description) {
        var location = new google.maps.LatLng(plot_lat,plot_lng);
        var testLocation = {lat: 17.74234, lng: 45.2378};
				var mapProp= {
				    center: location,
				    zoom:6,
				};

				var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), {
            position: location,
            pov: {
              heading: 34,
              pitch: 10
            }
          });
      map.setStreetView(panorama);

				var marker = new google.maps.Marker({
          position: new google.maps.LatLng(plot_lat,plot_lng),
          map: map,
          title: description
        });

			},
			plotResult() {
				plot_lat = 0.0;
				plot_lng = 0.0;
				var map = document.getElementById('googleMap');
				map.style.visibility = 'visible';
				const database = firebase.database();
				const ref = database.ref('queries');
				ref.limitToLast(1).once('child_added', function (snapshot) {
					apiCallerApp.mapper(snapshot.val().query_lat, snapshot.val().query_lng, snapshot.val().description);
  			});
			},
      encodeData() {
				// document.getElementById('image-card').style.visibility = 'visible';
        var files = document.getElementById('src-img').files;
        if (files.length > 0) {
          var reader = new FileReader();
          reader.readAsDataURL(files[0]);
          reader.onload = function () {
            apiCallerApp.fetchDetectionResults(reader.result.split(',')[1]);
						var output = document.getElementById('src-decoded');
						output.style.visibility = 'visible';
      			output.src = reader.result;
            // console.log("sadjahgsdagsdgahsdgahdgs",reader.result.split(',')[1]);
          };
					// reader.readAsDataURL(event.target.files[0]);
          reader.onerror = function (error) {
            console.log('Error: ', error);
          };
        }
        else {
          console.error('Couldn\'t upload the file');
				}
      },
			pushData(json) {
				const database = firebase.database();
				const ref = database.ref('queries');
				const fb_result = ref.push({
					query_mid: json.responses[0].landmarkAnnotations[0].mid,
					query_text: json.responses[0].landmarkAnnotations[0].description,
					query_lat: json.responses[0].landmarkAnnotations[0].locations[0].latLng.latitude,
					query_lng: json.responses[0].landmarkAnnotations[0].locations[0].latLng.longitude,
					query_conf: json.responses[0].landmarkAnnotations[0].score,
				})
				console.log("RDB instance key: ",fb_result.key);
			},
			fetchDetectionResults(src_b64) {
				fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAdxg74BGS4CF4-VNCNp9fhqrMR_8FzeFQ', {
					body : JSON.stringify({
    				requests : [
                {
                  image: {
                    content: src_b64
                  },
                  features: [
                    {
                      type: "LANDMARK_DETECTION"

                      }
                    ]
                  }
                ]
  				    }),
					     mode: "cors", // no-cors, cors, *same-origin
					     headers: {
    				    'Accept': 'application/json, text/plain, */*',
    				    'Content-Type': 'application/json; charset=utf-8'
  				    },
					     method: "POST"
				    }
			   )
				 .then((res) => {
        return res.json();
      	})
					.then (json => {
					 	// console.log(json.responses[0].landmarkAnnotations[0].mid)
 						apiCallerApp.response = json;
 						// console.log(apiCallerApp.response);
						// document.getElementById("plotButton").style.visibility = "visible";
						apiCallerApp.pushData(json)
 				})
  			.catch( function(err){
  				console.log(err)
  			})
			}
	  }
	})
