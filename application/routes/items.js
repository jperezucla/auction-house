var express = require('express');
var http = require("http");
var router = express.Router();

var mongoose = require('mongoose');

var host = 'us.battle.net';
var batchUrlPath = '/api/wow/auction/data/hyjal';

var baseOptions = {
    host: host,
    path: '',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

/**
 * @param options: http options object
 * @param onResult: callback to pass the results JSON object(s) back
 */
function getItemAuctions(options, itemId, onResult) {
    var req = http.request(options, function(res) {
        var output = '';

        console.log(options.host + ':' + res.statusCode);

        res.setEncoding('utf8');

        res.on('data', function(chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);

            console.log(obj);

            var items = extractItems(obj, itemId);

            onResult(items);
        });
    });

    req.on('error', function(err) {
        res.send('error: ' + err.message);
    });

    req.end();
}

function extractItems(obj, itemId) {
    return obj;
}

/**
 * @param options: http options object
 * @param onResult: callback to pass the results JSON object(s) back
 */
function getBatchUrl(options, onResult) {
    var req = http.request(options, function(res) {
        var output = '';

        console.log(options.host + ':' + res.statusCode);

        res.setEncoding('utf8');

        res.on('data', function(chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);

            console.log(obj);

            var batchUrl = extractBatchUrl(obj);

            onResult(batchUrl);
        });
    });

    req.on('error', function(err) {
        res.send('error: ' + err.message);
    });

    req.end();
}

function extractBatchUrl(obj) {
    var files = obj.files;

    return files[0].url;
}

/*
 * GET item page
 */
router.get('/:realm/:faction/:wowId', function(req, res) {

    var Item = mongoose.model("Item");

    var realm = req.params.realm;
    var faction = req.params.faction;
    var itemId = req.params.wowId;

    console.log("Realm: " + realm + ", faction: " + faction + ", itemId: " + itemId);

    Item.find({
        'wowId': itemId
    }, function(err, items) {
        if (err) {
            res.send(err);
        }

        var item = items[0];
        res.json(item);
    });

});

/*
 * GET item list.
 */
router.get('/itemlist', function(req, res) {

    var Item = mongoose.model("Item");

    Item.find({}, function(err, items) {
        res.json(items);
    });

});

router.post('/additem', function(req, res) {
    var Item = mongoose.model("Item");

    var obj = req.body;
    var wowId = obj.wowId;
    var price = obj.price;

    var item = new Item({
        wowId: wowId,
        price: price
    });

    item.save(function(err, item) {
        res.send(
            (err === null) ? {
                msg: ''
            } : {
                msg: err
            }
        );
    });
});

router.get('/', function(req, res) {
    var batchUrlOptions = baseOptions;
    baseOptions.path = batchUrlPath;

    getBatchUrl(batchUrlOptions, function(batchUrl) {
        console.log('Batch url: ' + batchUrl);

        var words = batchUrl.split(host);

        var auctionHousePath = words[1];

        console.log('Auction house path: ' + auctionHousePath);

        var auctionHouseOptions = baseOptions;

        auctionHouseOptions.path = auctionHousePath;

        getItemAuctions(auctionHouseOptions, 76087, function(items) {
            res.send(items);
        });
    });
});

/*
 * DELETE to deleteitem.
 */
/*router.delete('/deleteitem/:id', function(req, res) {
    var db = req.db;
    var itemToDelete = req.params.id;
    db.collection(collectionName).removeById(itemToDelete, function(err, result) {
        res.send((result === 1) ? {
            msg: ''
        } : {
            msg: 'error: ' + err
        });
    });
});*/

module.exports = router;
