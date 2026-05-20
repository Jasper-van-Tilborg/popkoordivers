export interface Bericht {
  id: number;
  slug: string;
  titel: string;
  datum: string;
  categorie: string;
  intro: string;
  inhoud: string;
  afbeelding: string;
}

export const berichten: Bericht[] = [
  {
    id: 1,
    slug: "najaarsconcert-2026-kaartjes",
    titel: "Najaarsconcert 2026 — kaartjes nu te koop",
    datum: "12 oktober 2026",
    categorie: "Concert",
    intro:
      "Op zaterdag 7 november staan we weer op het podium van De Schakel in Gilze. Bestel nu je kaartjes voor een onvergetelijke avond vol popmuziek.",
    inhoud: `Popkoor Divers is er klaar voor. Na maanden repeteren, zwoegen en genieten is het eindelijk zo ver: het najaarsconcert 2026 staat voor de deur. Op zaterdag 7 november openen de deuren van De Schakel in Gilze om 19:30 uur. Het concert begint om 20:00 uur.

Dit jaar heeft dirigent Tom Mordang een gevarieerd programma samengesteld dat oud en jong zal aanspreken. Van nostalgische jaren '80 klassiekers tot hedendaagse hits — er is voor ieder wat wils. De vijf stemgroepen van Divers staan dit seizoen sterker dan ooit, en ook de begeleiding is van hoog niveau.

Kaartjes zijn beschikbaar via onze website en bij de kassa op de avond zelf (onder voorbehoud van beschikbaarheid). We raden aan om op tijd te reserveren, want de zaal is snel vol.

Meer informatie over het programma, de gastoptredens en de locatie volgt binnenkort. Houd onze website en sociale media in de gaten voor updates.`,
    afbeelding: "divers-concert-1",
  },
  {
    id: 2,
    slug: "nieuwe-leden-gezocht",
    titel: "Popkoor Divers zoekt nieuwe stemmen",
    datum: "3 september 2026",
    categorie: "Leden",
    intro:
      "We zijn op zoek naar enthousiaste zangers en zangeressen die ons koor komen versterken. Geen auditie, gewoon een avond meezingen.",
    inhoud: `Popkoor Divers groeit en bloeit — en daar zijn we trots op. Maar we zijn altijd op zoek naar nieuwe gezichten en stemmen die ons koor nog mooier maken.

Of je nu jarenlang in een koor hebt gezongen of gewoon graag zingt onder de douche — je bent van harte welkom om een avond te komen proeven. Er is geen auditie en geen drempel. Gewoon binnenlopen op een dinsdagavond om 20:00 uur bij De Schakel in Gilze.

We hebben momenteel plekken beschikbaar in vrijwel alle stemgroepen: alt, mezzo, sopraan, tenor en bas. Dirigent Tom Mordang zorgt ervoor dat je je snel thuis voelt en de juiste plek vindt.

Wil je weten hoe het er bij ons aan toe gaat? Neem dan contact op via info@popkoordivers.nl of meld je aan via ons contactformulier. We horen graag van je.`,
    afbeelding: "divers-leden-1",
  },
  {
    id: 3,
    slug: "volkoren-festival-middelburg",
    titel: "Divers op VÓLkoren festival in Middelburg",
    datum: "18 juni 2026",
    categorie: "Optreden",
    intro:
      "In juni trok Popkoor Divers naar Middelburg voor het grootste korenfestival van Zeeland. Een dag om nooit te vergeten.",
    inhoud: `Het VÓLkoren festival in Middelburg is een van de meest bijzondere ervaringen die een koor kan meemaken. Tientallen koren, duizenden bezoekers en één ding dat iedereen verbindt: de liefde voor zingen.

Popkoor Divers was dit jaar uitgenodigd als een van de deelnemende koren en we hebben er volop van genoten. De dag begon vroeg — om 9:00 uur vertrokken we vanuit Gilze — maar de energie was al meteen aanwezig. Onderweg zong het halve busje al mee.

Op het festivalterrein was het een drukte van jewelste. We hebben twee sets gespeeld: een om 13:00 uur op het hoofdpodium en een om 16:30 uur op het intieme theaterpodium. Beide optredens werden enthousiast ontvangen door het publiek.

Bijzonder was ook de spontane samenwerking met een koor uit België in de pauze. Gewoon op een bankje, a-capella, twee koren die samen een nummer improviseerden. Dat is de magie van dit soort evenementen.

We kijken nu al uit naar de volgende editie.`,
    afbeelding: "divers-festival-1",
  },
  {
    id: 4,
    slug: "kerstconcert-petruskerk",
    titel: "Kerstconcert in de Petruskerk — sfeervolle avond",
    datum: "21 december 2025",
    categorie: "Concert",
    intro:
      "De Petruskerk in Gilze was de perfecte setting voor ons jaarlijkse kerstconcert. Een warme avond vol muziek en saamhorigheid.",
    inhoud: `Er gaat niets boven zingen in een kerk met kaarslicht. Het kerstconcert van Popkoor Divers in de Petruskerk van Gilze was ook dit jaar weer een avond om in te kaderen.

De kerk zat tot de nok toe vol met vrienden, familie en muziekliefhebbers. Samen met onze pianist en een speciale gastsolist brachten we een programma van klassieke kerstliederen en moderne poparrangementen.

Hoogtepunt van de avond was de gezamenlijke uitvoering van 'Hallelujah' door Leonard Cohen — het publiek in de zaal zong gewoon mee. Spontaan, warm en ontroerend.

Na het concert was er gelegenheid om na te praten bij glühwein en warme chocolademelk. Precies waar december voor is.

Dank aan iedereen die er was en aan de vrijwilligers die alles hebben georganiseerd. Tot volgend jaar!`,
    afbeelding: "divers-kerk-1",
  },
  {
    id: 5,
    slug: "jubileum-zonnebloem-tilburg",
    titel: "Gastoptreden bij jubileum Zonnebloem Tilburg",
    datum: "6 december 2025",
    categorie: "Optreden",
    intro:
      "Uitgenodigd voor het jubileum van Zonnebloem Tilburg — een bijzonder optreden voor een bijzonder publiek in een warme sfeer.",
    inhoud: `Niet elk optreden is hetzelfde, en dat is maar goed ook. Het gastoptreden bij het 40-jarig jubileum van Zonnebloem Tilburg was een van die avonden die je niet snel vergeet.

Zonnebloem is een organisatie die zich inzet voor mensen met een lichamelijke beperking. Het jubileum werd gevierd in een feestzaal in Tilburg, met een publiek dat onze muziek met open armen ontving.

We speelden een set van ongeveer 45 minuten, afgewisseld met korte verhalende stukjes over het koor. De reacties waren overweldigend — er werden tranen gelachen én gehuild, wat ons betreft een teken dat de muziek echt is aangekomen.

Zonnebloem heeft ons na afloop bedankt met een prachtige bos bloemen en een hartelijk applaus dat nog minuten aananhield. Het gevoel dat je met muziek iets kunt betekenen voor mensen — dat is waarom we dit doen.`,
    afbeelding: "divers-zonnebloem-1",
  },
  {
    id: 6,
    slug: "nieuw-seizoen-2026-2027",
    titel: "Nieuw seizoen van start — dit staat op het programma",
    datum: "2 september 2025",
    categorie: "Nieuws",
    intro:
      "Het nieuwe seizoen is begonnen en de agenda is gevuld. Een overzicht van wat Popkoor Divers het komende jaar op de planning heeft staan.",
    inhoud: `Na de zomerstop zijn we weer fris en fruitig van start gegaan. Dinsdagavond was de eerste repetitie van het nieuwe seizoen, en het enthousiasme was om te snijden.

Dirigent Tom Mordang heeft het programma voor het komende jaar al grotendeels uitgestippeld. We werken toe naar het najaarsconcert in november, een kerstoptreden in december en — als alles goed gaat — een deelname aan een korenfestival in het voorjaar.

Nieuw dit seizoen is de uitbreiding van de tenorgroep. We hebben drie nieuwe mannen kunnen verwelkomen die het koor een rijkere klank geven. Ook is er een nieuwe pianiste die ons begeleid naast de vaste band.

De sfeer in De Schakel was op de eerste avond meteen al goed. Nieuwe gezichten, vertrouwde stemmen en de gedeelde passie voor popmuziek — dat is Divers.

Ben je benieuwd en wil je een keer meeproeven? Kom gewoon langs op een dinsdagavond. Je bent altijd welkom.`,
    afbeelding: "divers-seizoen-1",
  },
];
