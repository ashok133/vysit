var apiCallerApp = new Vue({
	el: '#apiCallerDiv',
	data : {
		landmark_response: {
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
      },
      similarity_response: {
        responses: [
          {
            webDetection: {
              webEntities: [
                {
                  entityId: '',
                  score: 0,
                  description: ''
                },
              ],
              partialMatchingImages: [
                {
                  url: '',
                  score: 0
                },
              ],
              pagesWithMatchingImages: [
                {
                  url: '',
                  score: 0
                },
              ],
              bestGuessLabels: [
                {
                  label: 'Best guess will appear here'
                }
              ],
              visuallySimilarImages: [
                {
                  url: 'images/sample.png'
                }
              ]
            }
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
      detectLandmark() {
				// document.getElementById('image-card').style.visibility = 'visible';
        var files = document.getElementById('src-img').files;
        if (files.length > 0) {
          var reader = new FileReader();
          reader.readAsDataURL(files[0]);
          reader.onload = function () {
            apiCallerApp.fetchLandmarkResults(reader.result.split(',')[1]);
            apiCallerApp.similarity_response.responses[0].webDetection.bestGuessLabels[0].label = 'Loading...'
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
      detectSimilarImages() {
				// document.getElementById('image-card').style.visibility = 'visible';
        var files = document.getElementById('src-img').files;
        if (files.length > 0) {
          var reader = new FileReader();
          reader.readAsDataURL(files[0]);
          reader.onload = function () {
            apiCallerApp.fetchSimilarImageResults(reader.result.split(',')[1]);
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

			pushLandmarkData(json) {
				const database = firebase.database();
				const ref = database.ref('landmarkQueries');
        var session_email = apiCallerApp.sessionChecker();
				const fb_result = ref.push({
          query_email: session_email,
					query_mid: json.responses[0].landmarkAnnotations[0].mid,
					query_text: json.responses[0].landmarkAnnotations[0].description,
					query_lat: json.responses[0].landmarkAnnotations[0].locations[0].latLng.latitude,
					query_lng: json.responses[0].landmarkAnnotations[0].locations[0].latLng.longitude,
					query_conf: json.responses[0].landmarkAnnotations[0].score
				})
				console.log("RDB instance key: ",fb_result.key);
			},
      pushSimilarImagesData(json) {
				const database = firebase.database();
				const ref = database.ref('similarImagesQueries');
        var session_email = apiCallerApp.sessionChecker();
				const fb_result = ref.push({
					//TODO: push similar images data
          query_email: session_email,
          query_entity_ids: json.responses[0].webDetection.webEntities,
          query_best_guess_label: json.responses[0].webDetection.bestGuessLabels[0].label
				})
				console.log("RDB instance key: ",fb_result.key);
			},
			fetchLandmarkResults(src_b64) {
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
 						apiCallerApp.landmark_response = json;
 						// console.log(apiCallerApp.response);
						// document.getElementById("plotButton").style.visibility = "visible";
						apiCallerApp.pushLandmarkData(json)
 				})
  			.catch( function(err){
  				console.log(err)
  			})
			},
      fetchSimilarImageResults(src_b64) {
				fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAdxg74BGS4CF4-VNCNp9fhqrMR_8FzeFQ', {
					body : JSON.stringify({
    				requests : [
                {
                  image: {
                    content: src_b64
                  },
                  features: [
                    {
                      type: "WEB_DETECTION",
                      maxResults: 10
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
            console.log(json);
 						apiCallerApp.similarity_response = json;
 						// console.log(apiCallerApp.response);
						// document.getElementById("plotButton").style.visibility = "visible";
						apiCallerApp.pushSimilarImagesData(json);
 				})
  			.catch( function(err){
  				console.log(err)
  			})
			},
      openImage(url) {
        window.open(url,'Image','width=50px,resizable=1');
      },
      sessionChecker() {
        // var session_email = document.cookie.match('(^|;)\\s*' + saved_session_email + '\\s*=\\s*([^;]+)');
        // console.log(session_email ? session_email.pop() : '');
        // return session_email ? session_email.pop() : ''
        return document.cookie.replace(/(?:(?:^|.*;\s*)saved_session_email\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      }
	  },
    created: function() {
      var session_email = this.sessionChecker();
      console.log(session_email);
    }
	})
