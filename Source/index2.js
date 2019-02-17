var michelin =  require ( ' ./michelin ' );
var jsonfile =  require ( ' jsonfile ' );

jsonfile . readFile ( ' output / 1_restaurants_list.json ' , fonction ( err , restaurants ) {
  // récupère l'adresse de chaque restaurant et écrit un nouveau fichier JSON '2_restaurants_list.json'
  michelin . getAllAddresses (restaurants);
});