const dns = require('dns');
const crypto = require('crypto');
const { urlModel } = require('../models/url');

const generateShortURL = async (length) => {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
}

const addUrl = async (req, res) => {
    try {
        const original_url = await req.body.url;

        // Validasi URL menggunakan objek URL dan pastikan hanya menerima skema "https://"
        let url;
        if(!original_url.includes('https://')) {
            return res.status(400).json({ error: 'invalid url' });
        }

        // Ambil hostname untuk pengecekan DNS
        const host = url.hostname;

        // Gunakan dns.lookup untuk memverifikasi host
        dns.lookup(host, async (err) => {
            if (err) {
                return res.status(400).json({ error: 'invalid url' });
            }

            // Hitung jumlah dokumen yang sudah ada dan gunakan sebagai short_url
            let short_url = generateShortURL(5);

            // Cek apakah short_url sudah ada
            const checkShort = await urlModel.findOne({ short_url });
            if (checkShort) {
                short_url = await generateShortURL(6);
            }

            const newShortUrl = new urlModel({
                original_url,
                short_url
            });
            await newShortUrl.save();

            res.status(200).json({ original_url, short_url });
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
