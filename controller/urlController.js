const dns = require('dns');
const crypto = require('crypto');
const { urlModel } = require('../models/url');

const generateShortURL = async (length) => {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
}

const addUrl = async (req, res) => {
    try {
        const original_url = req.body.url;

        // Validasi URL menggunakan URL object untuk memastikan formatnya benar
        // let url;
        // try {
        //     url = new URL(original_url); // Ini akan melempar error jika format URL tidak valid
        // } catch (error) {
        //     return res.status(400).json({ error: 'invalid url' });
        // }

        const host = original_url.substring(8);
        dns.lookup(host, async (err) => { // Gunakan callback untuk DNS lookup
            if (err) {
                return res.status(400).json({ error: 'invalid url' });
            }

            let size = await urlModel.countDocuments();
            let short_url = await generateShortURL(6);
            const checkShort = await urlModel.findOne({ short_url });

            if (checkShort) {
                short_url = await generateShortURL(6);
            }

            const newShortUrl = new urlModel({
                original_url,
                short_url
            });
            await newShortUrl.save();

            return res.status(200).json({ original_url, short_url });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}

const getUrl = async (req, res) => {
    try {
        const short_url = req.params.short_url;
        const url = await urlModel.findOne({ short_url });
        
        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }

        res.redirect(url.original_url);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    addUrl,
    getUrl
}
