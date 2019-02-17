const request = require('request')
const rp = require('request-promise')
const cheerio = require('cheerio')
const $ = require('cheerio')
const fs = require('fs')
const fetch = require("node-fetch")

async function createJsonURL(){
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

function getURL(){
    const file = fs.readFileSync('url.json')
    const url = JSON.parse(file)
    return url
}

const url =getURL()


const getDataFromUrl = async function(url){
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

async function getHotelJSON(){
    let result = []
    for(let i = 0; i < url.links.length; i++)
    {
        console.log('Process : ' + (i+1) + '/' + url.links.length)
        await getDataFromUrl(url.links[i]).then(value => {
            result.push(value)
        })
    }   
    let res = []
    for(let i = 0; i < result.length; i++){
        if(result[i].name != ""){
            res.push(result[i])
        }
    }
    
    result = []
    for (let i = 0; i < res.length; i++) {
        if(res[i].rest[1].name != null){
            result.push(fetch("https://restaurant.michelin.fr/index.php?q=search/autocomplete/" + encodeURI(res[i].rest[0].name)))
            result.push(fetch("https://restaurant.michelin.fr/index.php?q=search/autocomplete/" + encodeURI(res[i].rest[1].name)))
        }
        else{
            result.push(fetch("https://restaurant.michelin.fr/index.php?q=search/autocomplete/" + encodeURI(res[i].rest[0].name)))
            result.push(fetch("https://restaurant.michelin.fr/index.php?q=search/autocomplete/" + encodeURI(res[i].rest[0].name)))
        }
    }
    let trash = []
    for (let i = 0; i < result.length; i++) {
        var response = await result[i]
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
                    res[Math.trunc(i/2)].rest[i%2].michelinurl = "https://restaurant.michelin.fr" + response
                }
            }
        }
    }
    result = []
    for (let i = 0; i < res.length * 2; i++) {
        if(res[Math.trunc(i/2)].rest[i%2].michelinurl != null){
            result.push(fetch(res[Math.trunc(i/2)].rest[i%2].michelinurl))
        }
        else{
            result.push(0)
        }
    }
    let star = 0
    for (let i = 0; i < res.length * 2; i++) {
        if(result[i] != 0){
            var response = await result[i]
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
            res[Math.trunc(i/2)].rest[i%2].star = star
        }
        
    }
    let data = JSON.stringify(res)
    fs.writeFileSync('hotel.json', data)
    return res
}

function getHotel3(){
    getHotelJSON()
    const file = fs.readFileSync('hotel.json')
    const url = JSON.parse(file)
    return url
}

let hotels3 = getHotel3()
console.log(hotels3)







