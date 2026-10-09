// candidats-fr.js
// Liste de candidats pour le script de découverte d'entreprises (scripts/discover-companies.js).
// Ce sont des NOMS d'entreprises françaises. Le script de découverte devine leur
// identifiant (slug) sur chaque ATS, interroge les APIs publiques, et ne garde que
// celles qui renvoient réellement des offres en France.
//
// Accent mis sur l'écosystème French Tech (startups / scaleups), car c'est là que
// la découverte automatique fonctionne le mieux : sur Greenhouse, Lever, Ashby,
// Workable et Recruitee, le slug est presque toujours le nom normalisé de la boîte.
// Les très grands groupes (LVMH, Sanofi…) ont souvent des slugs non devinables
// (SmartRecruiters/Workday) : mieux vaut les ajouter à la main avec le bon slug,
// ils sont déjà en grande partie dans entreprisesData.js.
//
// Les doublons avec entreprisesData.js ne sont pas un problème : le script de
// découverte dédoublonne avant d'ajouter.

export const CANDIDATS = [
  // ─── Fintech / Assurtech ───────────────────────────────
  'Qonto', 'Swile', 'Spendesk', 'Payfit', 'Pennylane', 'Agicap', 'Shine',
  'Lydia', 'Sunday', 'Swan', 'Memo Bank', 'Treezor', 'Lemonway', 'Younited',
  'October', 'Mansa', 'Defacto', 'Karmen', 'Silvr', 'Libeo', 'Mooncard',
  'Spenddesk', 'Fygr', 'Pigment', 'Ledger', 'Coinhouse', 'Sorare',
  'Alma', 'Joko', 'Lydia Solutions', 'Descartes Underwriting', 'Shift Technology',
  'Alan', 'Luko', 'Lovys', 'Seyna', 'Akur8', 'Zelros', 'Wakam', '+Simple',
  'Finary', 'Yomoni', 'Nalo', 'Goodvest', 'Ramify', 'Cashbee',

  // ─── SaaS / B2B Tech ───────────────────────────────────
  'Contentsquare', 'Dataiku', 'Mirakl', 'Algolia', 'Aircall', 'PlayPlay',
  '360Learning', 'OpenClassrooms', 'Lucca', 'Skello', 'Gymlib', 'Partoo',
  'Yousign', 'Klaxoon', 'Gorgias', 'Front', 'Spendesk', 'iAdvize', 'Botify',
  'Mews', 'Akeneo', 'Doctrine', 'Lifen', 'Malt', 'Comet', 'Side', 'Brigad',
  'Jobandtalent', 'PlayPlay', 'Spleen', 'Swile', 'Leocare', 'Welcome to the Jungle',
  'Spartoo', 'Evaneos', 'Ulysse', 'Getaround', 'Heetch', 'Cityscoot', 'Zeplug',
  'Qovoltis', 'Electra', 'Beev', 'Zenpark', 'Yespark', 'Cowork',
  'Spendesk', 'Pennylane', 'Combo', 'Snapshift', 'Javelo', '365Talents',
  'Elium', 'PeopleSpheres', 'Beedeez', 'Edflex', 'Coorpacademy', 'Didask',
  'Rydoo', 'Sunday', 'Choco', 'Innovorder', 'Zenchef', 'TheFork',

  // ─── IA / Data / Deeptech ──────────────────────────────
  'Mistral AI', 'Hugging Face', 'Photoroom', 'Dust', 'Nabla', 'Owkin',
  'Poolside', 'Kyutai', 'LightOn', 'Gladia', 'Giskard', 'Golem.ai',
  'Shift Technology', 'Scaleway', 'Clever Cloud', 'Platform.sh', 'OVHcloud',
  'Qwant', 'Lumapps', 'Toucan Toco', 'Forepaas', 'Kameleoon', 'AB Tasty',
  'Sqreen', 'GitGuardian', 'Tehtris', 'Alsid', 'Vade', 'CybelAngel',
  'Sekoia', 'HarfangLab', 'Ledger', 'Exotec', 'Verkor', 'Ynsect', 'InnovaFeed',
  'NW Groupe', 'Pasqal', 'Quandela', 'Alice & Bob', 'Lineup', 'Diabeloop',

  // ─── Santé / Biotech / Medtech ─────────────────────────
  'Doctolib', 'Alan', 'Maiia', 'Qare', 'Livi', 'Withings', 'Cardiologs',
  'Implicity', 'Lifen', 'Nabla', 'Owkin', 'Dreem', 'Tilak Healthcare',
  'Kelindi', 'Resilience', 'Gleamer', 'Therapixel', 'Sophia Genetics',
  'DNA Script', 'Diabeloop', 'Mnemo Therapeutics', 'Amolyt Pharma',

  // ─── E-commerce / Retail / Consumer ────────────────────
  'Back Market', 'ManoMano', 'Vestiaire Collective', 'Veepee', 'Cdiscount',
  'Ankorstore', 'Jow', 'La Belle Vie', 'Franprix', 'Monoprix', 'Picard',
  'Sézane', 'Jimmy Fairly', 'Le Slip Français', 'Respire', 'Typology',
  'Merci Handy', 'Cabaïa', 'Asphalte', 'Loom', 'Horace', 'Big Mamma',
  'Michel et Augustin', 'La Fourche', 'Omie & Cie', 'Poiscaille', 'Yuka',
  'Phenix', 'Too Good To Go', 'Vinted', 'Leboncoin', 'SeLoger', 'Meilleurs Agents',
  'PriceMinister', 'Spartoo', 'Showroomprive', 'La Redoute', 'Smallable',

  // ─── Mobilité / Logistique / Proptech ──────────────────
  'BlaBlaCar', 'Getaround', 'Heetch', 'Cityscoot', 'Zenride', 'Shippeo',
  'Everoad', 'Ovrsea', 'FretLink', 'Cubyn', 'Stuart', 'Colis Privé',
  'Luko', 'Masteos', 'Flatlooker', 'Garantme', 'Cosi', 'Colonies', 'Habiteo',
  'Matera', 'Jestocke', 'Yespark', 'Cityscoot', 'Fifteen', 'Pony', 'Dott',

  // ─── Media / Gaming / Entertainment ────────────────────
  'Deezer', 'Dailymotion', 'Molotov', 'Believe', 'Gameloft', 'Voodoo',
  'Homa', 'Jellysmack', 'Brut', 'Konbini', 'Loopsider', 'Melty', 'Sorare',
  'Ubisoft', 'Dont Nod', 'Shiro Games', 'Sloclap', 'Amplitude Studios',
  'Spiders', 'Asobo Studio', 'Quantic Dream', 'Dontnod',

  // ─── Services / Conseil / RH ───────────────────────────
  'Malt', 'Comet', 'Side', 'Brigad', 'Jump', 'Collective', 'Shine',
  'Welcome to the Jungle', 'HelloWork', 'Jobteaser', 'Yaggo', 'Flatchr',
  'Wavestone', 'Sia Partners', 'Onepoint', 'Ekimetrics', 'Converteo',
  'Artefact', 'Theodo', 'M33', 'Padok', 'BAM', 'Fabernovel', 'Ippon',
  'OCTO Technology', 'Zenika', 'Xebia', 'SFEIR', 'Younup', 'Davidson',

  // ─── Industrie / Énergie / Cleantech ───────────────────
  'Verkor', 'Electra', 'Qovoltis', 'Beev', 'Zeplug', 'DualSun', 'Sweep',
  'Greenly', 'Carbo', 'Plan A', 'Toovalu', 'Traace', 'Sami', 'Watershed',
  'Ÿnsect', 'InnovaFeed', 'Agriconomie', 'Miimosa', 'Ombrea', 'Sencrop',
  'Weenat', 'Javelot', 'NeoFarm', 'Jungle', 'Agricool', 'La Ruche qui dit Oui',

  // ─── Edtech / Foodtech / autres ────────────────────────
  'OpenClassrooms', '360Learning', 'Edflex', 'Coorpacademy', 'Didask',
  'Powell Software', 'Klaxoon', 'Beekast', 'Wooclap', 'Nomad Education',
  'Frichti', 'Nestor', 'FoodChéri', 'Seazon', 'Kitchn', 'Dayo', 'Not So Dark',
  'Taster', 'Popchef', 'Cheerz', 'Meero', 'PhotoRoom', 'Figured',
]
