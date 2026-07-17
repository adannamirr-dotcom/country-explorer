
        const map = L.map("map").setView([0,0],2);
        L.tileLayer(
            // "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",

            {
                maxZoom: 10,
                minZoom: 2,
                
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }
        ).addTo(map);

        
        let allCountries = [];
        let allBorders;
        let allStates;
        let chosenCountry;
        let inputText;
        let finalCountry;
        let currentBorder = null;
        let firstSearch = true;
        let countryStates = null;
        let currentStates;

        const input = document.getElementById("input");
        const suggestionBox = document.querySelector(".suggestions");
        const details = document.querySelector(".details");

        const flagImg = document.getElementById("flag");
        const capital = document.getElementById("capital");
        const language = document.getElementById("language");
        const currency = document.getElementById("currency");
        const area = document.getElementById("area");
        const borders = document.getElementById("borders");
        const region = document.getElementById("region");

        const searchBar = document.querySelector(".search-bar");


        async function fetchCountry(){
            const response = await fetch("./countries.json");
            allCountries = await response.json();

            console.log("Total Countries: "+ allCountries.length);
        }

        async function fetchBorders(){
            const response = await fetch("./countries.geojson");
            allBorders = await response.json();
        }

        async function fetchStates(countryCode){
            console.log("Loading: ", countryCode);
            const response = await fetch(`./states/${countryCode}.geojson`);
            allStates = await response.json();

            console.log("States Loaded: "+ countryCode);
        }

    document.getElementById("loader").classList.add("show");
    input.disabled = true;

        async function init(){
            await Promise.all([
                fetchCountry(),
                fetchBorders()
                // fetchStates()
            ]);

            document.getElementById("loader").classList.remove("show");
            input.disabled=false;
        }

        init();
        
        input.addEventListener("input", showSuggestion);

        function showSuggestion(){
           
            suggestionBox.style.display = "flex";

            suggestionBox.innerHTML = "";

            console.log("input value: "+ input.value);
            
            if(!input.value ){
                suggestionBox.style.display= "none";
                return;
            }

            const matches = allCountries.filter(country=>
                country.name.common.trim().toLowerCase().startsWith(input.value.trim().toLowerCase())
            );

            console.log("matches: "+ matches);

            matches.slice(0,10).forEach(match=>{
                const span = document.createElement("span");
                span.innerText = match.name.common;
                suggestionBox.appendChild(span);
            

                // console.log(span);
                span.addEventListener("click", ()=>{

                    input.value = span.innerText;
                    console.log(" second input value: " + input.value);
                    console.log("span innerText: " + span.innerText);

                    finalCountry = input.value.trim().toLowerCase();

                    suggestionBox.style.display="none";
                    findCountry();
                    
                    if(firstSearch){
                        searchBar.classList.add("active");
                        details.classList.add("show");
                        firstSearch = false;
                    }
                    
                    
                    
                    input.addEventListener("focus", ()=>{
                        input.select();

                    })
                })
                
            })
        }

        async function findCountry(){
            chosenCountry = allCountries.find(country =>
                country.name.common.trim().toLowerCase() === finalCountry
            );

            console.log("chosenCountry"+ chosenCountry);
            console.log(chosenCountry.latlng);

            await fetchStates(chosenCountry.cca3);
            
            findBorder();

            
            flagImg.src = `https://flagcdn.com/w320/${chosenCountry.cca2.toLowerCase()}.png`;
            capital.value = chosenCountry.capital || "N/A";
            language.value = Object.values(chosenCountry.languages).join(", ") || "N/A" ;
            currency.value = Object.values(chosenCountry.currencies).map(currency=> `${currency.name} (${currency.symbol})`).join(", ") || "N/A";
            area.value = chosenCountry.area;
            region.value = chosenCountry.region || "N/A";

            

           borders.innerHTML = "";

           if(!chosenCountry.borders || chosenCountry.borders.length === 0 ){
            const p = document.createElement("p");
            p.innerText = "No Land Borders";

            borders.appendChild(p);
           }
           else{

            chosenCountry.borders.forEach(code =>{

                const neighbor = allCountries.find(
                    country=> country.cca3 === code
                );

                const span = document.createElement("span");
                span.innerText = code;
                span.title = neighbor.name.common;

                span.addEventListener("click", ()=>{
                    input.value = neighbor.name.common;
                    finalCountry = neighbor.name.common.toLowerCase();

                    findCountry();
                });

                borders.appendChild(span);
            })

           }
        
        if(currentStates){
            map.removeLayer(currentStates);
           }

        //   countryStates = allStates.features.filter(
        //     state=> state.properties.shapeGroup === chosenCountry.cca3
        //    );

          countryStates = allStates.features;

        currentStates = L.geoJSON(countryStates,{
            style:{
                color: "transparent",
                weight: 1,
                fillOpacity: 0
            },

            onEachFeature: function(feature, layer){

            layer.bindTooltip(
               feature.properties.shapeName
            )

        layer.on("mouseover", ()=>{
            layer.setStyle({
                color: "yellow",
                fillColor:"yellow",
                fillOpacity:0.6
            });

        });

        layer.on("mouseout", ()=>{

            layer.setStyle({
                color: "transparent",
                fillColor: "transparent",
                fillOpacity:0
            });

        });

    }
           }).addTo(map);


        }

        function findBorder(){

            map.flyTo(chosenCountry.latlng, 6);

            if(currentBorder){
                map.removeLayer(currentBorder);
            }
 
            let border = allBorders.features.find(
                feature => feature.properties["ISO3166-1-Alpha-3"] === chosenCountry.cca3
            );

            currentBorder = L.geoJSON(border,{
                style:{
                    fillColor: "rgb(84, 113, 194)",
                    color: "blue",
                    fillOpacity: 0.6,
                    weight: 2
                }
            }).addTo(map);


            const bounds = currentBorder.getBounds();

            const latDiff = bounds.getNorth() - bounds.getSouth();
            const lngDiff = bounds.getEast() - bounds.getWest();

            console.log(latDiff, lngDiff);

            console.log("name: "+ chosenCountry.name.common,
            "west: "+
            bounds.getWest(),
            "east: "+
            bounds.getEast());

          const size = Math.max(latDiff, lngDiff);

          console.log("size: "+ size);
          let maxZoom = 10;

          if(size>=100){
            maxZoom=3;
          }
          else if(size>30){
            maxZoom=4;
          }
          else if(size>=13){
            maxZoom = 5;
          }
          else if(size >= 5){
            maxZoom = 6;
          }
          else if(size >= 2){
            maxZoom = 7;
          }
          else if(size >= 0){
           maxZoom = 10;
          }

          if(chosenCountry.name.common === "Russia"){
                map.flyTo(chosenCountry.latlng, 3);
                return;
            }
            else if(chosenCountry.name.common === "Antarctica"){
                map.fitBounds(currentBorder.getBounds(),{
                    paddingBottomRight: [100,-450],
                })
                return;
            }


            map.flyToBounds(bounds, {
            paddingTopRight: [500,50],

            maxZoom: maxZoom
        })


    }