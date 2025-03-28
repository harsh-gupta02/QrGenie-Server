const express = require('express')
const dotenv = require('dotenv')
const qrcode = require('qrcode')
const cors = require('cors')

const app = express()
app.use(express.json())
dotenv.config()
const port = process.env.PORT || 3000

app.use(cors())

const validateType = (req, res, next) => {
    if (req.body.data) {
        if(req.body.data.url || req.body.data.text) {
            req.body.data = req.body.data.url || req.body.data.text
        }
        else if(req.body.data.ssid && req.body.data.encryptionType) {
            const ssid = req.body.data.ssid
            const encryptionType = req.body.data.encryptionType
            const networkPassword = req.body.data.networkPassword
            const hiddenNetwork = req.body.data.hiddenNetwork
            req.body.data = `WIFI:T:${encryptionType || 'WPA'};S:${ssid};P:${networkPassword};H:${hiddenNetwork};`
        }
        next()
    } else {
        res.status(400).json({ error: 'Invalid request: "data" field is required.' })
    }
}

app.get('/', (req, res) => {
    res.send('Qr Genie Server')
})

app.post('/generate', validateType, async (req, res) => {
    try {
        const data = req.body.data
        const qrCode = await qrcode.toDataURL(data, {width: 165})
        res.send({ qrCode })
    }
    catch (error) {
        res.status(500).send({ error: 'Internal server error' })
    }
})

app.get('/countries', async (req, res) => {
    const options = {
        method: 'GET',
        url: process.env.RAPIDAPI_URL,
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.enc.RAPIDAPI_HOST
        }
    }
    try {
        const response = await axios.request(options)
        res.json(response.data)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch countries', details: error.message })
    }
})

app.listen(port, () => {
    console.log('Server listening on port ' + port)
})