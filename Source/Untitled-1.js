var cheerio = require('cheerio');
var request = require('request');
var jsonfile = require('jsonfile');

//urls of the pages to scrap
var pagesToScrap = [];
var baseUrl =  "https://www.relaischateaux.com/us/site-map/etablissements?fbclid=IwAR2da5WJUYfO9eazcYNfit_Nus26r09bDJaQppYhIVpPu-B41BPa0wJfzoc"

pagesToScrap.push(baseUrl);


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

      $('::before').each(function(){
        var currentRestaurant = {
			urls:  $('a', this).attr('href')
        };     

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
    jsonfile.writeFile('output/3_restaurants_list.json', results, {spaces: 2}, function(err){
      if(err){
        console.error(err);
      }
      console.log('***** json done *****');
      console.log("Total number of restaurants: " + results.length);
    });
  });
}
