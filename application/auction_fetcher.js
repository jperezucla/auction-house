'use strict';

var _ = require('lodash');
var http = require('http');
var https = require('https');
var util = require('util');

var configs = require('./configs.json');

var HEALTH_CHECK_INTERVAL_MS = configs.auctions_request_interval_ms || 60000;

function init()
{
    var realm = 'hyjal';
    var locale = 'en_US';

    get_current_batch_url(realm, locale);

    setInterval(get_current_batch_url, HEALTH_CHECK_INTERVAL_MS, realm, locale);
}

function get_current_batch_url(realm, locale)
{
    var api_key = configs.api_key;

    if (!api_key)
    {
        console.error('No API key in configs.json');
        return;
    }

    if (!realm || !locale)
    {
        console.error('No realm or locale available for fetching auctions');
        return;
    }

    var url = configs.auctions_request_base_url + util.format('/%s?locale=%s&apikey=%s',
        realm, locale, api_key);

    console.log('Fetching current batch url with url', url);

    https.get(url, function(res)
    {
        res.setEncoding('utf-8');

        var response_string = '';

        res.on('data', function(data)
        {
            response_string += data;
        });

        res.on('end', function()
        {
            var response_obj = null;
            try
            {
                response_obj = JSON.parse(response_string);

            }
            catch (e)
            {
                var err = _.isString(e) ? e : util.inspect(e);
                console.error('Error parsing response data. error is ', err);
            }

            if ((res.statusCode === 200 || res.statusCode === 304) && response_obj)
            {
                console.log('Successful response');
                console.log(response_obj);

                var files = response_obj.files;
                if (files && files.length > 0 && 'url' in files[0])
                {
                    var batch_url = files[0].url;
                    fetch_auctions(batch_url);
                }
                else
                {
                    console.error('No files or url available in response');
                }
            }
            else
            {
                console.error('Improper response status code of', res.statusCode);
            }
        });
    }).on('error', function(e)
    {
        var err = _.isString(e) ? e : util.inspect(e);
        console.error('Error event occured. error is', err);
    });
}

function fetch_auctions(batch_url)
{
    console.log('Fetching auctions with url', batch_url);

    http.get(batch_url, function(res)
    {
        res.setEncoding('utf-8');

        var response_string = '';

        res.on('data', function(data)
        {
            response_string += data;
        });

        res.on('end', function()
        {
            var response_obj = null;
            try
            {
                response_obj = JSON.parse(response_string);

            }
            catch (e)
            {
                var err = _.isString(e) ? e : util.inspect(e);
                console.error('Error parsing response data. error is ', err);
            }

            if ((res.statusCode === 200 || res.statusCode === 304) && response_obj)
            {
                console.log('Successful response');
                console.log(response_obj);

                var auctions = response_obj.auctions;
                if (auctions)
                {
                    console.log('Found %s auctions', auctions.length);
                }
                else
                {
                    console.error('No auctions in response');
                }
            }
            else
            {
                console.error('Improper response status code of', res.statusCode);
            }
        });
    }).on('error', function(e)
    {
        var err = _.isString(e) ? e : util.inspect(e);
        console.error('Error event occured. error is', err);
    });
}

exports.init = init;
