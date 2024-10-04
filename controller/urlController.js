const dns = require('dns');
const crypto = require('crypto');
const { urlModel } = require('../models/url');
const { assert } = require('console');

const generateShortURL = async (length) => {
    return crypto.randomBytes(length).toString('base64').replace(/\W/g, '').slice(0, length);
}

const addUrl = async (req, res) => {
    try {
        let original_url =  req.body.url;
        const BASE_URL = process.env.BASE_URL;

        let protocol = original_url.search('http://') === 0 || original_url.search('https://') === 0;
        if(!protocol) {
            protocol = 'https://';
            original_url = protocol + original_url;
        }

        const findOriginalUrl = await urlModel.findOne({ original_url });
        if (findOriginalUrl) {
            return await res.status(200).json({
                original_url: findOriginalUrl.original_url,
                short_url: BASE_URL + findOriginalUrl.short_url
            });
        }

        const hostname = new URL(original_url).hostname;
        dns.lookup(hostname, async (err) => {
            if(err) return await res.status(400).json({ error: 'Invalid URL' });
        });

        let short_url = await generateShortURL(5);
        let findShortUrl = await urlModel.findOne({ short_url });
        while (findShortUrl) {
            short_url = await generateShortURL(5);
            findShortUrl = await urlModel.findOne({ short_url });
        }

        const newUrl = await new urlModel({
            original_url,
            short_url
        }).save();

        short_url = BASE_URL + short_url;

        return await res.status(200).json({ original_url, short_url });

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
}

const getUrl = async (req, res) => {
    try {
        const short_url = req.params.short_url;
        const url = await urlModel.findOne({ short_url });

        if (!url) return res.status(404).json({ error: 'URL not found' });
        return res.redirect(url.original_url);
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    addUrl,
    getUrl
}
