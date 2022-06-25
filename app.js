//public key : ec949d5b2a6941e3a4585a2d31c8e716
//private key : 7408edbe512e0e2826e11d7796b1d9302f29c7e8
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const _ = require('lodash');
const https = require("https");
const ejs = require("ejs");
const md5 = require("md5");
const app = express();
const alert = require("alert");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
const API_URL = process.env.BASE_URL;


var characterDetails=[];


const getHash = function(ts, secretKey, publicKey) {
  return md5(ts + secretKey + publicKey).toString();
}

app.get("/", function(req, res){
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/", function(req, res){
  characterDetails=[];
  let query = _.kebabCase(_.capitalize(req.body.characterName));
  let baseURL = (API_URL + "/v1/public/characters").toString();
  let ts = Date.now().toString();
  let apiKey = process.env.API_KEY;
  let privateKey = process.env.PRIVATE_KEY;
  let hash = getHash(ts, privateKey, apiKey);
  let url = baseURL + "?ts=" + ts + "&apikey=" + apiKey + "&hash=" + hash + "&nameStartsWith=" + query;
  https.get(url, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      var obj = JSON.parse(data)
      obj.data.results.forEach(function(item){
        const imgPath = item.thumbnail.path + ".jpg";
        const characterDetail = {
          id: item.id,
          imageURL: imgPath,
          name: item.name,
          description: item.description
        };
        console.log(imgPath);
        characterDetails.push(characterDetail);

      });
      if(characterDetails.length === 0) {
        alert("Sorry ! No Collections Available.");
        res.redirect("/");
      }
      res.render("content", {itemLists: characterDetails});
    });
  })
  .on('error', (error) => {
    console.log(error);
  });
});


app.listen(3000, function(){
  console.log("Port 3000 listened Successfully !");
})
