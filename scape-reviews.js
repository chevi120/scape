<script>


return { head: head, grid: grid };
}


function hydrateHeader(head, place){
var name = (place.name) || 'Google Reviews';
head.querySelector('h3').textContent = name;
var meta = head.querySelector('.scape-reviews__meta');
var rating = place.rating || 0;
var total = place.user_ratings_total || 0;
var url = place.url || '';
meta.innerHTML = '<div class="scape-reviews__stars" aria-label="Valoración media '+rating+' de 5">'+starHTML(rating)+'</div>'+
'<span>'+rating.toFixed(1)+'</span>'+
'<span>(' + total.toLocaleString() + ')</span>'+
(url ? '<a class="scape-reviews__maps" href="'+url+'" target="_blank" rel="noopener">Ver en Google&nbsp;Maps</a>' : '');
}


function addCard(grid, review){
var author = (review.author_name || 'Usuario de Google');
var text = (review.text || '');
var time = fmtDate(review.time ? review.time*1000 : review.relative_time_description || '');
var rating = review.rating || 0;


var el = document.createElement('article');
el.className = 'scape-reviews__card';
el.innerHTML = '\n <header class="scape-reviews__head">\n <div class="scape-reviews__avatar" aria-hidden="true">' + (author[0]||'G') + '</div>\n <div>\n <div class="scape-reviews__author">'+author+'</div>\n <time class="scape-reviews__time">'+(time || '')+'</time>\n </div>\n </header>\n <div class="scape-reviews__stars" aria-label="Puntuación de la reseña: '+rating+' de 5">'+starHTML(rating)+'</div>\n ' + (text ? '<p class="scape-reviews__text">'+(text.replace(/</g,'&lt;'))+'</p>' : '') + '\n <footer><span class="scape-reviews__badge">Reseña de Google</span></footer>\n ';
grid.appendChild(el);
}


async function mountOne(container){
var key = container.dataset.apiKey || window.SCAPE_GOOGLE_API_KEY;
var placeId = container.dataset.placeId;
var max = parseInt(container.dataset.max || '6', 10);
var min = parseFloat(container.dataset.minRating || '4');
var brand = container.dataset.brand || '#00C389';


if (!key) { container.innerHTML = '<p>Falta API Key.</p>'; return; }
if (!placeId) { container.innerHTML = '<p>Falta place_id.</p>'; return; }


await loadMaps(key);


var parts = container.appendChild(document.createElement('div'));
var ui = render(parts, { brand: brand });


var mapDiv = document.createElement('div');
mapDiv.style.display = 'none';
parts.appendChild(mapDiv);


var service = new google.maps.places.PlacesService(mapDiv);
service.getDetails({ placeId: placeId, fields: ['name','url','rating','user_ratings_total','reviews'] }, function(place, status){
if (status !== google.maps.places.PlacesServiceStatus.OK || !place){
container.innerHTML = '<p>No se pudieron cargar las reseñas ('+status+').</p>';
return;
}
hydrateHeader(ui.head, place);
var printed = 0;
(place.reviews||[]).forEach(function(r){
if ((r.rating||0) < min) return;
if (!r.text) return;
addCard(ui.grid, r);
printed++; if (printed>=max) return;
});
if (!printed){ ui.grid.innerHTML = '<p>No hay reseñas para mostrar con los filtros actuales.</p>'; }
});
}


function mountAll(){
document.querySelectorAll('[data-scape-reviews]')
.forEach(function(el){ mountOne(el); });
}


if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll);
else mountAll();
})();
</script>

