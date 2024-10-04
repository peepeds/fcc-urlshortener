const dns = require('dns');
const crypto = require('crypto');
const { urlModel } = require('../models/url');
const generateShortURL = async (length) => {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
}

const addUrl = async (req, res) => {
    const original_url = await req.body.url;

    const host = await original_url.slice(8);
    const dnsCheck = await dns.lookup(host, (err, address, family) => {
        if (err) {
            console.log(err)
            res.json({error: 'invalid url'})
        } 
    });

    let short_url = await generateShortURL(6);
    const checkShort = await urlModel.findOne({ short_url: short_url });

    if (checkShort) {
        short_url = await generateShortURL(6);
    }

    const newShortUrl =  new urlModel({
        original_url,
        short_url
    });
    await newShortUrl.save();

    res.status(200).json({ original_url, short_url });
}

const getUrl = async (req, res) => {
    const short_url = await req.params.short_url;
    const url = await urlModel.findOne({ short_url});
    const long_url =  url.original_url;

    res.redirect(long_url)
}


module.exports = {
    addUrl,
    getUrl
}