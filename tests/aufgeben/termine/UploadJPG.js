
/**
 * Test File: UploadJPG.js
 * @Description Tests upload JPG files for Aufgeben Termine
 * Usage: node UploadJPG.js
 * npm packages required:
 *  - request
 *  - fs
 */

const request = require('request');
const fs = require('fs')

var data = {
    vorname: "Alex",
    nachname: "Barba",
    firma: "Alex Barba",
    vorwahl: "36747",
    telefonnummer: "640915983",
    email: "alexbarbasly@hotmail.com",
    kunde_typ: "Veranstalter",
    titel: "Test JPG",
    form_privacy: "true",
    form_terms: "true",
    kuzebeschreibung: "",
    beginn: "12:12",
    austellungen_start: "",
    ausstellungen_end: "",
    ausstellungen_schedule: "",
    veranstaltungsort: "MIX Verlags-GmbH",
    region: "Bremen",
    ausstellungen_opening_hours: "",
    strasse: "Goebenstr. 14",
    plz: "08330",
    ort: "Bremen",
    ver_vorwahl: "0421",
    ver_telefonnummer: "6964340",
    homepage: "www.mix-online.de",
    ver_email: "verlag@mix-online.de",
    nachricht: "null",
    image: "ja",
    text: "ja",
    copyright: "true",
    kunde_kto_inhaber: "Alex",
    kunde_kto_inhaber2: "Barba",
    kunde_kto_firma: "AlexBarba",
    kunde_kto_strasse: "Jacinto Verdaguer, 91",
    kunde_kto_plz: "08330",
    kunde_kto_ort: "Premia de Mar",
    rechnung: "Nein",
    zahlung_per: "lastschrift",
    kontoinhaber: "Alex Barba Perez",
    iban: "DE44 4444 4444 4444 4444 44",
    rubrik: "Hits für Kids",
    datum: "21.11.2019",
    ver_email: "verlag@mix-online.de",
    item_name: "1 Abrechnungseinheit(en) x 5 Euro x 1 Tag(e) = 5,- Euro brutto",
    item_amount: "5",
    image_file_0: fs.createReadStream(__dirname + '/image.jpg')
};


request.post({
    url: 'https://mix.amvara.de/v1/data/aufgeben/termine/get_form.php',
    formData: data
}, function (error, response, body) {
  console.error('error:', error);
  console.log('statusCode:', response && response.statusCode);
  console.log('body:', body);
});