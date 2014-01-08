#!/usr/bin/env node

//Configure decoder to convert http stream to string
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

var twitter = require('twit');
// Configure twitter authentication keys
var fs = require('fs');
var tkeys = fs.readFileSync('.t2keys').toString().split("\n");
var T = new twitter({consumer_key:tkeys[0],consumer_secret:tkeys[1],access_token:tkeys[2],access_token_secret:tkeys[3]});

//Initialize btc price. Set monitor interval in minutes
var btcprice_previous = 840;
var Interval = 60;
var t2 = setInterval(btctwitbot,Interval*60000);

function btctwitbot() {

//Make https request
var https = require('https');
var fetchcoinbase = https.request({host:'coinbase.com',path:'/api/v1/currencies/exchange_rates'},coinbase_to_twitter_callback);

//End https request
fetchcoinbase.on('error',callbackerr);
fetchcoinbase.end();
}

function callbackerr(e) {process.stdout.write('http error: ' + e.message);}

function coinbase_to_twitter_callback(res) {

var response_string = '';
res.on('data', function(d) { response_string += decoder.write(d); } );

res.on('end', function() {

    var response_json = JSON.parse(response_string);
    var btcprice = parseFloat(response_json.btc_to_usd);
    
    //Tweet btc price in case of high volatility
    if(btcprice/btcprice_previous<0.95 || btcprice/btcprice_previous>1.05)
    {
	var tweettext = '#bitcoin volatility alert 1 bitcoin = '+Math.round(btcprice*100)/100+' USD';
	T.post('statuses/update', { status: tweettext }, function(err,reply) {});
    }

    // Status/debugger commands
    console.log(Date());
    console.log('past btcprice = '+Math.round(btcprice_previous*100)/100+'\ncurrent btcprice = '+Math.round(btcprice*100)/100+'\n');

    // Set previous btc rate for next iteration
    btcprice_previous = btcprice;
});

}
