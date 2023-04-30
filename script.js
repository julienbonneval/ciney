const PREFIX = `PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX : <http://dbpedia.org/resource/>
PREFIX dbpedia2: <http://dbpedia.org/property/>
PREFIX dbpedia: <http://dbpedia.org/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX dbo: <http://dbpedia.org/ontology/>
\n`;
const FILM_NAME = getFilmName();
const PERSONNAGE_NAME = getPersonnageName();

  function rechercherFilm() {

    var input = document.getElementById('searchbar').value;
    input=capitalizeFirstLetter(input);

    var contenu_requete = PREFIX+`SELECT DISTINCT ?nomF WHERE
    {
    ?film rdfs:label ?nomF.
    ?film a dbo:Film.
    FILTER LANGMATCHES( LANG(?nomF), "en" ).
    FILTER(contains(?nomF,"`+input+`")).
    }
    LIMIT 30`;

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var results = JSON.parse(this.responseText);
            console.log(results);

            afficherResultats(results,"Films");
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }
  function rechercherActeur() {

    var input = document.getElementById('searchbar').value;
    input=capitalizeFirstLetter(input);

    var contenu_requete = PREFIX+`SELECT DISTINCT ?nomA WHERE
    {
    ?film a dbo:Film.
    ?film rdfs:label ?nomF.
    ?film dbo:starring ?starring.    
    FILTER LANGMATCHES( LANG(?nomF), "en" ).
    ?starring rdfs:label ?nomA.
    FILTER LANGMATCHES( LANG(?nomA), "en" ).
    FILTER(contains(?nomA,"`+input+`"))
    }
    LIMIT 30`;

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var results = JSON.parse(this.responseText);
            afficherResultats(results,"Actors");
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  
  async function recherches(recherches) {
    await Promise.all(recherches)
    return;
  }
  // Affichage des résultats dans un tableau
  function afficherResultats(data,title)
  {
    // Tableau pour mémoriser l'ordre des variables ; sans doute pas nécessaire
    // pour vos applications, c'est juste pour la démo sous forme de tableau
    var index = [];

    var contenuTableau = "<tr>";

    data.head.vars.forEach((v, i) => {
      
      contenuTableau += "<th>"+title+"</th>";
      index.push(v);
    });
    data.results.bindings.forEach( (r,i) => {
      contenuTableau += "<tr>";
      index.forEach(v => {
        if (r[v])
        {
          if (r[v].type === "uri")
          {
            contenuTableau += "<td><a href='" + r[v].value + "' target='_blank'>" + r[v].value + "</a></td>";
          }
          else {
            if (title==="Films")
            {
              contenuTableau += "<td><a id='film"+i+"' href='film.html?filmName="+r[v].value+"'>" + r[v].value + "</a></td>";
            } 
            else
            {
              contenuTableau += "<td><a id='personnage"+i+"' href='personnage.html?personnageName="+r[v].value+"'>" + r[v].value + "<br></a></td>";
            }

          }
        }
        else
        {
          contenuTableau += "<td></td>";
        }
      });

      contenuTableau += "</tr>";
    });

    contenuTableau += "</tr>";
    if (title==="Films")
    {    
      document.getElementById("resultatsFilms").innerHTML = contenuTableau;
    } 
    else
    {
      document.getElementById("resultatsActeurs").innerHTML = contenuTableau;
    }

  }

  function capitalizeFirstLetter(str) {
  // converting first letter to uppercase
  const words = str.split(" ");
  var cap = "";

    words.forEach((word,i) => {
      cap += word.charAt(0).toUpperCase() + word.slice(1);
      if(i<words.length-1){
        cap+=" ";
      }
    });
  return cap;
  // const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  // return capitalized;
  }

  function capitalizeFirstLetter(str) {
  // converting first letter to uppercase
  const words = str.split(" ");
  var cap = "";

    words.forEach((word,i) => {
      cap += word.charAt(0).toUpperCase() + word.slice(1);
      if(i<words.length-1){
        cap+=" ";
      }
    });
  return cap;
  // const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  // return capitalized;
  }

  function getFilmName()
  {
    var parameters = location.search.substring(1).split("&");
    var temp = parameters[0].split("=");
    var filmName = unescape(temp[1]);
    return filmName;
  }

  function getPersonnageName()
  {
    var parameters = location.search.substring(1).split("&");
    var temp = parameters[0].split("=");
    var personnageName = unescape(temp[1]);
    personnageName = personnageName.replaceAll("_"," ");
    return personnageName;
  }

  function putFilmName()
  {
    document.getElementById("film-title").innerHTML = FILM_NAME;
    afficherInfoFilm();
  }

  function putPersonnageName()
  {
    document.getElementById("personnage-name").innerHTML = PERSONNAGE_NAME;
  }

  function getAbstract() {

    var contenu_requete = PREFIX+ `SELECT DISTINCT ?abstract
    WHERE
    {
    ?film a dbo:Film.
    ?film rdfs:label ?nomF.
    FILTER(contains(?nomF,"`+FILM_NAME+`") ).
    ?film dbo:abstract ?abstract.
    FILTER LANGMATCHES( LANG(?abstract), "en" ).
    }`;

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            //check si on a trouvé des resultats
            if (data.results.bindings.length == 0){
              var abstract = "Undefined";
            }else{
              var abstract = data.results.bindings[0].abstract.value;
            }
            document.getElementById("film-description").innerHTML = abstract;
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }
    
  function getActors() {

    var contenu_requete = PREFIX+ `SELECT DISTINCT ?nomA ?starring WHERE
{
?film a dbo:Film.
?film rdfs:label ?nomF.
FILTER(contains(?nomF,"`+FILM_NAME+`") ).
FILTER LANGMATCHES( LANG(?nomF), "en" ).
?film dbo:starring ?starring.
?starring rdfs:label ?nomA.
FILTER LANGMATCHES( LANG(?nomA), "en" ).
}`;

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            
            //check si on a trouvé des resultats
            if (data.results.bindings.length == 0){
              var contenuTableau = "Undefined";
            }else{
              var contenuTableau = "<tr>";
              var index = [];
              data.results.bindings.forEach((v, i) => {
                let name_actors =v.starring.value.replace("http://dbpedia.org/resource/", "");
                contenuTableau += "<td><a id='personnage"+i+"' href='personnage.html?personnageName="+name_actors+"'>" + v.nomA.value + "<br></a></td>";
                //contenuTableau += "<th>" + v.nomA.value + "<br></th>";
                index.push(v);
              });
            }
            document.getElementById("film-actors").innerHTML = contenuTableau;
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  function getBudget() {

    var contenu_requete = PREFIX+ `SELECT DISTINCT ?budget
    WHERE
    {
    ?film a dbo:Film.
    ?film rdfs:label ?nomF.
    FILTER(contains(?nomF,"`+FILM_NAME+`") ).   
    ?film dbp:budget ?budget.

    }`;

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            
            //check si on a trouvé des resultats
            if (data.results.bindings.length == 0){
              var budget = "Undefined";
              document.getElementById("film-budget").innerHTML = budget;
            }else{
              var budget = data.results.bindings[0].budget.value;
              // Check si le resultat s'écrit avec un exposant . Par Ex: 1.02E7
              if (budget.includes("E"))
              {
                const budget_arr = budget.split('E');
                var budget_1 = parseInt(budget_arr[0]);
                var budget_2 = parseInt(budget_arr[1]);
                var budget_val = budget_1*Math.pow(10,budget_2);
                budget = parseInt(budget_val);
              }
              document.getElementById("film-budget").innerHTML = budget +" $ ";
            }
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  function getDirector() {
    var contenu_requete = PREFIX + `SELECT DISTINCT ?nomD WHERE
    {
    ?film a dbo:Film.
    ?film rdfs:label ?nomF.
    FILTER(contains(?nomF,"`+FILM_NAME+`") ).
    ?film dbo:director ?director.
    ?director rdfs:label ?nomD.
    FILTER LANGMATCHES( LANG(?nomD), "en" ).
    }LIMIT 1`;

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);

            //check si on a trouvé des resultats
            if (data.results.bindings.length == 0){
              var director = "Undefined";
            }else{
              var director = data.results.bindings[0].nomD.value;
            }
            document.getElementById("film-director").innerHTML = director;
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  } 

  function getComposer() {

    var contenu_requete = PREFIX+ `SELECT DISTINCT ?music
    WHERE
    {
    ?film a dbo:Film.
    ?film rdfs:label ?nomF.
    FILTER(contains(?nomF,"`+FILM_NAME+`") ).
    ?film dbo:musicComposer ?musicC.
    ?musicC rdfs:label ?music.
    FILTER(LANGMATCHES(LANG(?music), "en" )).
    }LIMIT 1`;

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);

            //check si on a trouvé des resultats
            if (data.results.bindings.length == 0){
              var music = "Undefined";
            }else{
              if(data.results.bindings[0].music.type === 'uri'){
                var str = data.results.bindings[0].music.value;
                var res = str.split("/");
                var nom = res[res.length - 1];
                nom = nom.replace("_"," ");
                document.getElementById("film-music").innerHTML = nom;
              }else{
                var music = data.results.bindings[0].music.value;
                document.getElementById("film-music").innerHTML = music;
              }
            }
            document.getElementById("film-music").innerHTML = music;
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  function getProducer() {

    var contenu_requete = PREFIX+ `SELECT DISTINCT ?producer
    WHERE
    {
    ?film a dbo:Film.
    ?film rdfs:label ?nomF.
    FILTER(contains(?nomF,"`+FILM_NAME+`") ).
    ?film dbo:productionCompany ?producer.
    } LIMIT 3`;

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);

            //check si on a trouvé des resultats
            if (data.results.bindings.length == 0){
              var noResult = "Undefined";
              document.getElementById("film-producer").innerHTML = noResult;
            }else{
              var contenuTableau = "<tr>";
              var index = [];

              data.results.bindings.forEach((v, i) => {

                if(v.producer.type === 'uri'){
                  var str = v.producer.value;
                  console.log("str : "+str);
                  var res = str.split("/");
                  console.log("apres split res : : "+res);
                  var nom = res[res.length - 1];
                  console.log("nom : "+nom);
                  nom = nom.replaceAll("_"," ");
                  console.log("apres replace : "+nom);
                  console.log("NOM production company : " + nom);

                  contenuTableau += "<td><a id='producer"+i+"'>" + nom + "<br></a></td>";
                  // console.log("rentre dans scenario :"+ nom);
                }else{
                  var producer = v.producer.value;
                  contenuTableau += "<td><a id='producer"+i+"'>" + producer + "<br></a></td>";
                  console.log("rentre dans producer et pas URI :"+ producer);

                }
                index.push(v);
               });
               document.getElementById("film-producer").innerHTML = contenuTableau;
            }

            // var producer = data.results.bindings[0].producer.value;
            // document.getElementById("film-producer").innerHTML = producer;
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  function getRecette() {

    var contenu_requete = PREFIX+ `SELECT DISTINCT ?recette
    WHERE
    {
    ?film a dbo:Film.
    ?film rdfs:label ?nomF.
    FILTER(contains(?nomF,"`+FILM_NAME+`") ).
    ?film dbp:gross ?recette.
    }`;

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            
            //check si on a trouvé des resultats
            if (data.results.bindings.length == 0){
              var recette = "Undefined";            
              document.getElementById("film-recette").innerHTML = recette;
            }else{
              var recette = data.results.bindings[0].recette.value;
              // Check si le resultat s'écrit avec un exposant . Par Ex: 1.02E7
              if (recette.includes("E"))
              {
                const recette_arr = recette.split('E');
                var recette_1 = parseInt(recette_arr[0]);
                var recette_2 = parseInt(recette_arr[1]);
                var recette_val = recette_1*Math.pow(10,recette_2);
                recette = parseInt(recette_val);
              }
              document.getElementById("film-recette").innerHTML = recette +" $ ";
            } 
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  function getCountry() {

    var contenu_requete = PREFIX+ `SELECT DISTINCT ?country
    WHERE
    {
    ?film a dbo:Film.
    ?film rdfs:label ?nomF.
    FILTER(contains(?nomF,"`+FILM_NAME+`") ).
    ?film dbp:country ?country.
    } LIMIT 1`;

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);

            //check si on a trouvé des resultats
            if (data.results.bindings.length == 0){
              var contenuTableau = "Undefined";
            }else{
              var contenuTableau = "<tr>";
              var index = [];
              data.results.bindings.forEach((v, i) => {
                contenuTableau += "<td><a id='country"+i+"'>" + v.country.value + "<br></a></td>";
                index.push(v);
              });
            }

           document.getElementById("film-country").innerHTML = contenuTableau;
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  function getDuration() {

    var contenu_requete = PREFIX+`SELECT DISTINCT ?runtime
    WHERE
    {
    ?film a dbo:Film.
    ?film rdfs:label ?nomF.
    FILTER(contains(?nomF,"`+FILM_NAME+`") ).
    ?film dbo:runtime ?runtime.
    }`;

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          var data = JSON.parse(this.responseText);

          //check si on a trouvé des resultats
          if (data.results.bindings.length == 0){
            var runtime = "Undefined";
            document.getElementById("film-duration").innerHTML = runtime;        
          }else{
            var runtime = data.results.bindings[0].runtime.value;
            document.getElementById("film-duration").innerHTML = secondsToHm(runtime);
          }
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  function getWriter() {
    var contenu_requete = PREFIX + `SELECT DISTINCT ?nomW WHERE
    {
    ?film a dbo:Film.
    ?film rdfs:label ?nomF.
    FILTER(contains(?nomF,"`+FILM_NAME+`") ).
    ?film dbp:writer ?nomW.
    } `;
    //Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);

            //check si on a trouvé des resultats
            if (data.results.bindings.length == 0){
              var noResult = "Undefined";
              document.getElementById("film-writer").innerHTML = noResult;
            }else{
              if(data.results.bindings[0].nomW.type === 'uri'){
                var str = data.results.bindings[0].nomW.value;
                var res = str.split("/");
                var nom = res[res.length - 1];
                console.log("nom : "+nom);
                nom = nom.replaceAll("_"," ");
                console.log("apres replace : "+nom);
                console.log("NOM Writer : " + nom);
                document.getElementById("film-writer").innerHTML = nom;
              }else{
                var writer = data.results.bindings[0].nomW.value;
                document.getElementById("film-writer").innerHTML = writer;
              }
            }
        }
      };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  function secondsToHm(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay =  h + "h";
    var mDisplay =  m + "m";
    return hDisplay + mDisplay; 
  }

  async function getOMDbJson(filmName)
  {
    url = "http://www.omdbapi.com/?apikey=7cdb994b&type=movie&t=";
    if (filmName.indexOf('(') >= 0) {
      url += filmName.split("(")[0];
      try {
        var regex = /\d{4}/;
        const dateDeSortie = regex.exec(filmName)[0];
        url += "&y=";
        url += dateDeSortie;
      }catch (error) {
        // console.error(error);
      }
    }
    let response = await fetch(url);
    return OMDbJson = await response.json();
  }
  
  function afficherInfoFilm()
  {
    getOMDbJson(FILM_NAME)
    .then(OMDbJson => {
      var img = document.getElementById("poster");
      img.src = OMDbJson.Poster;
      document.getElementById("film-date-de-sortie").innerHTML = OMDbJson.Released;
      var contenuListe = "<tr>";
      OMDbJson.Genre.split(", ").forEach( genre => contenuListe += "<td><p class='arrondi2'>" + genre + "</p></td>");
      contenuListe += "<tr>";
      document.getElementById("list-genres").innerHTML = contenuListe;
    })
  }

  async function afficherListFilm(listFilm)
  {
    var i=0;
    listFilm.forEach(film => {
      getOMDbJson(film)
      .then(json => {
        if (json.Poster != undefined && json.Title != undefined && i<10) {
          var img = document.getElementById("img-"+i);
          img.src = json.Poster;
          document.getElementById("titre-img-"+i).innerHTML = film;
          var a = document.getElementById("titre-img-"+i);
          a.href = "film.html?titreFilm=" + film;
          i++;
        }
      })
    })
  }


  function getAbstractPerso() {
    var contenu_requete = PREFIX+ `SELECT DISTINCT ?abstract
    WHERE
    {
      ?acteur a dbo:Person.
      ?acteur rdfs:label ?nom.
      FILTER(contains(?nom,"`+PERSONNAGE_NAME+`") ).
      ?acteur dbo:abstract ?abstract.
      FILTER LANGMATCHES( LANG(?abstract), "en" ).
    }`;

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";
    console.log();

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            
            //check si on a trouvé des resultats
            if (data.results.bindings.length == 0){
              var abstract = "Undefined";
            }else{
              var abstract = data.results.bindings[0].abstract.value;
            }
            console.log(abstract);

            document.getElementById("perso-abstract").innerHTML = abstract;
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  function getNationalitePerso() {

    var contenu_requete = PREFIX+ `SELECT DISTINCT ?nationalite
    WHERE
    {
      ?acteur a dbo:Person.
      ?acteur rdfs:label ?nom.
      FILTER(contains(?nom,"`+PERSONNAGE_NAME+`") ).
      ?acteur dbo:birthPlace ?place.
      ?place rdfs:label ?nationalite.
      FILTER(LANGMATCHES(LANG(?nationalite), "en" )).
    }LIMIT 1`;


    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            
            //check si on a trouvé des resultats
            if (data.results.bindings.length == 0){
              var nationalite = "Undefined";
            }else{
              var nationalite = data.results.bindings[0].nationalite.value;
            }
            document.getElementById("perso-nationalite").innerHTML = nationalite;
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  function getNaissancePerso() {

    var contenu_requete = PREFIX+ `SELECT DISTINCT ?naissance
    WHERE
    {
      ?acteur a dbo:Person.
      ?acteur rdfs:label ?nom.
      FILTER(contains(?nom,"`+PERSONNAGE_NAME+`") ).
      ?acteur dbo:birthDate ?naissance.
    }`;

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            
            //check si on a trouvé des resultats
            if (data.results.bindings.length == 0){
              var naissance = "Undefined";
            }else{
              var naissance = data.results.bindings[0].naissance.value;
            }
            document.getElementById("perso-naissance").innerHTML = naissance;
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

function getFilmParameters()
{
  putFilmName();
  getAbstract();
  getActors();
  getDirector();
  getWriter();
  getBudget();
  getComposer();
  getProducer();
  getRecette();
  getCountry();
  getDuration();
  getFilmWithSameDirector();
}

function getPersoParameters()
{
  putPersonnageName();
  getAbstractPerso();
  getNationalitePerso();
  getNaissancePerso();
  getImagePerso();
  getFilmWithSameActor();
}

function getImagePerso() {

  var contenu_requete = `SELECT DISTINCT * WHERE
  {
  ?item wdt:P18 ?image.
  ?item wdt:P1559 ?name.
  FILTER (contains(?name,"`+PERSONNAGE_NAME+`")).
  }`;

  // Encodage de l'URL à transmettre à DBPedia
  var url_base = "https://query.wikidata.org/sparql";
  var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

  console.log(url);
  // Requête HTTP et affichage des résultats
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          var data = JSON.parse(this.responseText);
          
          var imageURL = data.results.bindings[0].image.value;
          var img = document.getElementById("image-perso");
          img.src = imageURL;

      }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
  
}

function getFilmWithSameDirector() {
  var contenu_requete = PREFIX + `SELECT DISTINCT ?nomF ?of  WHERE
  {
  ?film a dbo:Film.
  ?film rdfs:label ?nomF.
  FILTER(contains(?nomF,"`+FILM_NAME+`"))
  ?film dbo:director ?director.
  ?director rdfs:label ?nomD.
  ?of a dbo:Film.
  ?of dbo:director ?director.
  
  FILTER (LANGMATCHES( LANG(?nomF), "en" ) && LANGMATCHES( LANG(?nomD), "en" )).
  }LIMIT 10`
  ;

  // Encodage de l'URL à transmettre à DBPedia
  var url_base = "http://dbpedia.org/sparql";
  var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";
  
  console.log(contenu_requete);

  // Requête HTTP et affichage des résultats
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          var data = JSON.parse(this.responseText);
          //check si on a trouvé des resultats
          var listFilm = new Array();
          if (data.results.bindings.length == 0){
            var contenuTableau = "Undefined";
          }else{
            data.results.bindings.forEach((v, i) => {
              var url = v.of.value.split("/");
              var nom = url[url.length-1];
              var name = nom.replaceAll("_"," ");
              listFilm[i] = name;
            });
          }
          afficherListFilm(listFilm);
      }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function getFilmWithSameActor() {
  var contenu_requete = PREFIX + `SELECT DISTINCT ?nomA ?nomF WHERE
  {
  ?actor ^dbo:starring ?o.
  ?actor rdfs:label ?nomA.
  FILTER(contains(?nomA, "`+PERSONNAGE_NAME+`"))
  ?o rdfs:label ?nomF.
  FILTER LANGMATCHES(LANG(?nomF), "en" ).
  FILTER LANGMATCHES(LANG(?nomA), "en" ).
  }`
  ;

  // Encodage de l'URL à transmettre à DBPedia
  var url_base = "http://dbpedia.org/sparql";
  var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";
  
  
  // Requête HTTP et affichage des résultats
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var data = JSON.parse(this.responseText);
      console.log(data);
          //check si on a trouvé des resultats
          var listFilm = new Array();
          if (data.results.bindings.length == 0){
            var contenuTableau = "Undefined";
          }else{
            data.results.bindings.forEach((v, i) => {
              var url = v.nomF.value.split("/");
              var nom = url[url.length-1];
              var name = nom.replaceAll("_"," ");
              listFilm[i] = name;
            });
          }
          afficherListFilm(listFilm);
      }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
} 

function autocomplete_recherche()
{
  var contenu_requete_films = PREFIX + `SELECT DISTINCT ?nomF WHERE
  {
  ?film rdfs:label ?nomF.
  ?film a dbo:Film.
  FILTER LANGMATCHES( LANG(?nomF), "en" ).       
  }`;
  var contenu_requete_acteurs = PREFIX + `SELECT DISTINCT ?nomA WHERE
  {
    ?film a dbo:Film.
    ?film rdfs:label ?nomF.
    FILTER LANGMATCHES( LANG(?nomF), "en" ).
    ?film dbo:starring ?starring.
    ?starring rdfs:label ?nomA.
    FILTER LANGMATCHES( LANG(?nomA), "en" ).
  }`;
  
  
  console.log(contenu_requete_films);
  console.log(contenu_requete_acteurs);

  // Encodage de l'URL à transmettre à DBPedia
  var url_base = "http://dbpedia.org/sparql";
  var url_film = url_base + "?query=" + encodeURIComponent(contenu_requete_films) + "&format=json";
  var url_acteur = url_base + "?query=" + encodeURIComponent(contenu_requete_acteurs) + "&format=json";

  let results=[];

  // Requête HTTP et affichage des résultats
  var xmlhttp_films = new XMLHttpRequest();
  var xmlhttp_acteurs = new XMLHttpRequest();

  xmlhttp_films.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          var data = JSON.parse(this.responseText);
          console.log(data);
          //check si on a trouvé des resultats
          data.results.bindings.forEach(function(v){
            results.push(v.nomF.value); 
          });
          
      }
  };

  xmlhttp_acteurs.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        //check si on a trouvé des resultats
        data.results.bindings.forEach(function(v){
        results.push(v.nomA.value); 
        });
        
    }
  };

  xmlhttp_films.open("GET", url_film, true);
  xmlhttp_films.send();
  console.log(results);

  xmlhttp_acteurs.open("GET", url_acteur, true);
  xmlhttp_acteurs.send();
  console.log(results);

  autocomplete(document.getElementById("searchbar"),results);

}