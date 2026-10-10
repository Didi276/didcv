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
// découverte dédoublonne avant d'ajouter. Ce fichier lui-même est dédupliqué
// (une seule occurrence par nom, insensible à la casse/aux accents) — fusionné
// avec l'ancien candidats-fr-plus.js, désormais supprimé.
//
// CANDIDATS_GEANT (2137 noms, scripts/candidats-geant.js) est fusionné ici en
// union dédupliquée plutôt que recopié en dur : à cette échelle, un merge
// programmatique reste le seul format maintenable.

import { CANDIDATS_GEANT } from './candidats-geant.js'

const normCandidat = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

const CANDIDATS_BASE = [
  // ─── Fintech / Assurtech ─────────────────────
  'Qonto', 'Swile', 'Spendesk', 'Payfit', 'Pennylane', 'Agicap',
  'Shine', 'Lydia', 'Sunday', 'Swan', 'Memo Bank', 'Treezor',
  'Lemonway', 'Younited', 'October', 'Mansa', 'Defacto', 'Karmen',
  'Silvr', 'Libeo', 'Mooncard', 'Spenddesk', 'Fygr', 'Pigment',
  'Ledger', 'Coinhouse', 'Sorare', 'Alma', 'Joko', 'Lydia Solutions',
  'Descartes Underwriting', 'Shift Technology', 'Alan', 'Luko', 'Lovys', 'Seyna',
  'Akur8', 'Zelros', 'Wakam', '+Simple', 'Finary', 'Yomoni',
  'Nalo', 'Goodvest', 'Ramify', 'Cashbee',

  // ─── SaaS / B2B Tech ─────────────────────────
  'Contentsquare', 'Dataiku', 'Mirakl', 'Algolia', 'Aircall', 'PlayPlay',
  '360Learning', 'OpenClassrooms', 'Lucca', 'Skello', 'Gymlib', 'Partoo',
  'Yousign', 'Klaxoon', 'Gorgias', 'Front', 'iAdvize', 'Botify',
  'Mews', 'Akeneo', 'Doctrine', 'Lifen', 'Malt', 'Comet',
  'Side', 'Brigad', 'Jobandtalent', 'Spleen', 'Leocare', 'Welcome to the Jungle',
  'Spartoo', 'Evaneos', 'Ulysse', 'Getaround', 'Heetch', 'Cityscoot',
  'Zeplug', 'Qovoltis', 'Electra', 'Beev', 'Zenpark', 'Yespark',
  'Cowork', 'Combo', 'Snapshift', 'Javelo', '365Talents', 'Elium',
  'PeopleSpheres', 'Beedeez', 'Edflex', 'Coorpacademy', 'Didask', 'Rydoo',
  'Choco', 'Innovorder', 'Zenchef', 'TheFork',

  // ─── IA / Data / Deeptech ────────────────────
  'Mistral AI', 'Hugging Face', 'Photoroom', 'Dust', 'Nabla', 'Owkin',
  'Poolside', 'Kyutai', 'LightOn', 'Gladia', 'Giskard', 'Golem.ai',
  'Scaleway', 'Clever Cloud', 'Platform.sh', 'OVHcloud', 'Qwant', 'Lumapps',
  'Toucan Toco', 'Forepaas', 'Kameleoon', 'AB Tasty', 'Sqreen', 'GitGuardian',
  'Tehtris', 'Alsid', 'Vade', 'CybelAngel', 'Sekoia', 'HarfangLab',
  'Exotec', 'Verkor', 'Ynsect', 'InnovaFeed', 'NW Groupe', 'Pasqal',
  'Quandela', 'Alice & Bob', 'Lineup', 'Diabeloop',

  // ─── Santé / Biotech / Medtech ───────────────
  'Doctolib', 'Maiia', 'Qare', 'Livi', 'Withings', 'Cardiologs',
  'Implicity', 'Dreem', 'Tilak Healthcare', 'Kelindi', 'Resilience', 'Gleamer',
  'Therapixel', 'Sophia Genetics', 'DNA Script', 'Mnemo Therapeutics', 'Amolyt Pharma',

  // ─── E-commerce / Retail / Consumer ──────────
  'Back Market', 'ManoMano', 'Vestiaire Collective', 'Veepee', 'Cdiscount', 'Ankorstore',
  'Jow', 'La Belle Vie', 'Franprix', 'Monoprix', 'Picard', 'Sézane',
  'Jimmy Fairly', 'Le Slip Français', 'Respire', 'Typology', 'Merci Handy', 'Cabaïa',
  'Asphalte', 'Loom', 'Horace', 'Big Mamma', 'Michel et Augustin', 'La Fourche',
  'Omie & Cie', 'Poiscaille', 'Yuka', 'Phenix', 'Too Good To Go', 'Vinted',
  'Leboncoin', 'SeLoger', 'Meilleurs Agents', 'PriceMinister', 'Showroomprive', 'La Redoute',
  'Smallable',

  // ─── Mobilité / Logistique / Proptech ────────
  'BlaBlaCar', 'Zenride', 'Shippeo', 'Everoad', 'Ovrsea', 'FretLink',
  'Cubyn', 'Stuart', 'Colis Privé', 'Masteos', 'Flatlooker', 'Garantme',
  'Cosi', 'Colonies', 'Habiteo', 'Matera', 'Jestocke', 'Fifteen',
  'Pony', 'Dott',

  // ─── Media / Gaming / Entertainment ──────────
  'Deezer', 'Dailymotion', 'Molotov', 'Believe', 'Gameloft', 'Voodoo',
  'Homa', 'Jellysmack', 'Brut', 'Konbini', 'Loopsider', 'Melty',
  'Ubisoft', 'Dont Nod', 'Shiro Games', 'Sloclap', 'Amplitude Studios', 'Spiders',
  'Asobo Studio', 'Quantic Dream',

  // ─── Services / Conseil / RH ─────────────────
  'Jump', 'Collective', 'HelloWork', 'Jobteaser', 'Yaggo', 'Flatchr',
  'Wavestone', 'Sia Partners', 'Onepoint', 'Ekimetrics', 'Converteo', 'Artefact',
  'Theodo', 'M33', 'Padok', 'BAM', 'Fabernovel', 'Ippon',
  'OCTO Technology', 'Zenika', 'Xebia', 'SFEIR', 'Younup', 'Davidson',

  // ─── Industrie / Énergie / Cleantech ─────────
  'DualSun', 'Sweep', 'Greenly', 'Carbo', 'Plan A', 'Toovalu',
  'Traace', 'Sami', 'Watershed', 'Agriconomie', 'Miimosa', 'Ombrea',
  'Sencrop', 'Weenat', 'Javelot', 'NeoFarm', 'Jungle', 'Agricool',
  'La Ruche qui dit Oui',

  // ─── Edtech / Foodtech / autres ──────────────
  'Powell Software', 'Beekast', 'Wooclap', 'Nomad Education', 'Frichti', 'Nestor',
  'FoodChéri', 'Seazon', 'Kitchn', 'Dayo', 'Not So Dark', 'Taster',
  'Popchef', 'Cheerz', 'Meero', 'Figured',

  // ═══ FUSION depuis candidats-fr-plus.js (dédupliqué) ═══════════════════
  // ─── Fintech / Insurtech / Comptabilité ───
  'Powens', 'Bridge', 'Fintecture', 'SlimPay', 'Payplug', 'Dalenys',
  'Oney', 'Floa', 'Dalma', 'Acheel', 'Orus', 'Stoik',
  'Hero', 'Unlimitd', 'Djust', 'Regate', 'Tiime', 'Indy',
  'Dougs', 'Keobiz', 'Georges', 'Evoliz', 'Axonaut', 'Sellsy',
  'Sumeria', 'Pixpay', 'Kard', 'Bankin', 'Linxo', 'Finfrog',
  'Worklife', 'Benefiz', 'Leeto', 'Betterway', 'Skipr', 'Kwiper',
  'Aria', 'Numeral', 'Upflow',

  // ─── ESN / Conseil / Tech services ───
  'Talan', 'Aubay', 'Astek', 'Alten', 'Hardis', 'Keyrus',
  'Micropole', 'Umanis', 'Viseo', 'Niji', 'Smile', 'Clever Age',
  'Kaliop', 'Sicara', 'Wemanity', 'Cellenza', 'mc2i', 'Rhapsodies Conseil',
  'Devoteam', 'Magellan Partners', 'Eleven', 'Kea', 'Advancy', 'Estin',
  'Square Management', 'Colombus Consulting', 'Julhiet Sterwen', 'Eurogroup', 'Meritis', 'Ekino',
  'Jems', 'Expectra', 'Positive Thinking Company',

  // ─── Deeptech / Hardware / Energie / Spatial ───
  'Cailabs', 'Exotrail', 'Loft Orbital', 'Unseenlabs', 'Kineis', 'Prophesee',
  'Aledia', 'Vulkam', 'Forsee Power', 'Tiamat', 'Lhyfe', 'McPhy',
  'Hysetco', 'Elicit Plant', 'Toopi Organics', 'Afyren', 'Carbios', 'Fairbrics',
  'Gourmey', 'Umiami', 'La Vie', 'Standing Ovation', 'Latitude', 'Scintil',
  'Lynred', 'Diamfab', 'The Exploration Company', 'U-Space', 'Beyond Aero',

  // ─── Santé / Biotech / Medtech (suite) ───
  'Aqemia', 'Iktos', 'Preligens', 'DeepLife', 'Volta Medical', 'Moon Surgical',
  'Robeaute', 'Tissium', 'PKvitality', 'Feetme', 'Lucine', 'Wandercraft',
  'CorWave', 'Carmat', 'Nanobiotix', 'Innate Pharma', 'Valneva', 'Cellectis',
  'Transgene', 'Abivax', 'Inventiva', 'Dracen', 'Abolis', 'Ganymed',
  'Treefrog Therapeutics',

  // ─── E-commerce / Mode / Beauté / Consumer (suite) ───
  'Balzac Paris', 'Sessun', 'Ba&sh', 'Maje', 'Sandro', 'The Kooples',
  'Jott', 'Faguo', '1083', 'Panafrica', 'Veja', 'Caval',
  'Bobbies', 'M.Moustache', 'Rouje', 'Polene', 'Blissim', 'Gemmyo',
  'Courbet', 'Izipizi', 'Nuoo', 'Feed', 'Cuvee Privee', 'Vinovest',
  'Underdog', 'Murfy',

  // ─── Mobilité / Logistique / Proptech (suite) ───
  'Fleet', 'Virtuo', 'Troopy', 'Zoov', 'Tier', 'Vulog',
  'Klaxit', 'Karos', 'Ector', 'OnePark', 'Hosman', 'Homeloop',
  'Pretto', 'Virgil', 'Bricks', 'La Premiere Brique', 'PriceHubble',

  // ─── Media / Gaming / Entertainment (suite) ───
  'Ankama', 'Focus Entertainment', 'Nacon', 'Microids', 'Cyanide', 'Madbox',
  'Darewise', 'Rogue Factor', 'Playsoft', 'Old Skull Games', 'Pathea',

  // ─── Edtech / HRtech / Future of work (suite) ───
  'LiveMentor', 'Edusign', 'AppsCho', 'Studapart', 'Mytraffic', 'Lili.ai',
  'Zei', 'Kiwi.ai', 'Mozza', 'Figgo',

  // ─── AI / Data / Cyber / Dev tools (suite) ───
  'Kili Technology', 'Scortex', 'Deepki', 'Craft AI', 'Hub One', 'Tenacy',
  'Patrowl', 'Egerie', 'Snowpack', 'Ziwit', 'Glimps', 'Pradeo',
  'Yogosha', 'Jolibrain', 'Shadow', 'Continental Data',

  // ─── SaaS divers / Vertical SaaS (suite) ───
  'Ringover', 'Modjo', 'Sarbacane', 'Brevo', 'Spread', 'Legalstart',
  'Captain Contrat', 'Predictice', 'Hyperlex', 'Leto', 'Dastra', 'Witik',
  'Agorapulse', 'Malou',
]

const vusCandidats = new Set()
export const CANDIDATS = [...CANDIDATS_BASE, ...CANDIDATS_GEANT].filter(n => {
  const k = normCandidat(n)
  if (vusCandidats.has(k)) return false
  vusCandidats.add(k)
  return true
})
