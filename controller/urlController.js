const dns = require('dns');
const crypto = require('crypto');
const { urlModel } = require('../models/url');

// Fungsi untuk menghasilkan short URL
const generateShortURL = async (length) => {
    return crypto.randomBytes(length).toString('base64').replace(/\W/g, '').slice(0, length);
}

const addUrl = async (req, res) => {
    try {
        const original_url = req.body.url;

        // Validasi URL menggunakan objek URL dan pastikan hanya menerima skema "https://"
        let url;
        try {
            url = new URL(original_url);
            if (url.protocol !== 'https:') {
                return res.json({ error: 'invalid url, only https is accepted' });
            }
        } catch (error) {
            return res.json({ error: 'invalid url format' });
        }

        // Ambil hostname untuk pengecekan DNS
        const host = url.hostname;

        // Gunakan dns.lookup untuk memverifikasi host
        dns.lookup(host, async (err) => {
            if (err) {
                return res.json({ error: 'invalid url, DNS lookup failed' });
            }

            // Hitung jumlah dokumen yang sudah ada dan gunakan sebagai short_url
            let short_url = await generateShortURL(5);

            // Loop untuk memastikan tidak ada konflik dengan short_url yang sudah ada
            let checkShort = await urlModel.findOne({ short_url });
            while (checkShort) {
                short_url = await generateShortURL(6);
                checkShort = await urlModel.findOne({ short_url });
            }

            // Simpan URL yang baru di database
            const newShortUrl = new urlModel({
                original_url,
                short_url
            });
            await newShortUrl.save();

            return res.status(200).json({ original_url, short_url });
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
}

const getUrl = async (req, res) => {
    try {
        const short_url = req.params.short_url;
        const url = await urlModel.findOne({ short_url });

        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }

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
