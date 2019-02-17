

var cheerio = require('cheerio');
var request = require('request');
var jsonfile = require('jsonfile');

//urls of the pages to scrap
var pagesToScrap = [];
var baseUrl =  "https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-"
for(var i=1; i<=35; i++){
  pagesToScrap.push(baseUrl+i.toString());
}

function scrapPage(url, result) {
  return new Promise(function(resolve, reject){
    console.log('calling ', url);
    request({
      method: 'GET',
      url: url
    }, function(err, response, body){
      if(err){
        console.error(err);
        return reject(err);
      }

      $ = cheerio.load(body);
      var countRestaurants = 0;

      $('.ds-1col.node.node--poi.view-mode-poi_card.node--poi-card').each(function(){
        var currentRestaurant = {
          name: $('.poi_card-display-title', this).text().trim(),
          category: $('.poi_card-display-cuisines', this).text().replace(/;/g,',').trim(),
          urls: {michelin: 'https://restaurant.michelin.fr' + $('a', this).attr('href')}
        };

        //Michelin stars
        if($('span', this).hasClass('guide-icon icon-mr icon-cotation3etoiles')){
          currentRestaurant.stars = 3;
        }
        else if ($('span', this).hasClass('guide-icon icon-mr icon-cotation2etoiles')) {
          currentRestaurant.stars = 2;
        }
        else if ($('span', this).hasClass('guide-icon icon-mr icon-cotation1etoile')) {
          currentRestaurant.stars = 1;
        }

        result.push(currentRestaurant);
        countRestaurants++;
      });

      console.log(countRestaurants + " restaurants on this page");
      console.log('-----------------------');

      setTimeout(function(){
        return resolve(result);
      }, 100);
    });
  });
}

exports.get = function() {
  pagesToScrap.reduce(function(prev, elt, idx, array){
    return prev.then(function(results){
      return scrapPage(elt, results)
    })
  }, Promise.resolve([]))
  .then(function(results){
    jsonfile.writeFile('output/1_restaurants_list.json', results, {spaces: 2}, function(err){
      if(err){
        console.error(err);
      }
      console.log('***** json done *****');
      console.log("Total number of restaurants: " + results.length);
    });
  });
}

function getAddress(restaurants, idx) {
  return new Promise(function(resolve, reject){
    console.log('[' + (idx+1) + '/' + restaurants.length + '] calling ' + restaurants[idx].urls.michelin);
    request({
      method: 'GET',
      url: restaurants[idx].urls.michelin
    }, function(err, response, body){
      if(err){
        console.error(err);
        return reject(err);
      }

      $ = cheerio.load(body);
      restaurants[idx].address = {
        street: $('.street-block', '.field.field--name-field-address.field--type-addressfield.field--label-hidden').first().text(),
        postalCode: $('.postal-code', '.field.field--name-field-address.field--type-addressfield.field--label-hidden').first().text(),
        city: $('.locality', '.field.field--name-field-address.field--type-addressfield.field--label-hidden').first().text()
      }

      setTimeout(function(){
        return resolve(restaurants);
      }, 0);
    });
  });
}

exports.getAllAddresses = function(restaurants) {
  restaurants.reduce(function(prev, elt, idx, array){
    return prev.then(function(restaurants){
      return getAddress(array, idx);
    })
  }, Promise.resolve([]))
  .then(function(restaurants){
    jsonfile.writeFile('output/2_restaurants_list.json', restaurants, {spaces: 2}, function(err){
      if(err){
        console.error(err);
      }
      console.log('***** json done *****');
    });
  });
}