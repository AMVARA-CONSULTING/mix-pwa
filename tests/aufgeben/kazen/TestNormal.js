
/**
 * Test File: TestNormal.js
 * @Description Tests Kazen form for Aufgeben kazen
 * Usage: node TestNormal.js
 * npm packages required:
 *  - request
 * 
 * FIXME: Gives error on submit
 * 
 */

const request = require('request');

var data = {
    text: "Test AnzeigenText",
    typ_general: "Privat",
    typ_style: "Normal",
    rubriken_kat: "Fernweh,Neue Heimat",
    rubriken_mit: "",
    chiffre: "true",
    chiffre_answer: "Per Post",
    chiffre_mail: "",
    anrede: "Frau",
    vorname: "Alex",
    nachname: "Barba",
    firma: "AlexBarba",
    telefon: "45674747",
    vorwahl: "36747",
    fax: "",
    email: "alexbarbasly@hotmail.com",
    strasse: "Jacinto Verdaguer, 91",
    plz: "08330",
    ort: "Premia de Mar",
    iban: "DE44 4444 4444 4444 4444 44",
    kto_inhaber: "Alex Barba Perez",
    rechnung: "Nein",
    nachricht: "Nachricht text",
    zahlung: "Lastschrift",
    privacy_form: "true",
    terms_form: "true",
    monat: "Jan,Feb",
    rubriken_list: "Fernweh,Neue Heimat",
    chiffre_ja_nein: "true",
    rechnung: "Nein",
    zeichen: "17",
    zeilen: "1",
    anzmon: "2",
    anzrub: "2",
    chiffre: "10",
    summe: "30",
    abbuchung: "Der Kleinanzeigenannahmeschluss für das JUNI-MIX ist beendet. Jetzt noch aufgegebene Anzeigen nur unter Vorbehalt! – 24.05.2018",
    user: "mix",
    item_name: "17 Zeichen = 1 Einheit(en) x 2 Monat(e) x 2 Rubrik(en) x 5,- Euro = 20,- € Brutto    Chiffregeb. 10,- € (automatisch bei Kontaktanzeigen) = Summe 30,- € Brutto ",
    item_amount: "30"
};


request.post({
    url: 'https://mix.amvara.de/v1/data/aufgeben/kaz_auf/get_kazen_form.php',
    formData: data
}, function (error, response, body) {
  console.error('error:', error);
  console.log('statusCode:', response && response.statusCode);
  console.log('body:', body);
});