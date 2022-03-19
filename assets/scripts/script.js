const API_KEY = 'api_key=db9b6f93b868b746cf1841e18cc3f83d';//&language=pt-BR
const API_LANG = '&language=pt-BR';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

const GENRES = [{"id":28,"name":"Ação"},{"id":12,"name":"Aventura"},{"id":16,"name":"Animação"},{"id":35,"name":"Comédia"},{"id":80,"name":"Crime"},{"id":99,"name":"Documentário"},{"id":18,"name":"Drama"},{"id":10751,"name":"Família"},{"id":14,"name":"Fantasia"},{"id":36,"name":"História"},{"id":27,"name":"Terror"},{"id":10402,"name":"Música"},{"id":9648,"name":"Mistério"},{"id":10749,"name":"Romance"},{"id":878,"name":"Ficção científica"},{"id":10770,"name":"Cinema TV"},{"id":53,"name":"Thriller"},{"id":10752,"name":"Guerra"},{"id":37,"name":"Faroeste"}];


var Generos = [...GENRES];
var itemNum = 0;
var movieList = [];
var randomGlobal = 0;

var SearchType = '';

function getSipnose(movie_id){
    //`https://api.themoviedb.org/3/movie/${movie_id}/videos?${API_KEY}` get trailer
    let tmpSip = 'Sipnose não encontrada!'
    fetch(`https://api.themoviedb.org/3/movie/${movie_id}?${API_KEY}&language=en-US`).then(res => res.json()).then(data => {
        tmpSip = data.overview;
        console.log(tmpSip)
        alternativeSip( tmpSip + " (Legenda em português não disponivel!)" );
    }).catch(err => console.warn(err))
    
}

randomGen();

function randomGen(){
    let i = getRandomGen();
    movieList = [];
    Generos.forEach(gen => {
        if(gen.name === Generos[i].name){
            console.log(gen.name)
            SearchType = `/discover/movie?with_genres=${gen.id}&`;
        }
    });
    Generos.splice(i, 1)
    getMovie()

    Generos.length == 1 ? Generos = [...GENRES] : console.log(Generos.length, 'generos restantes') ;
}

function getMovie(){
    itemNum = 0;

    fetch(BASE_URL + SearchType + API_KEY + API_LANG).then(res => res.json()).then(data => {
        showMovie(data.results)
        
    }).catch(err => console.warn(err))
}

function showMovie(list){
    list.forEach(movie => {
        movieList.push(movie);
    });
    generateMovie(getRandomMovie());
}

function formatDate(date){
    let day = date.substring(8, date.length)
    let mon = date.substring(5, 7)
    let yrs = date.substring(0, 4)

    return `${day}-${mon}-${yrs}`
}
function getRandomGen(){
    return Math.floor(Math.random() * Generos.length);
}
function getRandomMovie(){
    return Math.floor(Math.random() * movieList.length);
}
function getRate(rate){
    
    let rateStr = rate.toString();

    rateStr.length == 1 ? rateStr = rateStr + '.0' : null;

    return rateStr;
}

function speechDesc(movieName, movieDesc){
    let msg = new SpeechSynthesisUtterance();
    window.speechSynthesis.cancel();

    msg.text = movieName + ' : ' + movieDesc;

    setTimeout(() => {
        window.speechSynthesis.speak(msg);
    }, 2000);
}

function prevMovie(){
    slideAnim('prevSlide');
    randomGlobal--;
    if(randomGlobal < 0)
        randomGlobal = movieList.length - 1;

    generateMovie(randomGlobal)
}

function nextMovie(){
    slideAnim('nextSlide');
    randomGlobal++;
    if(randomGlobal > (movieList.length - 1))
        randomGlobal = 0;

    generateMovie(randomGlobal)
}


function calcTouch(){
    if(touchPos[0] < touchPos[1]){
        if((touchPos[1] - touchPos[0]) < 100) return;
        nextMovie();
    }else if(touchPos[0] > touchPos[1]){
        if((touchPos[0] - touchPos[1]) < 100) return;
        prevMovie();
    }
}

//Interface

let container = document.getElementById('container');
let touchPos = []

container.addEventListener("touchstart", event => {
    touchPos = [];
    touchPos[0] = event.changedTouches[0].pageX;
});

container.addEventListener("touchend", event => {
    touchPos[1] = event.changedTouches[0].pageX;
    calcTouch();
});

function slideAnim(slide){
    let invert = '';

    if(slide === 'prevSlide')
        invert = 'nextSlide';
    else
        invert = 'prevSlide';

    $( ".movie-poster" ).addClass( slide );
    $( ".movie-desc" ).addClass( slide );
    setTimeout(() => {
        $( ".movie-poster" ).removeClass( slide ).addClass( "dNone" ).addClass( invert );
        $( ".movie-desc" ).removeClass( slide ).addClass( "dNone" ).addClass( invert );
        setTimeout(() => {
            $( ".movie-poster" ).removeClass( "dNone" );
            $( ".movie-desc" ).removeClass( "dNone" );
            setTimeout(() => {
                $( ".movie-poster" ).removeClass( invert );
                $( ".movie-desc" ).removeClass( invert );
            }, 100);
        }, 100);
    }, 100);   
}

function alternativeSip(sip){
    $('.movie-sip').html(sip)
}

function generateMovie(pos){
    let genMovie = "";

    randomGlobal = pos;
    
    $('.movie-back').attr('src', IMG_URL + movieList[pos].backdrop_path );
    $('.movie-poster').attr('src', IMG_URL + movieList[pos].poster_path );
    $('.movie-name').html( movieList[pos].title );
    
    
    $('.movie-sip').html( movieList[pos].overview ? movieList[pos].overview : getSipnose(movieList[pos].id) );
    
    
    
    $('.movie-textrate').html( getRate(movieList[pos].vote_average) );
    $('.movie-countvotes').html( `Votos: ${getRate(movieList[pos].vote_count)}` );
    movieList[pos].genre_ids.forEach(gen => {
        for (let i = 0; i < GENRES.length; i++) {
            if(gen == GENRES[i].id)
                genMovie = GENRES[i].name + ", " + genMovie;
        }
    })
    $('.movie-gen').html( `Genero: ${genMovie.substring(0, genMovie.length - 2)}.`);
    $('.movie-release').html( `Data de lançamento: ${formatDate(movieList[pos].release_date)}`);
}