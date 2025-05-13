const axios = require('axios');
const zlib = require('zlib');
const { processCountryData } = require('../services/countryService');
const ApiKey = require('../models/apiKeyModel');


exports.getCountries = async (req, res) => {
    const country = req.query.country ? req.query.country.toLowerCase() : null;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');

    try {
        let url = 'https://restcountries.com/v3.1/all'; 

        if (country) {
            url = `https://restcountries.com/v3.1/name/${country}`;
        }

        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            timeout: 60000,
            headers: {
                'Accept-Encoding': 'gzip, deflate, br'
            }
        });

        const contentEncoding = response.headers['content-encoding'];
        let pipelineStream = response.data;

        if (contentEncoding === 'gzip') {
            pipelineStream = response.data.pipe(zlib.createGunzip());
        } else if (contentEncoding === 'deflate') {
            pipelineStream = response.data.pipe(zlib.createInflate());
        } else if (contentEncoding === 'br') {
            pipelineStream = response.data.pipe(zlib.createBrotliDecompress());
        }

        let data = '';
        pipelineStream.on('data', (chunk) => {
            data += chunk;
        });

        pipelineStream.on('end', async () => {
            const countriesData = JSON.parse(data);

            if (countriesData.length > 1) {
                const processedData = processCountryData(countriesData);
                res.status(200).json(processedData);

                const userId = req.user.userId; 
                await incrementApiCount(userId);

            } else if (countriesData.length === 1) {
                const processedData = processCountryData(countriesData);
                res.status(200).json(processedData);

                const userId = req.user.userId;
                await incrementApiCount(userId);
                
            } else {
                res.status(404).json({ error: 'No countries found for the given search term.' });
            }
        });

        pipelineStream.on('error', (err) => {
            console.error('Stream Error:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        });

    } catch (error) {
        console.error('Request failed:', error.message);
        if (!res.headersSent) {
            if (error.code === 'ECONNABORTED') {
                res.status(504).json({ error: 'Gateway Timeout' });
            } else if (error.response) {
                res.status(error.response.status).json({ error: 'API Error' });
            } else {
                res.status(502).json({
                    error: 'Bad Gateway',
                    details: error.message,
                    code: error.code
                });
            }
        }
    }
};






exports.getCountriesMicro = async (req, res) => {
    console.log("getCountriesMicro")
    const country = req.query.country ? req.query.country.toLowerCase() : null;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    console.log("country",country)
    try {
        let url = 'https://restcountries.com/v3.1/all'; 

        if (country) {
            url = `https://restcountries.com/v3.1/name/${country}`;
        }
        console.log("url",url)
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            timeout: 60000,
            headers: {
                'Accept-Encoding': 'gzip, deflate, br'
            }
        });

        const contentEncoding = response.headers['content-encoding'];
        let pipelineStream = response.data;

        if (contentEncoding === 'gzip') {
            pipelineStream = response.data.pipe(zlib.createGunzip());
        } else if (contentEncoding === 'deflate') {
            pipelineStream = response.data.pipe(zlib.createInflate());
        } else if (contentEncoding === 'br') {
            pipelineStream = response.data.pipe(zlib.createBrotliDecompress());
        }

        let data = '';
        pipelineStream.on('data', (chunk) => {
            data += chunk;
        });
        console.log("data",data)
        pipelineStream.on('end', async () => {
            const countriesData = JSON.parse(data);

            if (countriesData.length > 1) {
                const processedData = processCountryData(countriesData);
                console.log("processedData",processedData)
                    res.status(200).json(processedData);

                // const userId = req.user.userId; 
                // await incrementApiCount(userId);

            } else if (countriesData.length === 1) {
                const processedData = processCountryData(countriesData);
                res.status(200).json(processedData);

                // const userId = req.user.userId;
                // await incrementApiCount(userId);
                
            } else {
                res.status(404).json({ error: 'No countries found for the given search term.' });
            }
        });

        pipelineStream.on('error', (err) => {
            console.error('Stream Error:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        });

    } catch (error) {
        console.error('Request failed:', error.message);
        if (!res.headersSent) {
            if (error.code === 'ECONNABORTED') {
                res.status(504).json({ error: 'Gateway Timeout' });
            } else if (error.response) {
                res.status(error.response.status).json({ error: 'API Error' });
            } else {
                res.status(502).json({
                    error: 'Bad Gateway',
                    details: error.message,
                    code: error.code
                });
            }
        }
    }
};


const incrementApiCount = async (userId) => {
    try {
        const apiKey = await ApiKey.findOne({ where: { userId } });
        
        if (apiKey) {
            apiKey.apiCount += 1;
            await apiKey.save(); 
            console.log('API count incremented for user:', userId);
        } else {
            console.log('API key not found for user:', userId);
        }
    } catch (error) {
        console.error('Error incrementing API count:', error);
    }
};
