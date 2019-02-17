const request = require('request')
const rp = require('request-promise')
const cheerio = require('cheerio')
const $ = require('cheerio')
const fs = require('fs')
const fetch = require("node-fetch")

async function ListeURLL(){
    request('https://www.relaischateaux.com/fr/site-map/etablissements', (error, response, html) => {
        if(!error && response.statusCode == 200){
            const $ = cheerio.load(html)
            $('#countryF').first().remove()
            const destinationResults = $('#countryF').html()
            const url = 
            {
                links: destinationResults.split('"').filter(word => word.includes("https://www.relaischateaux.com/fr/france"))
            }
            let data = JSON.stringify(url)
            fs.writeFileSync('url.json', data)
            return url
        }
    })
}

//createJsonURL()

function URL(){
    const file = fs.readFileSync('url.json')
    const url = JSON.parse(file)
    return url
}

const url =URL()


const initialization = async function(url){
    return rp(url)
        .then(function(html){
            let rest0 = null, rest1 = null
            if($('.jsSecondNavSub',html).find("li").first().find("a").text() != '')
                    {
                        rest0 = $('.jsSecondNavSub', html).find("li").first().find("a").text().trim()
                        if($('.jsSecondNavSub',html).find("li").next().find("a").text() != '')
                        {
                            rest1 = $('.jsSecondNavSub',html).find("li").next().find("a").text().trim()
                        }
                    }
            else
            {
                rest0 = $('.rc-popinQualitelis-header',html).find("h1").text().trim()
            }
            let data = {
                name: $('.rc-popinQualitelis-heading', html).text().trim(),
                url: url,
                price: $('.price', html).text().trim(),
                city: $('[itemprop="addressLocality"]', html).first().text().trim(),
                citation: $('.citationMsg', html).text().trim().trim(),
                desc: $('.propertyDesc', html).find('.richTextMargin').text().trim(),
                rest: [{name: rest0, michelinurl: null, star: null},{name: rest1, michelinurl: null, star: null}]                 
            }
            return data
        })
        .catch(function(err){
            //handle error
        })
}

async function scrap(){
    let hotel2 = []
    for(let i = 0; i < url.links.length; i++)
    {
        console.log('Process : ' + (i+1) + '/' + url.links.length)
        await initialization(url.links[i]).then(value => {
            hotel2.push(value)
        })
    }   
    let hotel = []
    for(let i = 0; i < hotel2.length; i++){
        if(hotel2[i].name != ""){
            hotel.push(hotel2[i])
        }
    }
    
    hotel2 = []
    for (let i = 0; i < hotel.length; i++) {
        if(hotel[i].rest[1].name != null){
            hotel2.push(fetch("https://restaurant.michelin.fr/index.php?q=search/autocomplete/" + encodeURI(hotel[i].rest[0].name)))
            hotel2.push(fetch("https://restaurant.michelin.fr/index.php?q=search/autocomplete/" + encodeURI(hotel[i].rest[1].name)))
        }
        else{
            hotel2.push(fetch("https://restaurant.michelin.fr/index.php?q=search/autocomplete/" + encodeURI(hotel[i].rest[0].name)))
            hotel2.push(fetch("https://restaurant.michelin.fr/index.php?q=search/autocomplete/" + encodeURI(hotel[i].rest[0].name)))
        }
    }
    let trash = []
    for (let i = 0; i < hotel2.length; i++) {
        var response = await hotel2[i]
        response = (await response.json())
        if (response.toString().includes("Aucun résultat.")) {
            trash.push(i)
        }
        else {
            response = await JSON.stringify(response)
            if (response.includes("poi")) {
                response = await JSON.parse(response)
                let keys = Object.keys(response)
                let key = null
                for (let w = keys.length - 1; w != -1; w--) {
                    if (keys[w] != "poi-all" && keys[w].includes("poi")) {
                        key = keys[w]
                    }
                }
                if (key != null) {
                    response = response[key].split('"')[1]
                    hotel[Math.trunc(i/2)].rest[i%2].michelinurl = "https://restaurant.michelin.fr" + response
                }
            }
        }
    }
    hotel2 = []
    for (let i = 0; i < hotel.length * 2; i++) {
        if(hotel[Math.trunc(i/2)].rest[i%2].michelinurl != null){
            hotel2.push(fetch(hotel[Math.trunc(i/2)].rest[i%2].michelinurl))
        }
        else{
            hotel2.push(0)
        }
    }
    let star = 0
    for (let i = 0; i < hotel.length * 2; i++) {
        if(hotel2[i] != 0){
            var response = await hotel2[i]
            response = await response.text()
            star = 0
            if (response.includes("icon-cotation1etoile")) {
                star = 1
            }
            else if (response.includes("icon-cotation2etoiles")) {
                star = 2
            }
            else if (response.includes("icon-cotation3etoiles")) {
                star = 3
            }
            hotel[Math.trunc(i/2)].rest[i%2].star = star
        }
        
    }
    let data = JSON.stringify(hotel)
    fs.writeFileSync('hotel.json', data)
    return hotel
}

function getHotel3(){
    scrap()
    const file = fs.readFileSync('hotel.json')
    const url = JSON.parse(file)
    return url
}

let hotels3 = readJason()
console.log(hotels3)







