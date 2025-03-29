const express = require('express')
const dotenv = require('dotenv')
const qrcode = require('qrcode')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(express.json())
dotenv.config()
const port = process.env.PORT || 3000

app.use(cors())

const validateType = (req, res, next) => {
    if (req.body.data) {
        if (req.body.data.url || req.body.data.text) {
            req.body.data = req.body.data.url || req.body.data.text
        }
        else if (req.body.data.ssid && req.body.data.encryptionType) {
            const ssid = req.body.data.ssid
            const encryptionType = req.body.data.encryptionType
            const networkPassword = req.body.data.networkPassword
            const hiddenNetwork = req.body.data.hiddenNetwork
            req.body.data = `WIFI:T:${encryptionType || 'WPA'};S:${ssid};P:${networkPassword};H:${hiddenNetwork};`
        }
        else if (req.body.data.name && (req.body.data.phone || req.body.data.email)) {
            const { name, phone, email, organization, position, website, street, city, state, zip, country } = req.body.data;
            let vCard = "BEGIN:VCARD\r\n"
            let addressParts = []
            vCard += "VERSION:3.0\r\n"
            vCard += `N:${name}\r\n`
            if (phone) vCard += `TEL:${phone}\r\n`
            if (email) vCard += `EMAIL:${email}\r\n`
            if (organization) vCard += `ORG:${organization}\r\n`
            if (position) vCard += `TITLE:${position}\r\n`
            if (website) vCard += `URL:${website}\r\n`
            if (street) addressParts.push(street)
            if (city) addressParts.push(city)
            if (state) addressParts.push(state)
            if (zip) addressParts.push(zip)
            if (country) addressParts.push(country)
            if (addressParts.length > 0) {
                vCard += `ADR;TYPE=WORK:;${addressParts.join(';')}\r\n`
            }
            vCard += "END:VCARD"
            req.body.data = vCard
            console.log(req.body.data)
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
        const qrCode = await qrcode.toDataURL(data, { width: 165 })
        res.send({ qrCode })
    }
    catch (error) {
        res.status(500).send({ error: 'Internal server error' })
    }
})

app.get('/countries', async (req, res) => {
    try {
        const response = await axios.get(process.env.COUNTRIES_API_URL)
        const countryNames = response.data.map(country => country.name.common)
        res.json(countryNames)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch countries', details: error.message })
    }
})

app.listen(port, () => {
    console.log('Server listening on port ' + port)
})