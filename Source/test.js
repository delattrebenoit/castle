const request = require('request');
const cheerio = require('cheerio');

var countRestaurants = 0;
var countRestaurants2 = 0;
var tableau2 =[];
async function scrapPage(url, tableau) {
    return new Promise(function(resolve, reject){  
            
      request({
          
        method: 'GET',
        url: url
      }, function(err, response, body){
        if(err){
          console.error(err);
          return reject(err);
        } 
        var $ = cheerio.load(body);
        var currentHotel=0;
        $("#tabProperty").each(function(i)
	    {
        
            
		    ($(this).find("div:nth-child(5)"))
		    {
            
			    $(this).find("div.row.hotelTabsHeader").each(function(j)
			    {
              $(this).find("div ").each(function(j)
			        {
                        
				        $(this).find("div.hotelTabsHeaderTitle").each(function(k)
				        {
                  $(this).find("h3")
				          {
					            
                                  
                     currentHotel.Hotel= $(this).filter("h3").text(); 
                     console.log($(this).filter("h3").text());                        
                      
                    
                                                 
                                
                  }
                })
              })
                        
                    
            })
            $(this).find("div.row.propertyDesc ").each(function(j)
			    {
              $(this).find("div.col-1-3 ").each(function(j)
			        {
                        
				        $(this).find("div.richTextMargin ").each(function(k)        {
                  
					            
                                  
                    currentHotel.description=$(this).filter("h3").text().trim();
                                                  
                                
                  
                })
              })
                        
                    
            })
            tableau.push(currentHotel);
                    console.log(tableau);  
		    }
	    });
        
        
        
        });  
        
        
        setTimeout(function(){
          return resolve(tableau);
        }, 100);
      });
    }

    
request('https://www.relaischateaux.com/fr/site-map/etablissements?fbclid=IwAR1N8kTL8UeswgVcnKkwcyVez23ky6IjrycQO9TqavWe5dOWhHx5GOG8Q-I',(error,response,body)=>
{
	if(!error && response.statusCode==200)
	{
        //console.log(html);
	var $ = cheerio.load(body);
    var tableau =[];
    var place =0;
	
	$("#countryF").each(function(i)
	{
        
		if($(this).find("h3").text() === 'France')
		{
			$(this).find("li").each(function(j)
			{
				$(this).find("a").each(function(k)
				{
					if(k==0)
					{                                      
                        
                        scrapPage($(this).filter("a").attr('href'),tableau);
                        
                        
                                           
                        
					}
				}
		    )}
		)}
	}
    )}
});

