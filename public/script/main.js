// import Vue from 'vue';

new Vue({
    el: '#leafbot',
    data() {
        return {
            arcReactor: true,
            playCommands: {
                'stop': this.stop,
                'Listen': this.resume,
                'So Leafbot': this.resume,
                'clear': this.clear,
                'Leaf Bot': this.resumeCommand,
                'Assistant': this.resumeCommand
            },
            mainCommands: {
                'Go to command page': this.fromFirstPage,
                'Play the music': this.playMusic,
                'Pause the music': this.pauseMusic,
                'Resume this music': this.resumeMusic,
                'Stop the music': this.stopMusic,
                'Go to welcome page': this.fromFirstPage,
                'Goodbye': this.bye,
                'Show me *flickr': this.flickrImage,
                'Distance from our location to *there': this.distanceOne,
                'Distance from *here to *there': this.distanceTwo,
                'Who are you': this.intro,
                'What is your name': this.intro,
                'Tell me about yourself': this.intro,
                'My name is *user': this.userName,
                'I am *user': this.userName,
                'Weather in *place': this.weatherIn,
                'Weather outside': this.weatherOutside,
                'Get information about *word': this.meaning,
                'Where are we': this.showGlobe,
                'Learn *data': this.learn,
                'Define *definiton': this.define,
                'What is (a) *data': this.whatIs,
                'Who is *data': this.whatIs,
                'Who are the *data': this.whatIs,
                'What time is it': this.time,
                'How old are you': this.myAge,
                'Random news headline': this.indianNews,
                'Random news on *category': this.newsCategory,
                'Random news from *source': this.getNews,
                'Expand': this.newsLink,
                'Open camera': this.openCamera,
                'Close camera': this.closeCamera,
                'How is it today': this.howToday,
                'Give me information about *wiki': this.wikiFun,
                //'Give me information about *wiki': this.wikiImage,
                'That is good': this.anythingElse
            },
            speakOptions: {
                amplitude: 100,
                speed: 150,
                wordgap: 5,
                variant: 'f2'
            },
            apiKeys: {
                flickrapi: /*enter your api key here*/,
                googleapi: /*enter your api key here*/,
                openweather: /*enter your api key here*/,
                wordnik: /*enter your api key here*/,
                newsapi: /*enter your api key here*/
            },
            activate: new Audio(),
            earthGlobe: false,
            flickrDiv: false,
            wikiDiv: false,
            images: [],
            music: new Audio('./public/music/1.mp3'),
            toBeLearned: {
                data: null,
                definition: null,
                date: new Date()
            },
            definitions: [],
            learnedWords: [],
            multipleDefinitions: false,
            currentNewslink: null,
            cameraDiv: false
        }
    },
    mounted() {
        this.init();
        navigator.getBattery().then(function (battery) {

            var level = battery.level;

            console.log(level);
            console.log(battery)
        });
    },
    methods: {
        init() {
            annyang.addCommands(this.playCommands);
            annyang.debug();
            annyang.start({
                autoRestart: true,
                continuous: false
            });
            meSpeak.loadConfig("./public/lib/mespeak/mespeak/mespeak_config.json");
            meSpeak.loadVoice('./public/lib/mespeak/mespeak/voices/en/en-us.json');


            this.activate.src = "./public/lib/repulsor.mp3";
            this.activate.load();

            this.loadLearnedWords();

            this.getBatteryInfo();

            var introMessage = 'Hello I am Leaf-Bot, your digital assistant. How can I help you?';
            meSpeak.speak(introMessage, this.speakOptions, this.resume(0))
            // responsiveVoice.speak(introMessage, "Hindi Female", this.resume(0))
            this.type([introMessage])
            this.animateSpeak(5200);

        },
        loadLearnedWords() {
            var _this = this;
            axios.get('/learned').then(response => {
                _this.learnedWords = response.data
                console.log(response)
            }, error => {
                console.log('error')
            })
        },
        resume(sound = 1) {
            if(sound) this.activate.play();
            annyang.addCommands(this.mainCommands);
        },
        stop() {
            var mainCommands = this.mainCommands;
            annyang.removeCommands(['Weather in *place', 'Weather outside', 'Get information about * word', 'Learn *data', 'Define *definition', 'What is (a) *data', 'What is (an) *data', 'What time is it', 'How old are you', 'Who are the *data', 'Random news from *source', 'Expand', 'Open camera']);
            this.animateSpeakRemove();
            this.currentNewslink = null;
        },
        clear() {
            this.arcReactor = true;
            this.flickrDiv = false;
            this.wikiDiv = false;
            this.cameraDiv = false;
            this.earthGlobe = false;
            this.definitions = [];
            this.toBeLearned = {};
            this.multipleDefinitions = false;
            this.stop()
            this.type(['Say "Leafbot" or "Listen" and ask something.'])
        },
        animateSpeak(time) {
            document.querySelector('.arcReactor').classList.add('animateSpeak');
            setTimeout(function () {
                document.querySelector('.arcReactor').classList.remove('animateSpeak');
            }, time);
        },
        animateSpeakRemove() {
            document.querySelector('.arcReactor').classList.remove('animateSpeak');
        },
        type(typeArray) {
            Typed.new(".type-element", {
                strings: typeArray,
                typeSpeed: 0
            });
        },
        
        addCategory: function(e)
        {
           if(e) e.preventDefault();
           console.log("Added a new category, thanks!");
        },

        fromFirstPage() {
            this.resume()
            var secPage = document.getElementById('comm_page')
            secPage.click();
        },

        resumeCommand() {
            this.resume()
            
            var secPage = document.getElementById('comm_page')
            secPage.click();
        },

        bye() {
            this.music.pause();
            this.stop()
            var firstPage = document.getElementById('home_page')
            firstPage.click();
            meSpeak.speak('Okay Good-Bye',this.speakOptions);
            // responsiveVoice.speak('Okay, Good-Bye', "Hindi Female");
        },

        playMusic() {
            this.music.play();
        },

        pauseMusic() {
            this.music.pause();
        },

        stopMusic() {
            this.music.pause();
        },

        resumeMusic() {
            if (this.music.paused) {
                this.music.play();
            }
        },
            
        weatherIn(place) {
            document.getElementById('main_page').click();

            var _this = this;
            var weatherURL = `http://api.openweathermap.org/data/2.5/weather?q=${place}&appid=${this.apiKeys.openweather}&units=metric`;
            this.wait();
            setTimeout(function () {
                axios.get(weatherURL).then(response => {
                    _this.stop();
                    _this.animateSpeak(4500);
                    var data = response.data;
                    var output = `It is ${data.main.temp} &#8451; in ${place}`;
                    meSpeak.speak(`It is ${data.main.temp} degrees celsius in ${place}`, _this.speakOptions);
                    // responsiveVoice.speak(`It is ${data.main.temp} degrees celsius in ${place}`, "Hindi Female");
                    _this.type([output]);
                }, response => {
                    console.log(response);
                });
            }, 1000);

        },

        
        weatherOutside() {
            document.getElementById('main_page').click();
            var _this = this;
            navigator.geolocation.getCurrentPosition(showPosition);

            function showPosition(position) {
                var weatherURL = `http://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${_this.apiKeys.openweather}&units=metric`;
                _this.wait("I'm fetching your weather data.");
                setTimeout(function () {
                    axios.get(weatherURL).then(response => {
                        _this.stop();
                        _this.animateSpeak(3700);
                        var data = response.data;
                        var output = `It is ${data.main.temp} &#8451 outside`;
                        meSpeak.speak(`It is ${data.main.temp} degrees celcius outside`, _this.speakOptions);
                        // responsiveVoice.speak(`It is ${data.main.temp} degrees celcius outside`, "Hindi Female");
                        _this.type([output]);
                    }, error => {
                        console.log(error)
                    });
                }, 1000);
            }
        },
        time() {
            document.getElementById('main_page').click();
            return new Promise((resolve, reject) => {
              var time = new Date().toLocaleTimeString();
              var done = 0;
              meSpeak.speak(`The time, is` + time, this.speakOptions, done=1);
              // responsiveVoice.speak(`The time, is` + time, "Hindi Female", done=1);
              this.type([time])
              this.animateSpeak(3000);
              this.stop();
              if (done) {
                resolve("Stuff worked!");
              }
              else {
                reject(Error("It broke"));
              }
            });
        },
        wait(info = '') {
            this.animateSpeak(1000);
            meSpeak.speak('Please wait...' + info, this.speakOptions);
            // responsiveVoice.speak('Please wait...' + info, "Hindi Female");
            this.type(['Please wait...', info])
        },
        meaning(word) {
            document.getElementById('main_page').click();
            var _this = this;
            var wordnikURL = `http://api.wordnik.com:80/v4/word.json/${word}/definitions?limit=200&includeRelated=false&useCanonical=false&includeTags=false&api_key=${this.apiKeys.wordnik}`;
            this.wait();
            axios.get(wordnikURL).then(response => {
                var data = response.data
                var output = `I got ${data.length} results`;
                if (data.length > 1) {
                    _this.stop();
                    _this.animateSpeak(3000);
                    meSpeak.speak(output, _this.speakOptions);
                    // responsiveVoice.speak(output, "Hindi Female");
                    _this.multipleDefinitions = true;
                    data.forEach((result) => {
                        _this.definitions.push(result.text)
                    })
                    _this.type([output])

                } else {
                    _this.stop();
                    _this.animateSpeak(8000);
                    meSpeak.speak(`${word} is ${data[0].text}`, _this.speakOptions);
                    // responsiveVoice.speak(`${word} is ${data[0].text}`, "Hindi Female");
                    _this.type([data[0].text]);
                }
            }, error => {
                console.log(error)
            });
        },
        showGlobe() {
            document.getElementById('main_page').click();
            this.wait();
            this.arcReactor = false;
            this.earthGlobe = true;
            var _this = this
            navigator.geolocation.getCurrentPosition(showPosition);

            function showPosition(position) {
                var options = {
                    zoom: 2.0,
                    position: [position.coords.latitude, position.coords.longitude]
                };
                setTimeout(() => {
                    var earth = new WE.map('earth_div', options);
                    WE.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(earth);
                    WE.marker([position.coords.latitude, position.coords.longitude]).addTo(earth)
                    meSpeak.speak('Located', _this.speakOptions)
                    // responsiveVoice.speak('Located', "Hindi Female");
                    _this.type(['Located'])
                    _this.stop();
                }, 2000);
            }


        },
        

        intro() {
            document.getElementById('main_page').click();
            this.stop();
            this.animateSpeak(8000);
            var output = `My name is Leaf-Bot, I am your Digital Assistant, and What's your name?`
            meSpeak.speak(output, this.speakOptions);
            // responsiveVoice.speak(output, "Hindi Female");
            this.type([output]);
        },
        userName(user) {
            document.getElementById('main_page').click();
            this.stop();
            this.animateSpeak(8000);
            var output = `Hello! ${user.charAt(0).toUpperCase() + user.slice(1)}, Nice to meet you.`
            meSpeak.speak(output, this.speakOptions);
            // responsiveVoice.speak(output, "Hindi Female");
            this.type([output]);
        },
        myAge() {
            document.getElementById('main_page').click();
            this.stop();
            this.animateSpeak(8000);
            var output = `I don't know, How old I am, but my creator knows very well.`
            meSpeak.speak(output, this.speakOptions);
            // responsiveVoice.speak(output, "Hindi Female");
            this.type([output]);
        },
        
        getNews(source) {
            document.getElementById('main_page').click();
            var _this = this;
            var newsURL = `https://newsapi.org/v1/articles?source=${source.toLowerCase()}&apiKey=${this.apiKeys.newsapi}`
            axios.get(newsURL).then(response => {
                var data = response.data
                console.log(response);
                _this.animateSpeak(8000);
                meSpeak.speak(data.articles[0].title, this.speakOptions);
                // responsiveVoice.speak(data.articles[0].title, "Hindi Female");
                _this.type([data.articles[0].title]);
                _this.currentNewslink = data.articles[0].url
                setTimeout(() => {
                    _this.stop();
                }, 30000)
            }, error => {
                console.log(error);
                _this.stop();
            })
        },

        indianNews() {
            document.getElementById('main_page').click();
            var _this = this;
            var newsURL = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${this.apiKeys.newsapi}`
            axios.get(newsURL).then(response => {
                var data = response.data
                console.log(response);
                _this.animateSpeak(8000);
                meSpeak.speak(data.articles[0].title, this.speakOptions);
                // responsiveVoice.speak(data.articles[0].title, "Hindi Female");
                _this.type([data.articles[0].title]);
                _this.currentNewslink = data.articles[0].url
                setTimeout(() => {
                    _this.stop();
                }, 30000)
            }, error => {
                console.log(error);
                _this.stop();
            })
        },

        newsCategory(category) {
            document.getElementById('main_page').click();
            var _this = this;
            var newsURL = `https://newsapi.org/v2/top-headlines?country=in&category=${category}&apiKey=${this.apiKeys.newsapi}`
            axios.get(newsURL).then(response => {
                var data = response.data
                console.log(response);
                _this.animateSpeak(8000);
                meSpeak.speak(data.articles[0].title, this.speakOptions);
                // responsiveVoice.speak(data.articles[0].title, "Hindi Female");
                _this.type([data.articles[0].title]);
                _this.currentNewslink = data.articles[0].url
                setTimeout(() => {
                    _this.stop();
                }, 30000)
            }, error => {
                console.log(error);
                _this.stop();
            })
        },

        newsLink() {
            document.getElementById('main_page').click();
            var win = window.open(this.currentNewslink, '_blank');
            win.focus();
            setTimeout(() => {
                this.currentNewslink = null;
            }, 10000)
        },
        openCamera() {
            document.getElementById('main_page').click();
            this.arcReactor = false;
            this.cameraDiv = true;
            var video = document.querySelector('#video');

            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({
                    video: true
                }).then(function (stream) {
                    video.srcObject = stream;
                });
            }
            var output = `Now say "Clear" for close the camera`
            this.animateSpeak(3000);
            this.type([output])
            meSpeak.speak(output, this.speakOptions)
            // responsiveVoice.speak(output, "Hindi Female")
        },

        closeCamera() {
            
        },

        howToday() {
            document.getElementById('main_page').click();
            var _this = this;
            return new Promise((resolve, reject) => {
            var time = new Date().toLocaleTimeString();
            var done = 0;

            var time = _this.time();
            time.then(function() {
              setTimeout(function(){
                //_this.weatherOutside();
                done=1;
              }, 3000);
            });

            doneCheck = setInterval(function(){
              if (done) {
                resolve("Stuff worked!");
                _this.anythingElse();
                clearInterval(doneCheck);
              }
              else {
                reject(Error("It broke"));
              }
            }, 1000)
          });
        },

        anythingElse(){
            //document.getElementById('main_page').click();
            this.stop();
            meSpeak.speak(`Anything else?`, this.speakOptions);
            // responsiveVoice.speak(`Anything else?`, "Hindi Female");
            this.resume(0);
        },
        learn(data) {
            document.getElementById('main_page').click();
            var lowerCased = data.toLowerCase()
            this.toBeLearned.data = lowerCased;
            var existing = 0
            this.learnedWords.forEach(result => {
                if (result.data === data) {
                    var output = `Sorry, but ${data} already exists`
                    this.animateSpeak(3000);
                    this.type([output])
                    meSpeak.speak(output, this.speakOptions)
                    // responsiveVoice.speak(output, "Hindi Female")
                    existing = 1;
                }
            })

            if (existing === 0) {
                var output = 'Start by saying define. Speak after the repulsor'
                this.animateSpeak(3000);
                this.type([output])
                meSpeak.speak(output, this.speakOptions)
                // responsiveVoice.speak(output, "Hindi Female")
                setTimeout(() => {
                    this.activate.play();
                    console.log(data)
                }, 3500)
            }


        },
        define(definition) {
            var _this = this
            var lowerCased = definition.toLowerCase();
            this.toBeLearned.definition = lowerCased
            this.stop();
            if (this.toBeLearned.data !== null && this.toBeLearned.definition !== null) {
                axios.post('/learn', this.toBeLearned).then(response => {
                    if (response.data.success) {
                        _this.loadLearnedWords();
                        _this.animateSpeak(2000);
                        var output = `${this.toBeLearned.data} learned`;
                        _this.type([output]);
                        meSpeak.speak(output, this.speakOptions)
                        // responsiveVoice.speak(output, "Hindi Female")
                        _this.toBeLearned = {};
                    }
                    console.log(response)
                }, error => {
                    console.log(error)
                })
            }
        },
        whatIs(data) {
            document.getElementById('main_page').click();
            var _this = this
            this.learnedWords.forEach(result => {
                if (result.data === data.toLowerCase()) {
                    _this.animateSpeak(2000);
                    _this.type([result.definition]);
                    meSpeak.speak(result.definition, _this.speakOptions);
                    // responsiveVoice.speak(result.definition, "Hindi Female");
                    _this.stop();
                }
            })

        },

        wikiFun(wiki) {
            document.getElementById('main_page').click();
            var _this = this

            this.arcReactor = false;
            this.wikiDiv = true;
            var fResult = document.querySelector('#wiki-image');

            var flickrUrl = `https://cors-anywhere.herokuapp.com/https://api.flickr.com/services/feeds/photos_public.gne?tags=${wiki}&format=json&nojsoncallback=true`

            var wikiURL = `https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?action=opensearch&limit=1&format=json&search=${wiki}`
            this.wait();
            setTimeout(function () {
                axios.get(wikiURL).then(response => {
                    _this.stop();
                    _this.animateSpeak(4500);
                    var data = response.data;
                    var output = `${data[2]}`;

                    _this.images = response.data.itmes;
                    //var image = response.data.items[0];
                    fResult: true

                    meSpeak.speak(`According to Wikipedia; ${data[2]}`, _this.speakOptions);
                    // responsiveVoice.speak(`According to Wikipedia; ${data[2]}`, "Hindi Female");
                    _this.type([output]);
                }, response => {
                    console.log(response);
                });
            }, 1000);
        },


        distanceOne(there) {
            document.getElementById('main_page').click();
            var distanceUrl = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=Guna&destinations=${there}&key=${this.apiKeys.googleapi}`
            var _this = this
            this.wait();
            setTimeout(function () {
                axios.get(distanceUrl).then(response => {
                    _this.stop();
                    _this.animateSpeak(4500);
                    var data = response.data;
                    var output = `Distance from ${data.destination_addresses} to ${data.origin_addresses} is ${data.rows[0].elements[0].distance.text}`;
                    meSpeak.speak(`It is ${data.rows[0].elements[0].distance.text}`, _this.speakOptions);
                    // responsiveVoice.speak(`It is ${data.rows[0].elements[0].distance.text}`, "Hindi Female");
                    //meSpeak.speak(`It is ${data[0].Temperature.Metric.Value} degrees celsius ${data[0].WeatherText} in ${place}`, _this.speakOptions);
                    _this.type([output]);
                }, response => {
                    console.log(response);
                });
            }, 1000);
                
        },

        distanceTwo(here, there) {
            document.getElementById('main_page').click();
            var distanceUrl = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${here}&destinations=${there}&key=${this.apiKeys.googleapi}`
            var _this = this
            this.wait();
            setTimeout(function () {
                axios.get(distanceUrl).then(response => {
                    _this.stop();
                    _this.animateSpeak(4500);
                    var data = response.data;
                    var output = `Distance from ${data.destination_addresses} to ${data.origin_addresses} is ${data.rows[0].elements[0].distance.text}`;
                    meSpeak.speak(`It is ${data.rows[0].elements[0].distance.text}`, _this.speakOptions);
                    // responsiveVoice.speak(`It is ${data.rows[0].elements[0].distance.text}`, "Hindi Female");
                    //meSpeak.speak(`It is ${data[0].Temperature.Metric.Value} degrees celsius ${data[0].WeatherText} in ${place}`, _this.speakOptions);
                    _this.type([output]);
                }, response => {
                    console.log(response);
                });
            }, 1000);
        },

        flickrImage(flickr) {
            document.getElementById('main_page').click();
            this.arcReactor = false;
            this.flickrDiv = true;
            var fResult = document.querySelector('#search-results');
            var flickrUrl = `https://cors-anywhere.herokuapp.com/https://api.flickr.com/services/feeds/photos_public.gne?tags=${flickr}&format=json&nojsoncallback=true`
            //var flickrUrl = `https://cors-anywhere.herokuapp.com/https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${this.apiKeys.flickrapi}&sort=interestingness-desc&per_page=9&format=json&callback=jsonFlickrApi&tags=${flickr}`
            var _this = this
            this.wait();
            setTimeout(function () {
                axios.get(flickrUrl).then(response => {
                    _this.stop();
                    _this.animateSpeak(4500);
                    _this.images = response.data.items;
                    
                    fResult: true
                    var output = 'These are the images';
                    meSpeak.speak(`These are the images`, _this.speakOptions);
                    // responsiveVoice.speak(`These are the images`, "Hindi Female");
                    _this.type([output]);
                }, response => {
                    console.log(response);
                    console.log(flickrUrl);
                });



                    Vue.directive('img', {
                      inserted: function (el, binding) {
                        lazyload(el, binding);
                      },
                      update: function (el, binding) {
                        lazyload(el, binding);
                      }
                    });

                    Vue.prototype.filters = {
                      splitTags: function (value) {
                        // showing only first 5 tags
                        return value.split(' ').slice(0,5);
                      }
                    }

                    /* General utility functions */
                    function lazyload(el, binding) {
                      var img = new Image();
                      img.src = binding.value;

                      img.onload = function() {
                        el.src = binding.value;
                      };
                    }

            }, 1000);
        },


        getBatteryInfo() {
            //document.getElementById('main_page').click();
            var _this = this
            navigator.getBattery().then(function (battery) {
                battery.addEventListener('chargingchange', function () {
                    _this.updateChargeInfo(battery);
                });
            })
        },
        updateChargeInfo(battery) {
            //document.getElementById('main_page').click();
            if (battery.charging) {
                this.animateSpeak(2000);
                this.type(['I am charging']);
                meSpeak.speak('I am charging', this.speakOptions);
                // responsiveVoice.speak('I am charging', "Hindi Female");
            } else {
                this.animateSpeak(2000);
                this.type(['Charger removed']);
                meSpeak.speak('Charger removed', this.speakOptions);
                // responsiveVoice.speak('Charger removed', "Hindi Female");
            }
        }
    }
})
