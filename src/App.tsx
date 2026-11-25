import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Answer = [string, number, string?];
type Question = { p: string; a: Answer[] };
type Tier = { min: number; name: string; pts: number; color: string; ico: string };
type RoundResult = { q: Question; text: string; hit: Answer | null; tier: Tier | null; pts: number };
type Screen = "menu" | "play" | "reveal" | "end";

/* Kérdések: [megjelenített név, gyakoriság %, alternatív írásmódok (| jellel)] */
const Q: Question[] = [
    {"p":"Nevezz meg egy európai fővárost!","a":[["Párizs",14,"paris"],["London",12],["Berlin",11],["Róma",10,"roma|rome"],["Madrid",9],["Budapest",8],["Bécs",6,"becs|wien|vienna"],["Prága",5,"praga|prague"],["Athén",4,"athen|athens"],["Lisszabon",4,"lisbon"],["Varsó",3,"varso|warsaw"],["Amszterdam",3],["Brüsszel",2.5,"brussel|brussels"],["Dublin",2],["Helsinki",1.5],["Oslo",1.5],["Stockholm",1.5],["Koppenhága",1.2,"koppenhaga|copenhagen"],["Zágráb",1,"zagrab|zagreb"],["Pozsony",1,"bratislava"],["Belgrád",0.8,"belgrad|belgrade"],["Bukarest",0.7,"bucharest"],["Reykjavík",0.6,"reykjavik"],["Valletta",0.2],["Andorra la Vella",0.1,"andorra"],["Vaduz",0.1],["Moszkva",3,"moscow"],["Kijev",1.2,"kiev"],["Bern",1,"berne"],["Tallinn",1.2],["Riga",1.2],["Vilnius",1.2],["Szófia",0.9,"sofia"],["Ljubljana",0.9],["Szarajevó",0.7,"sarajevo"],["Tirana",0.5],["Skopje",0.5],["Minszk",0.5,"minsk"],["Luxembourg",0.5],["Podgorica",0.3],["Pristina",0.3],["Chisinau",0.3,"kisinyov"],["Nicosia",0.3,"nikozia"],["Vatikánváros",0.3,"vatikan"],["Monaco",0.2],["San Marino",0.15]]},
    {"p":"Nevezz meg egy gyümölcsöt, ami piros is lehet!","a":[["Alma",22],["Eper",18],["Cseresznye",12],["Meggy",7],["Málna",7,"malna"],["Görögdinnye",6,"gorogdinnye|dinnye"],["Ribizli",5],["Paradicsom",4],["Gránátalma",4,"granatalma"],["Vörös áfonya",1.5,"piros afonya|vörös áfonya"],["Licsi",1],["Csipkebogyó",0.8,"csipkebogyo"],["Sárkánygyümölcs",0.8,"sarkanygyumolcs|pitaja"],["Som",0.6],["Goji",0.5,"goji bogyo"],["Kaktuszfüge",0.3,"kaktuszfuge"],["Berkenye",0.2],["Szamóca",1.5],["Piros szőlő",1.2],["Mangó",1],["Őszibarack",1],["Vérnarancs",1,"piros narancs"],["Piros grapefruit",0.7,"grapefruit"],["Piros körte",0.8],["Papaya",0.4],["Galagonya",0.5],["Cseresznyeszilva",0.5],["Rambutan",0.3],["Piros banán",0.3],["Madárbirs",0.3],["Tamarillo",0.15],["Vörös ribizli",0.8,"piros ribizli"],["Barack",0.8,"kajszi|kajszibarack"],["Cseresznyeparadicsom",0.4]]},
    {"p":"Nevezz meg egy hangszert!","a":[["Gitár",20,"gitar"],["Zongora",18],["Dob",10],["Hegedű",9,"hegedu"],["Fuvola",7],["Trombita",5],["Szaxofon",4],["Cselló",4,"csello"],["Klarinét",3,"klarinet"],["Basszusgitár",3,"basszusgitar|basszus"],["Hárfa",2.5,"harfa"],["Harmonika",2],["Orgona",2],["Furulya",1.5],["Citera",1.5],["Cimbalom",1.2],["Tuba",1],["Oboa",0.9],["Duda",0.8],["Tárogató",0.4,"tarogato"],["Okarina",0.3],["Tekerőlant",0.15,"tekerolant"],["Teremin",0.1,"theremin"],["Üvegharmonika",0.05,"uvegharmonika"],["Ukulele",0.8],["Mandolin",0.7],["Szintetizátor",2,"szinti"],["Xilofon",1,"xylofon"],["Cintányér",1.2,"cinel"],["Triangulum",1.2],["Kürt",1.2],["Harsona",1.2,"pozan"],["Fagott",0.8],["Bendzsó",0.6,"banjo"],["Szitár",0.3,"sitar"],["Gong",0.8],["Tamburin",1,"csorgodob"],["Marimba",0.4],["Kalimba",0.3],["Didzseridu",0.5],["Pánsíp",0.5],["Lant",0.6],["Koboz",0.4],["Cajón",0.2],["Bongó",0.4],["Dobfelszerelés",1,"dobszerko"],["Brácsa",1.2,"viola"],["Nagybőgő",1.5,"bogo"],["Elektromos gitár",2,"e-gitar|elektromos"],["Akusztikus gitár",1],["Szájharmonika",2],["Piccolo",0.5],["Angolkürt",0.2],["Harmónium",0.3],["Billentyű",0.5,"keyboard|billentyus"]]},
    {"p":"Nevezz meg egy tengeri élőlényt!","a":[["Cápa",18,"capa"],["Delfin",15],["Bálna",12,"balna"],["Rák",8,"rak"],["Polip",8],["Medúza",7,"meduza"],["Tengeri csillag",5],["Tintahal",4],["Tengeri teknős",4,"teknos|teknőc"],["Kagyló",3,"kagylo"],["Rája",2.5,"raja"],["Fóka",2,"foka"],["Homár",2,"homar"],["Angolna",1.5],["Korall",1.5],["Tengeri csikó",1.5,"tengeri csiko|csikohal"],["Krill",1.2],["Rozmár",1.2,"rozmar"],["Moréna",0.8,"morena"],["Szivacs",0.8],["Narvál",0.5,"narval"],["Ördöghal",0.4,"ordoghal"],["Tengeri uborka",0.4],["Nautilusz",0.3],["Lámpáshal",0.2,"lampashal"],["Tonhal",2],["Lazac",1.5],["Hering",1],["Kardhal",1],["Barrakuda",0.4],["Tengeri sün",1.5],["Garnélarák",2,"garnela"],["Languszta",0.8],["Fésűkagyló",0.4],["Osztriga",1.5],["Kalmár",1.2],["Szépia",0.6,"sepia"],["Cetcápa",0.5],["Óriáspolip",0.3],["Manta",1.2,"mantaraja"],["Pörölycápa",0.6],["Bohóchal",2,"nemo"],["Papagájhal",0.5],["Orka",2,"kardszarnyu delfin"],["Manátusz",0.5,"tengeri tehen"],["Tengeri vidra",0.6],["Tengeri csiga",0.5],["Hínár",0.3],["Plankton",1.2],["Tengeri kígyó",0.5]]},
    {"p":"Nevezz meg egy magyar várost!","a":[["Budapest",20],["Debrecen",12],["Szeged",9],["Pécs",8,"pecs"],["Győr",7,"gyor"],["Miskolc",6],["Eger",5],["Sopron",3],["Székesfehérvár",3,"szekesfehervar"],["Kecskemét",2.5,"kecskemet"],["Veszprém",2.5,"veszprem"],["Szombathely",2],["Nyíregyháza",2,"nyiregyhaza"],["Esztergom",1.5],["Szolnok",1.5],["Zalaegerszeg",1.5],["Siófok",1.5,"siofok"],["Békéscsaba",1,"bekescsaba"],["Tokaj",1.2],["Hódmezővásárhely",0.8,"hodmezovasarhely"],["Gyula",0.8],["Kalocsa",0.5],["Mohács",0.5,"mohacs"],["Sárospatak",0.4,"sarospatak"],["Tata",0.4],["Pannonhalma",0.2],["Hollókő",0.1,"hollokő|hollokõ"],["Szekszárd",1],["Kaposvár",1.2],["Nagykanizsa",0.8],["Dunaújváros",1],["Érd",1.2],["Tatabánya",1.2],["Salgótarján",0.8],["Balatonfüred",0.8],["Keszthely",1.2],["Hajdúszoboszló",1.5],["Gödöllő",0.8],["Szentendre",1],["Visegrád",0.8],["Vác",0.8],["Baja",0.6],["Orosháza",0.4],["Makó",0.4],["Szarvas",0.4],["Jászberény",0.4],["Gyöngyös",0.8],["Mosonmagyaróvár",0.4],["Kőszeg",0.6],["Pápa",0.6],["Ajka",0.3],["Paks",1],["Dombóvár",0.2],["Mezőkövesd",0.4],["Tiszaújváros",0.3],["Ózd",0.5],["Cegléd",0.6],["Szentes",0.3],["Kisvárda",0.3],["Hajdúböszörmény",0.8],["Hajdúnánás",0.2],["Berettyóújfalu",0.2],["Komló",0.3],["Siklós",0.2],["Villány",0.5]]},
    {"p":"Nevezz meg egy elemet a periódusos rendszerből!","a":[["Oxigén",15,"oxigen"],["Hidrogén",14,"hidrogen"],["Szén",10,"szen"],["Vas",9],["Arany",8],["Nitrogén",6,"nitrogen"],["Hélium",6,"helium"],["Ezüst",4,"ezust"],["Réz",3,"rez"],["Urán",3,"uran"],["Nátrium",2.5,"natrium"],["Klór",2,"klor"],["Kalcium",2],["Higany",2],["Ólom",2,"olom"],["Neon",1.5],["Cink",1.2],["Platina",1],["Kén",1,"ken"],["Foszfor",1],["Szilícium",1,"szilicium"],["Bór",0.5,"bor"],["Gallium",0.4],["Bizmut",0.3],["Ozmium",0.1],["Lantán",0.1,"lantan"],["Lítium",2.2],["Magnézium",2],["Alumínium",3.5],["Titán",1.5],["Króm",1.2],["Nikkel",1.2],["Kobalt",1],["Mangán",0.7],["Jód",1.2],["Fluor",1],["Bróm",0.6],["Argon",1.2],["Kripton",0.8],["Xenon",0.8],["Radon",1],["Rádium",0.8],["Plutónium",1.2],["Kálium",1.8],["Arzén",0.8],["Ón",1],["Volfrám",0.8,"wolfram"],["Palládium",0.4],["Berillium",0.5],["Bárium",0.5],["Stroncium",0.4],["Cézium",0.4],["Rubídium",0.2],["Antimon",0.4],["Tallium",0.3],["Kadmium",0.5],["Szelén",0.4],["Tellúr",0.2],["Germánium",0.2],["Cirkónium",0.2],["Molibdén",0.3],["Vanádium",0.3],["Neodímium",0.2],["Európium",0.1],["Oganesszon",0.02],["Einsteinium",0.03],["Kalifornium",0.03],["Hafnium",0.05],["Tantál",0.1],["Irídium",0.2],["Ródium",0.1],["Rénium",0.05],["Technécium",0.1],["Prométium",0.05],["Nobélium",0.03]]},
    {"p":"Nevezz meg egy zöldséget!","a":[["Répa",12,"sargarepa|sárgarépa|repa"],["Paradicsom",11],["Burgonya",10,"krumpli"],["Uborka",9],["Paprika",9],["Hagyma",8,"voroshagyma|vöröshagyma"],["Brokkoli",5],["Káposzta",4,"kaposzta"],["Cukkini",3.5],["Karfiol",3],["Spenót",3,"spenot"],["Padlizsán",2,"padlizsan"],["Fokhagyma",2],["Zeller",1.5],["Kukorica",1.5],["Borsó",1.5,"borso|zoldborso"],["Retek",1.2],["Sütőtök",1.2,"sutotok|toktok"],["Spárga",1,"sparga"],["Karalábé",0.8,"karalabe"],["Kelkáposzta",0.8,"kelkaposzta"],["Cékla",0.8,"cekla"],["Édesburgonya",0.7,"edesburgonya"],["Kelbimbó",0.6,"kelbimbo"],["Pasztinák",0.5,"pasztinak"],["Articsóka",0.4,"articsoka"],["Mángold",0.4,"mangold"],["Torma",0.3],["Rebarbara",0.1],["Édeskömény",0.5],["Póréhagyma",1.5,"poreh"],["Zöldbab",1.8,"bab"],["Csicseriborsó",0.4,"csicseri"],["Saláta",3],["Rukkola",0.8],["Kínai kel",0.5],["Pak choi",0.2],["Újhagyma",1],["Fehérrépa",0.5],["Petrezselyemgyökér",0.6,"petrezselyem"],["Patisszon",0.3],["Gomba",1.5],["Okra",0.3],["Csicsóka",0.3,"topinambur"],["Lilahagyma",0.5],["Mogyoróhagyma",0.3],["Cukorborsó",0.3],["Szójabab",0.2],["Daikon",0.15,"kinai retek"],["Vöröskáposzta",1],["Romanesco",0.15],["Chili",1,"csipos paprika"],["Pritaminpaprika",1.2,"pritamin"],["Tök",2]]},
    {"p":"Nevezz meg egy sportágat!","a":[["Foci",25,"labdarugas|futball"],["Kosárlabda",10,"kosarlabda|kosar"],["Tenisz",9],["Úszás",8,"uszas"],["Kézilabda",6,"kezilabda"],["Röplabda",5,"roplabda"],["Atlétika",4,"atletika|futas"],["Jégkorong",4,"jegkorong|hoki"],["Vízilabda",3.5,"vizilabda"],["Torna",3],["Kerékpározás",2.5,"kerekparozas|biciklizes"],["Vívás",2,"vivas"],["Birkózás",1.8,"birkozas"],["Íjászat",1.5,"ijaszat"],["Golf",1.5],["Rögbi",1.5,"rogbi"],["Lovaglás",1.2,"lovaglas"],["Curling",0.9],["Cselgáncs",0.8,"cselgancs|judo"],["Kajak-kenu",0.8,"kajak|kenu"],["Krikett",0.7,"cricket"],["Sziklamászás",0.6,"sziklamaszas"],["Modern ötpróba",0.4,"otproba|pentatlon"],["Skeleton",0.15],["Sepak takraw",0.05],["Triatlon",1],["Maratoni futás",0.6,"maraton"],["Sífutás",0.6],["Műkorcsolya",1],["Gyorskorcsolya",0.5],["Síugrás",0.6],["Snowboard",0.8],["Alpesi síelés",1.2,"sizes|sielés"],["Szörfözés",0.8,"szorf"],["Vitorlázás",0.8],["Evezés",1],["Ökölvívás",1.8,"boksz"],["Karate",1.2],["Taekwondo",1],["Asztalitenisz",2,"ping-pong|pingpong"],["Tollaslabda",1.5,"tollas"],["Squash",0.5],["Baseball",0.8],["Amerikai futball",0.8],["Softball",0.2],["Bowling",0.6],["Darts",0.4],["Biliárd",0.4],["Snooker",0.3],["Súlyemelés",1.2],["Gyaloglás",0.3],["Rúdugrás",0.4],["Magasugrás",0.3],["Távolugrás",0.3],["Gerelyhajítás",0.4],["Diszkoszvetés",0.4],["Kalapácsvetés",0.3],["Műugrás",0.4],["Szinkronúszás",0.3],["Ritmikus gimnasztika",0.5,"ritmikus"],["Parkour",0.2],["Gyephoki",0.5],["Sakk",0.5],["E-sport",0.2]]},
    {"p":"Nevezz meg egy színt!","a":[["Piros",20],["Kék",18,"kek"],["Zöld",16,"zold"],["Sárga",10,"sarga"],["Fekete",6],["Fehér",5,"feher"],["Narancs",5,"narancssarga"],["Lila",4],["Rózsaszín",3,"rozsaszin"],["Barna",3],["Szürke",2.5,"szurke"],["Vörös",1.5,"voros"],["Türkiz",1.5,"turkiz"],["Bordó",1.2,"bordo"],["Ibolya",1.2],["Arany",0.8],["Indigó",0.6,"indigo"],["Okker",0.4],["Bíbor",0.4,"bibor"],["Cián",0.3,"cian|cyan"],["Magenta",0.3],["Karmazsin",0.2],["Azúr",0.2,"azur"],["Világoskék",1.5],["Sötétkék",1.5],["Világoszöld",0.8],["Sötétzöld",0.8],["Citromsárga",0.8],["Mályva",0.5],["Levendula",0.4],["Smaragdzöld",0.5,"smaragd"],["Rubinvörös",0.2,"rubin"],["Korall",0.3],["Bézs",1],["Krémszín",0.3,"krem"],["Khaki",0.3],["Olívazöld",0.4,"oliva"],["Mentazöld",0.2,"menta"],["Tengerkék",0.3],["Égszínkék",0.5],["Ciklámen",0.2],["Pink",1.5],["Fukszia",0.2],["Ezüst",1],["Terrakotta",0.2],["Mahagóni",0.1],["Homok",0.15],["Mustár",0.2,"mustarsarga"],["Kobaltkék",0.2],["Zafírkék",0.1],["Mélykék",0.1]]},
    {"p":"Nevezz meg egy afrikai országot!","a":[["Egyiptom",16],["Dél-Afrika",12],["Nigéria",8,"nigeria"],["Kenya",8],["Marokkó",7,"marokko"],["Etiópia",5,"etiopia"],["Ghána",4,"ghana"],["Tunézia",4,"tunezia"],["Algéria",3.5,"algeria"],["Tanzánia",3,"tanzania"],["Szenegál",2.5,"szenegal"],["Uganda",2],["Kamerun",1.8],["Madagaszkár",1.8,"madagaszkar"],["Szomália",1.2,"szomalia"],["Namíbia",1.2,"namibia"],["Zimbabwe",1],["Botswana",0.8],["Mali",0.7],["Eritrea",0.4],["Szváziföld",0.3,"eswatini|svazifold"],["Dzsibuti",0.2],["Comore-szigetek",0.1,"comore"],["Angola",1.2],["Mozambik",1.2],["Zambia",1],["Malawi",0.6],["Ruanda",1],["Burundi",0.4],["Szudán",1.8],["Dél-Szudán",0.5],["Líbia",1.5],["Csád",0.6],["Niger",0.5],["Burkina Faso",0.4],["Elefántcsontpart",1.8],["Libéria",0.5],["Sierra Leone",0.5],["Guinea",0.5],["Gambia",0.4],["Zöld-foki Köztársaság",0.2,"zold-foki szigetek"],["Mauritánia",0.5],["Benin",0.3],["Togo",0.3],["Gabon",0.4],["Kongó",1.2,"kongoi koztarsasag"],["Kongói Demokratikus Köztársaság",0.8,"kongoi demokratikus"],["Közép-afrikai Köztársaság",0.3],["Egyenlítői-Guinea",0.2],["Lesotho",0.4],["Mauritius",0.4],["Seychelle-szigetek",0.3,"seychelles"],["Bissau-Guinea",0.1,"guinea-bissau"]]},
    {"p":"Nevezz meg egy madarat!","a":[["Sas",12],["Veréb",11,"vereb"],["Galamb",10],["Varjú",8,"varju"],["Fecske",7],["Papagáj",6,"papagaj"],["Bagoly",6],["Gólya",5,"golya"],["Holló",5,"hollo"],["Szarka",4],["Pingvin",4],["Kolibri",3],["Sólyom",3,"solyom"],["Strucc",3],["Flamingó",2.5,"flamingo"],["Cinege",2],["Rigó",2,"rigo"],["Páva",1.8,"pava"],["Harkály",1.5,"harkaly"],["Pelikán",1.5,"pelikan"],["Daru",1.5],["Kakukk",1.5],["Tukán",1,"tukan"],["Albatrosz",1],["Kiwi",0.9],["Búbosbanka",0.8,"bubosbanka"],["Emu",0.7],["Kormorán",0.6,"kormoran"],["Kakapó",0.1,"kakapo"],["Fácán",1.5],["Fogoly",0.6],["Túzok",0.5],["Pacsirta",1.2],["Fülemüle",0.6],["Csalogány",0.8],["Vörösbegy",1.2],["Széncinege",0.8],["Kék cinege",0.5],["Seregély",0.8],["Csóka",0.6],["Vörös kánya",0.4],["Egerészölyv",0.8,"olyv"],["Karvaly",0.8],["Vércse",0.6],["Rétisas",0.4],["Parlagi sas",0.3],["Uhu",0.8],["Fülesbagoly",0.5],["Kuvik",0.3],["Gém",0.8],["Kócsag",0.4],["Kanalasgém",0.2],["Fekete gólya",0.3],["Hattyú",4],["Lúd",1.8],["Kacsa",5],["Liba",4],["Pulyka",2.5],["Tyúk",4],["Kakas",2.5],["Csirke",4],["Gyöngytyúk",0.6],["Sarlósfecske",0.5],["Jégmadár",0.6],["Szajkó",0.6],["Gyurgyalag",0.4],["Gerle",0.5],["Vadgalamb",0.3],["Kakadu",1.2],["Ara",0.5],["Hullámos papagáj",1.5,"hullamos"],["Kanári",1],["Nimfapapagáj",0.6,"nimfa"],["Sirály",1.8],["Császárpingvin",0.5],["Kondor",0.6],["Keselyű",1],["Dodó",0.4],["Paradicsommadár",0.3]]},
    {"p":"Nevezz meg egy tésztafélét!","a":[["Spagetti",22,"spaghetti"],["Penne",10],["Lasagne",6,"lasagna|lazanya"],["Tagliatelle",5],["Makaróni",5,"makaroni"],["Fusilli",5],["Gnocchi",4,"nyoki"],["Tortellini",3.5],["Ravioli",3.5],["Farfalle",3],["Fettuccine",2.5],["Rigatoni",2.2],["Cannelloni",2],["Tarhonya",1.5],["Galuska",1.5],["Nokedli",1.5],["Pappardelle",1.2],["Orecchiette",0.8],["Csipetke",0.7],["Bucatini",0.6],["Orzo",0.5,"risoni"],["Gemelli",0.3],["Cavatappi",0.1],["Trofie",0.1],["Rotini",0.8,"spiral"],["Linguine",1.2],["Tagliolini",0.3],["Capellini",0.2,"angyalhaj"],["Ziti",0.2],["Paccheri",0.1],["Conchiglie",0.4],["Agnolotti",0.2],["Cappelletti",0.1],["Tortelloni",0.3],["Vermicelli",0.5],["Ditalini",0.1],["Soba",0.6],["Udon",0.5],["Ramen",1.2],["Rizstészta",0.8],["Üvegtészta",0.4],["Metélt",1.5],["Cérnametélt",1],["Kockatészta",1,"kocka"],["Csigatészta",0.8,"csiga"],["Szarvacska",1],["Lebbencs",0.6],["Szaggatott",0.3],["Derelye",0.2],["Kiflitészta",0.3],["Radiatori",0.05],["Lumaconi",0.05]]},
    {"p":"Nevezz meg egy háziállatot!","a":[["Kutya",28,"eb"],["Macska",26,"cica"],["Nyúl",6,"hazinyul"],["Hörcsög",5],["Papagáj",4],["Aranyhal",4,"hal"],["Tengerimalac",3.5],["Teknős",3],["Ló",2.5],["Tyúk",1.5],["Disznó",1,"malac|sertes"],["Kecske",1.2],["Juh",0.8,"birka"],["Kanári",1],["Gekkó",1],["Kígyó",1.2],["Tarantula",0.5,"pok"],["Görény",0.6],["Csincsilla",0.8],["Patkány",0.8],["Egér",0.5],["Axolotl",0.4],["Díszhal",0.4],["Törpesün",0.3],["Iguána",0.4],["Kaméleon",0.3],["Szakállas agáma",0.3,"agama"],["Alpaka",0.2],["Láma",0.15],["Hasas disznó",0.1,"vietnami hasasdiszno"]]},
    {"p":"Nevezz meg egy fát!","a":[["Tölgy",14],["Fenyő",12],["Nyírfa",9,"nyir"],["Bükk",8],["Akác",8],["Fűz",6],["Szil",3],["Hárs",4],["Juhar",5],["Éger",2.5],["Cédrus",2.5],["Platán",2.5],["Gesztenye",3,"gesztenyefa"],["Dió",3,"diofa"],["Almafa",3,"alma"],["Cseresznyefa",2],["Körtefa",1.5],["Ciprus",1.5],["Pálma",2.5],["Eukaliptusz",1.5],["Bambusz",0.8],["Olajfa",1.8],["Lucfenyő",1.5],["Jegenyefenyő",0.8],["Mamutfenyő",0.6],["Vörösfenyő",0.8],["Tiszafa",0.4],["Ginkgo",0.4,"ginko"],["Kőris",1.2],["Nyárfa",2.5,"nyar"],["Vadgesztenye",2],["Eperfa",0.8],["Datolyapálma",0.3],["Banyánfa",0.2,"banyan"],["Baobab",0.8,"majomkenyerfa"],["Szekvoja",0.5,"sequoia"],["Mahagóni",0.2],["Teak",0.1],["Balzsafa",0.05],["Sárkányfa",0.05],["Kakaófa",0.2]]}
  ];

const TIERS: Tier[] = [
    { min: 10, name: "Gyakori", pts: 5, color: "#7a8ea0", ico: "⚪" },
    { min: 5, name: "Ismert", pts: 15, color: "#5aa9e6", ico: "🔵" },
    { min: 2.5, name: "Szokatlan", pts: 30, color: "#3ddc97", ico: "🟢" },
    { min: 1.2, name: "Ritka", pts: 50, color: "#f2c94c", ico: "🟡" },
    { min: .5, name: "Nagyon ritka", pts: 75, color: "#ff9f43", ico: "🟠" },
    { min: 0, name: "Egy a krillióból", pts: 100, color: "#ff5fa2", ico: "💎" }
  ];

const css = `
:root{--d:0;--fg:#eaf6ff;--muted:#8fb4cc;--card:rgba(6,30,52,.78);--line:#1f5278;--accent:#35c4ff;--ok:#3ddc97;--bad:#ff6b6b;color-scheme:dark}
*{box-sizing:border-box;margin:0}
html,body{min-height:100%}
body{color:var(--fg);font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(180deg,#2aa9e0 0%,#0b5d94 25%,#06304f 55%,#020d1c 100%);background-attachment:fixed;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}
.dim{position:fixed;inset:0;background:#000;opacity:calc(var(--d)*.55);pointer-events:none;transition:opacity .2s}

.gauge{position:fixed;right:14px;top:70px;bottom:24px;width:34px;display:flex;flex-direction:column;align-items:center;gap:6px;z-index:2}
.gauge .track{flex:1;width:8px;border-radius:8px;background:#ffffff22;position:relative;overflow:hidden}
.gauge .fill{position:absolute;top:0;left:0;right:0;height:0;background:linear-gradient(#7fe3ff,#35c4ff);border-radius:8px;transition:height .15s}
.gauge small{font-size:.7rem;color:var(--muted);writing-mode:vertical-rl}
.wrap{position:relative;z-index:1;max-width:620px;margin:0 auto;padding:22px 64px 40px 18px}
header{text-align:center;margin-bottom:18px}
header h1{font-size:clamp(2rem,6vw,2.8rem);letter-spacing:-.03em}
header em{font-style:normal;color:var(--accent)}
header p{color:var(--muted);margin-top:4px;font-size:.92rem}
.card{background:var(--card);backdrop-filter:blur(8px);border:1px solid var(--line);border-radius:22px;padding:24px}
.card h2{font-size:1.45rem;line-height:1.3;margin:10px 0 18px}
.meta{display:flex;justify-content:space-between;color:var(--muted);font-size:.88rem}
.timer{height:6px;border-radius:6px;background:#ffffff1f;margin-top:8px;overflow:hidden}
.timer i{display:block;height:100%;width:100%;background:var(--accent)}
.timer i.low{background:var(--bad)}
.row{display:flex;gap:8px}
input{flex:1;min-width:0;font-size:1.05rem;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:#031425;color:var(--fg)}
input:focus{outline:2px solid var(--accent)}
.btn{background:var(--accent);color:#03233a;border:0;border-radius:12px;padding:12px 18px;font-weight:700;cursor:pointer;font-size:1rem}
.btn.ghost{background:#0c3556;color:var(--fg);font-weight:500}
.btn:hover{filter:brightness(1.1)}
.tiers{display:flex;flex-wrap:wrap;gap:6px;margin-top:18px}
.tier{font-size:.72rem;padding:3px 9px;border-radius:999px;background:#0c3556;color:var(--muted)}
.res{text-align:center;animation:pop .35s ease}
@keyframes pop{from{transform:scale(.9);opacity:0}to{transform:none;opacity:1}}
.res .big{font-size:2.6rem;font-weight:800;margin:6px 0}
.badge{display:inline-block;padding:5px 16px;border-radius:999px;font-weight:700}
.res p{color:var(--muted);margin:8px 0 18px}
table{width:100%;border-collapse:collapse;font-size:.88rem;margin:14px 0}
td,th{padding:7px 4px;border-bottom:1px solid #1f527855;text-align:left}
th{color:var(--muted);font-weight:500;font-size:.75rem}
.center{text-align:center}
.score{font-size:3rem;font-weight:800;color:var(--accent)}
.hint{color:var(--muted);font-size:.8rem;margin-top:10px}
.badmsg{min-height:1.4em;margin-top:10px;color:var(--bad);font-size:.92rem}
.shake{animation:shk .35s;border-color:var(--bad)}
@keyframes shk{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.score.big{font-size:4.8rem;line-height:1;font-weight:800;color:#fff}
.pts{color:var(--accent);margin:4px 0 6px;font-size:1rem;letter-spacing:.04em}
.perf{margin:16px 0;padding:14px;border:1px solid var(--line);border-radius:14px;background:#03142588}
.perf h3{font-size:1.05rem}
.pmsg{margin:4px 0 10px}
.cmp{display:grid;grid-template-columns:50px 1fr 80px;gap:8px;align-items:center;font-size:.88rem;margin:4px 0}
.ct{height:12px;background:#ffffff1c;border-radius:8px;overflow:hidden}
.ct i{display:block;height:100%;border-radius:8px}
.cmp b{text-align:right}
.perf svg{margin-top:10px}
.stage{position:relative;height:170px;border-radius:16px;overflow:hidden;margin-bottom:14px;background:linear-gradient(#0b5d9455,#02101f88);border:1px solid var(--line)}
.stage .lines{position:absolute;inset:0;background-image:linear-gradient(to bottom,transparent 59px,#ffffff2e 59px);background-size:100% 60px}
.stage .diver{position:absolute;left:50%;top:50%;margin:-24px 0 0 -42px;line-height:0;will-change:transform;filter:drop-shadow(0 4px 8px #0008)}
.stage .dcount{position:absolute;right:12px;top:8px;font-weight:800;font-size:1.3rem;text-shadow:0 2px 6px #000a}
.stage .bubs i{position:absolute;left:38%;top:50%;width:8px;height:8px;border:1px solid #fff9;border-radius:50%;animation:bubup 1.2s linear infinite}
.stage .bubs i:nth-child(2){animation-delay:.3s;left:34%}
.stage .bubs i:nth-child(3){animation-delay:.6s;left:36%}
.stage .bubs i:nth-child(4){animation-delay:.9s;left:32%}
@keyframes bubup{from{transform:translateY(0);opacity:.9}to{transform:translateY(-90px);opacity:0}}
@media(max-width:480px){.wrap{padding-right:56px}.card{padding:18px}}
@media(prefers-reduced-motion:reduce){.bub{display:none}}
body{background:linear-gradient(180deg,#5fd0ff 0%,#1b8ccf 14%,#0b5d94 32%,#06304f 58%,#020d1c 100%);background-attachment:fixed}
#bg{position:fixed;inset:0;width:100%;height:100%;pointer-events:none}
.sunglow{position:fixed;top:-130px;left:50%;width:560px;height:360px;margin-left:-280px;background:radial-gradient(closest-side,#fff7c2cc,#ffe08a55 45%,transparent);opacity:calc(1 - var(--d)*1.8);pointer-events:none}
.kelp{position:fixed;left:0;right:0;bottom:0;width:100%;height:130px;pointer-events:none;opacity:calc(.15 + var(--d)*.6)}
.kelp path{fill:#04283f;transform-origin:50% 100%;transform-box:fill-box;animation:sway 5s ease-in-out infinite}
.kelp path:nth-child(2n){animation-duration:6.5s;animation-delay:-2s}
.kelp path:nth-child(3n){animation-duration:4.2s;animation-delay:-1s;fill:#06344f}
@keyframes sway{50%{transform:skewX(7deg)}0%,100%{transform:skewX(-7deg)}}
.flash{position:fixed;inset:0;pointer-events:none;z-index:5;animation:fl 1s ease-out forwards}
@keyframes fl{from{opacity:1}to{opacity:0}}
.gauge{position:fixed}
header em{background:linear-gradient(90deg,#7fe3ff,#ffffff,#35c4ff,#7fe3ff);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shim 6s linear infinite}
@keyframes shim{to{background-position:300% 0}}
.card{border-color:#2a6fa3;box-shadow:0 24px 70px #0008,inset 0 1px 0 #ffffff26}
.btn{transition:transform .12s,filter .12s,box-shadow .12s}
.btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px #35c4ff33}
.btn:active{transform:translateY(1px)}
.stage{height:200px;box-shadow:inset 0 0 40px #0008}
.stage canvas{position:absolute;inset:0;width:100%;height:100%}
.stage .diver{margin:-26px 0 0 -48px}
.stage .diver .prop{transform-box:fill-box;transform-origin:center;animation:prop .16s linear infinite}
@keyframes prop{50%{transform:scaleY(.25)}}
.stage .dcount{font-size:1.6rem}
.stage .lines,.stage .bubs{display:none}
.sug{display:none}
.sug.on{display:block;margin:0 0 12px;padding:10px 12px;border:1px solid var(--accent);border-radius:12px;background:#0a3a5c99;animation:pop .3s ease}
.sug b{color:#fff}
.archive{max-height:320px;overflow:auto;display:grid;gap:6px;padding-right:4px}
.arow{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;background:#031425aa;border:1px solid var(--line);border-radius:12px;padding:8px 12px;font-size:.88rem}
.arow em{font-style:normal;font-size:.7rem;background:var(--accent);color:#03233a;border-radius:999px;padding:1px 7px;margin-left:4px}
.arow .btn{padding:6px 12px;font-size:.82rem}
@media(prefers-reduced-motion:reduce){.kelp path,header em,.stage .diver .prop{animation:none}}
`;

let FLOW = 0;
const TIME = 25;
const MAXD = 7000;
const START_DAY = "2026-11-25";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

const tierOf = (pct: number): Tier => {
  for (const t of TIERS) if (pct >= t.min) return t;
  return TIERS[TIERS.length - 1];
};

const namesOf = (a: Answer) => [a[0], ...(a[2] ? a[2].split("|") : [])];

function findAnswer(q: Question, text: string): Answer | null {
  const n = norm(text);
  if (!n) return null;
  for (const a of q.a) for (const nm of namesOf(a)) if (norm(nm) === n) return a;
  return null;
}

function osa(a: string, b: string): number {
  const m: number[][] = [];
  for (let i = 0; i <= a.length; i++) m[i] = [i];
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) m[i][j] = Math.min(m[i][j], m[i - 2][j - 2] + 1);
    }
  return m[a.length][b.length];
}

/* elgépelés esetén: „Erre gondoltál?” javaslat */
function suggest(q: Question, text: string): Answer | null {
  const n = norm(text);
  if (n.length < 3) return null;
  const thr = n.length <= 4 ? 1 : n.length <= 9 ? 2 : 3;
  let best: Answer | null = null;
  let bd = 99;
  for (const a of q.a)
    for (const nm of namesOf(a)) {
      const nn = norm(nm);
      let d = osa(n, nn);
      if (nn.length >= 4 && nn.indexOf(n) === 0) d = Math.min(d, 1);
      if (d <= thr && d < bd) {
        bd = d;
        best = a;
      }
    }
  return best;
}

const rarest = (q: Question) => [...q.a].sort((x, y) => x[1] - y[1])[0][0];

const keyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayKey = () => keyOf(new Date());
function daysList(): string[] {
  const out: string[] = [];
  const [y, m, d] = START_DAY.split("-").map(Number);
  const cur = new Date(y, m - 1, d);
  const end = todayKey();
  for (let i = 0; i < 4000; i++) {
    const k = keyOf(cur);
    if (k > end) break;
    out.unshift(k);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
const MONTHS = ["jan.", "febr.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
const dayLabel = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return `${y}. ${MONTHS[m - 1]} ${d}.`;
};

function lsGet<T>(k: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(k) || "null") as T | null;
  } catch {
    return null;
  }
}
function lsSet(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* nincs tárhely */
  }
}
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* a napi kérdéssort az első megnyitáskor eltároljuk, így később is ugyanaz marad */
function pickOrder(practice: boolean, day: string): number[] {
  if (!practice) {
    const st = lsGet<number[]>("melyviz:set:" + day);
    if (st && st.length === 7 && st.every((i) => Q[i])) return st;
  }
  const r = practice ? Math.random : rng(hash("melyviz-" + day));
  const idx = Q.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const res = idx.slice(0, 7);
  if (!practice) lsSet("melyviz:set:" + day, res);
  return res;
}
type Saved = { depth: number; emoji: string };
const getSaved = (day: string) => lsGet<Saved>("melyviz:" + day);
const putSaved = (day: string, v: Saved) => lsSet("melyviz:" + day, v);

function cdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

type RGB = [number, number, number];
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const rgb = (c: RGB) => `rgb(${c.map(Math.round).join(",")})`;

function flash(color: string) {
  const f = document.createElement("div");
  f.className = "flash";
  f.style.background = `radial-gradient(circle,${color}99,transparent 62%)`;
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1100);
}

/* ---------- Tengeralattjáró ---------- */
function Sub() {
  return (
    <svg viewBox="0 0 96 52" width="96" height="52" aria-hidden="true">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset=".6" stopColor="#f2c94c" />
          <stop offset="1" stopColor="#c99a22" />
        </linearGradient>
      </defs>
      <rect x="50" y="1" width="3" height="8" fill="#b88a1c" />
      <rect x="50" y="1" width="12" height="3" rx="1.5" fill="#b88a1c" />
      <rect x="40" y="7" width="24" height="14" rx="5" fill="url(#sg)" stroke="#9c7414" strokeWidth="1.5" />
      <ellipse cx="50" cy="32" rx="38" ry="16" fill="url(#sg)" stroke="#9c7414" strokeWidth="1.5" />
      <path d="M16 32 L4 20 L4 44 Z" fill="#c99a22" stroke="#9c7414" strokeWidth="1.5" />
      <g className="prop"><ellipse cx="3" cy="32" rx="2.5" ry="12" fill="#8a6a15" /></g>
      {[34, 50, 66].map((cx) => (
        <circle key={cx} cx={cx} cy="31" r="5" fill="#8ff0ff" stroke="#9c7414" strokeWidth="2" />
      ))}
      <path d="M30 25 q8 -4 18 -3" stroke="#ffffffaa" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="86" cy="32" r="3" fill="#fff6b0" />
    </svg>
  );
}

/* ---------- Végeredmény: haranggörbe + merülési napló ---------- */
function Report({ rounds, total }: { rounds: RoundResult[]; total: number }) {
  let mean = 0;
  let vr = 0;
  rounds.forEach((r) => {
    let s = 0, s2 = 0, w = 0;
    r.q.a.forEach((x) => {
      const p = tierOf(x[1]).pts;
      s += x[1] * p;
      s2 += x[1] * p * p;
      w += x[1];
    });
    const m = s / w;
    mean += m;
    vr += s2 / w - m * m;
  });
  const sd = Math.sqrt(Math.max(1, vr));
  const pct = Math.round(cdf((total - mean) / sd) * 100);

  const W = 600, base = 150, top = 16, pl = 14, pr = 14;
  const X = (v: number) => pl + ((W - pl - pr) * v) / 700;
  const Y = (v: number) => base - (base - top) * Math.exp(-0.5 * Math.pow((v - mean) / sd, 2));
  const pts: string[] = [];
  for (let v = 0; v <= 700; v += 7) pts.push(`${X(v).toFixed(1)},${Y(v).toFixed(1)}`);
  const line = "M" + pts.join(" L");
  const area = `${line} L${X(700)},${base} L${X(0)},${base} Z`;
  const tv = Math.min(700, Math.max(0, total));
  const tx = X(tv);

  const n = rounds.length, LW = 600, LH = 280, ltop = 36, lbot = 236;
  const LY = (m: number) => ltop + ((lbot - ltop) * m) / 1000;
  const lx = (i: number) => 76 + (i * (LW - 106)) / Math.max(1, n - 1);
  let wave = `M0,${ltop} Q40,${ltop - 8} 80,${ltop}`;
  for (let k = 160; k <= 640; k += 80) wave += ` T${k},${ltop}`;

  return (
    <>
      <div className="perf">
        <h3>Hol állsz a többiekhez képest?</h3>
        <p className="pmsg"><b>Jobb vagy, mint a mai játékosok kb. {pct}%-a.</b></p>
        <svg viewBox="0 0 600 190" width="100%" role="img" aria-label="Pontszámod a többi játékoséhoz képest">
          <path d={area} fill="#35c4ff33" />
          <path d={line} fill="none" stroke="#35c4ff" strokeWidth="2.5" />
          <line x1={pl} x2={W - pr} y1={base} y2={base} stroke="#8fb4cc" />
          {[0, 100, 200, 300, 400, 500, 600, 700].map((t) => (
            <g key={t}>
              <line x1={X(t)} x2={X(t)} y1={base} y2={base + 5} stroke="#8fb4cc" />
              <text x={X(t)} y={base + 18} textAnchor="middle" fontSize="11" fill="#8fb4cc">{t}</text>
            </g>
          ))}
          <line x1={tx} x2={tx} y1={Y(tv)} y2={base} stroke="#ff5fa2" strokeWidth="2.5" />
          <circle cx={tx} cy={Y(tv)} r="6" fill="#ff5fa2" />
          <text x={tx} y={base + 36} textAnchor="middle" fontSize="13" fontWeight="700" fill="#ff5fa2">TE · {total}</text>
        </svg>
        <div className="hint">A görbe a játék becsült gyakorisági adataiból számolt várható pontszám-eloszlás, nem valódi játékosoké.</div>
      </div>

      <div className="perf">
        <h3>Merülési napló</h3>
        <div className="hint" style={{ margin: "0 0 6px" }}>Minél mélyebb, annál ritkább volt a válaszod.</div>
        <svg viewBox={`0 0 ${LW} ${LH}`} width="100%" role="img" aria-label="Merülési napló kérdésenként">
          <rect x="0" y={ltop} width={LW} height={LH - ltop} fill="#02101f99" rx="10" />
          <path d={wave} fill="none" stroke="#7fe3ff" strokeWidth="2" />
          {[0, 250, 500, 750, 1000].map((m) => (
            <g key={m}>
              <line x1="46" x2={LW} y1={LY(m)} y2={LY(m)} stroke="#ffffff22" strokeDasharray="4 5" />
              <text x="40" y={LY(m) + 4} textAnchor="end" fontSize="10" fill="#8fb4cc">{m} m</text>
            </g>
          ))}
          {rounds.map((r, i) => {
            const y = LY(r.pts * 10);
            const c = r.tier ? r.tier.color : "#5d7388";
            return (
              <g key={i}>
                <line x1={lx(i)} x2={lx(i)} y1={ltop} y2={y} stroke={c} strokeWidth="2" opacity=".8" />
                <text x={lx(i)} y={y + 8} textAnchor="middle" fontSize="22">{r.pts >= 100 ? "💎" : r.hit ? "🐟" : "🫧"}</text>
                <text x={lx(i)} y={LH - 12} textAnchor="middle" fontSize="13" fill="#cfe6f5">{i + 1}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}



/* ---------- Élő háttér ---------- */
function Background({ d }: { d: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dRef = useRef(d);
  dRef.current = d;
  useEffect(() => {
    const cv = ref.current!;
    const g = cv.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const R = Math.random;
    let W = 0, H = 0;
    const size = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);
    const snow = Array.from({ length: 110 }, () => ({ x: R(), y: R(), z: 0.3 + R() * 0.9, p: R() * 6.28 }));
    const fish = Array.from({ length: 7 }, () => ({ x: R(), y: 0.15 + R() * 0.7, v: (0.01 + R() * 0.03) * (R() < 0.5 ? -1 : 1), s: 10 + R() * 22, p: R() * 6.28 }));
    const jel = Array.from({ length: 6 }, (_, i) => ({ x: R(), y: 0.3 + R() * 0.6, s: 14 + R() * 20, p: R() * 6.28, c: i % 2 ? "255,95,162" : "76,201,240" }));
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const d0 = dRef.current;
      FLOW *= Math.pow(0.02, dt);
      g.clearRect(0, 0, W, H);
      const ra = (1 - d0) * 0.16;
      if (ra > 0.005)
        for (let i = 0; i < 6; i++) {
          const x0 = W * (0.1 + i * 0.17) + Math.sin(now / 3000 + i) * 40;
          const w = 50 + (i % 3) * 30;
          const lg = g.createLinearGradient(0, 0, 0, H * 0.85);
          lg.addColorStop(0, `rgba(190,240,255,${ra})`);
          lg.addColorStop(1, "rgba(190,240,255,0)");
          g.fillStyle = lg;
          g.beginPath();
          g.moveTo(x0, 0);
          g.lineTo(x0 + w, 0);
          g.lineTo(x0 + w * 3 - 120, H * 0.85);
          g.lineTo(x0 - w * 2 - 60, H * 0.85);
          g.fill();
        }
      g.fillStyle = `rgba(2,16,32,${0.28 + d0 * 0.1})`;
      fish.forEach((f) => {
        f.x += f.v * dt;
        if (f.x > 1.1) f.x = -0.1;
        if (f.x < -0.1) f.x = 1.1;
        const x = f.x * W, y = f.y * H + Math.sin(now / 900 + f.p) * 8, s = f.s, dir = f.v > 0 ? 1 : -1;
        g.beginPath();
        g.ellipse(x, y, s, s * 0.42, 0, 0, 6.3);
        g.fill();
        g.beginPath();
        g.moveTo(x - dir * s * 0.9, y);
        g.lineTo(x - dir * s * 1.5, y - s * 0.4);
        g.lineTo(x - dir * s * 1.5, y + s * 0.4);
        g.fill();
      });
      if (d0 > 0.12)
        jel.forEach((j) => {
          let y = (j.y * H - now * 0.006 * (1 + FLOW * 3)) % (H + 60);
          if (y < -40) y += H + 80;
          const x = j.x * W + Math.sin(now / 1500 + j.p) * 24;
          const a = Math.min(0.8, d0 * 1.1) * (0.55 + 0.45 * Math.sin(now / 700 + j.p));
          const rg = g.createRadialGradient(x, y, 0, x, y, j.s * 2);
          rg.addColorStop(0, `rgba(${j.c},${a})`);
          rg.addColorStop(1, `rgba(${j.c},0)`);
          g.fillStyle = rg;
          g.beginPath();
          g.arc(x, y, j.s * 2, 0, 6.3);
          g.fill();
        });
      snow.forEach((s) => {
        s.y -= dt * (0.012 + 0.03 * s.z) * (1 + FLOW * 14);
        if (s.y < -0.02) {
          s.y = 1.02;
          s.x = R();
        }
        const x = s.x * W + Math.sin(now / 1200 + s.p) * 10 * s.z, y = s.y * H, len = FLOW * 26 * s.z;
        g.strokeStyle = `rgba(220,245,255,${(0.15 + 0.45 * s.z) * (1 - d0 * 0.2)})`;
        g.lineWidth = s.z * 1.8;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x, y + len + 1);
        g.stroke();
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, []);
  return <canvas id="bg" ref={ref} />;
}

/* ---------- Merülés jelenet ---------- */
function createStage(cv: HTMLCanvasElement) {
  const W = (cv.width = cv.clientWidth || 560);
  const H = (cv.height = 200);
  const g = cv.getContext("2d")!;
  type P = { x: number; y: number; vx: number; vy: number; l: number; c: string };
  const sn = Array.from({ length: 50 }, () => ({ x: Math.random() * W, y: Math.random() * H, z: 0.4 + Math.random() }));
  let sp: P[] = [];
  let ring: { r: number; a: number; c: string } | null = null;
  return {
    pulse(c: string) {
      ring = { r: 12, a: 0.9, c };
    },
    spark(c: string) {
      for (let k = 0; k < 34; k++) {
        const an = Math.random() * 6.28, v = 1 + Math.random() * 4;
        sp.push({ x: W / 2, y: H / 2, vx: Math.cos(an) * v, vy: Math.sin(an) * v, l: 1, c });
      }
    },
    draw(cur: number, vn: number) {
      const d = Math.min(1, cur / MAXD), k = Math.min(1, d * 1.5);
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, rgb(mix([27, 140, 207], [4, 20, 40], k)));
      bg.addColorStop(1, rgb(mix([11, 93, 148], [2, 10, 24], Math.min(1, k + 0.2))));
      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);
      g.strokeStyle = "rgba(255,255,255,.07)";
      g.lineWidth = 1;
      for (let y = -((cur * 0.6) % 40); y < H; y += 40) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y);
        g.stroke();
      }
      const hx = W / 2 + 40, hy = H / 2 + 4, a = 0.1 + d * 0.35;
      const bm = g.createLinearGradient(hx, 0, hx + 260, 0);
      bm.addColorStop(0, `rgba(255,246,176,${a})`);
      bm.addColorStop(1, "rgba(255,246,176,0)");
      g.fillStyle = bm;
      g.beginPath();
      g.moveTo(hx, hy - 3);
      g.lineTo(hx + 260, hy - 70);
      g.lineTo(hx + 260, hy + 90);
      g.lineTo(hx, hy + 5);
      g.fill();
      sn.forEach((s) => {
        s.y -= (0.4 + vn * 14) * s.z;
        if (s.y < -30) {
          s.y = H + 4;
          s.x = Math.random() * W;
        }
        g.strokeStyle = `rgba(225,247,255,${0.25 + 0.35 * s.z})`;
        g.lineWidth = s.z * 1.6;
        g.beginPath();
        g.moveTo(s.x, s.y);
        g.lineTo(s.x, s.y + 2 + vn * 22 * s.z);
        g.stroke();
      });
      if (ring) {
        g.strokeStyle = ring.c;
        g.globalAlpha = Math.max(0, ring.a);
        g.lineWidth = 3;
        g.beginPath();
        g.arc(W / 2, H / 2, ring.r, 0, 6.3);
        g.stroke();
        g.globalAlpha = 1;
        ring.r += 3.5;
        ring.a -= 0.018;
        if (ring.a <= 0) ring = null;
      }
      sp = sp.filter((p) => p.l > 0);
      sp.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.l -= 0.016;
        g.globalAlpha = Math.max(0, p.l);
        g.fillStyle = p.c;
        g.beginPath();
        g.arc(p.x, p.y, 1.5 + p.l * 2.5, 0, 6.3);
        g.fill();
      });
      g.globalAlpha = 1;
    },
  };
}

function Stage({ from, pts, tier, onProgress, onDone }: { from: number; pts: number; tier: Tier | null; onProgress: (n: number) => void; onDone: (to: number) => void }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const diverRef = useRef<HTMLDivElement>(null);
  const [cnt, setCnt] = useState(from);
  const cb = useRef({ onProgress, onDone });
  cb.current = { onProgress, onDone };
  useEffect(() => {
    const st = createStage(cvRef.current!);
    const to = from + pts * 10;
    const dur = pts ? 1100 + pts * 28 : 700;
    const t0 = performance.now();
    let prev = from, pt = t0, fin = false, raf = 0;
    const f = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const cur = Math.round(from + (to - from) * e);
      const dt = Math.max(0.001, (now - pt) / 1000);
      const vn = Math.min(1, Math.abs(cur - prev) / dt / 450);
      prev = cur;
      pt = now;
      if (k < 1) {
        setCnt(cur);
        cb.current.onProgress(cur);
      }
      FLOW = Math.max(FLOW, vn);
      const dv = diverRef.current;
      if (dv) {
        if (pts === 0) dv.style.transform = k < 1 ? `translateX(${Math.sin(k * 20) * 10 * (1 - k)}px) rotate(${Math.sin(k * 20) * 12 * (1 - k)}deg)` : "none";
        else dv.style.transform = `translateY(${Math.sin(now / 170) * 5}px) rotate(${3 + vn * 14 + Math.sin(now / 250) * 4}deg)`;
      }
      st.draw(cur, vn);
      if (k >= 1 && !fin) {
        fin = true;
        setCnt(to);
        cb.current.onDone(to);
        if (pts && tier) {
          st.pulse(tier.color);
          if (pts >= 50) st.spark(tier.color);
          if (pts >= 75) flash(tier.color);
        }
      }
      raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="stage">
      <canvas ref={cvRef} />
      <div className="diver" ref={diverRef}><Sub /></div>
      <div className="dcount">{cnt.toLocaleString("hu-HU")} m</div>
    </div>
  );
}

const KELP = Array.from({ length: 12 }, (_, i) => 30 + i * 85);

/* ---------- Alkalmazás ---------- */
export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [practice, setPractice] = useState(false);
  const [curDay, setCurDay] = useState<string | null>(null);
  const [saveIt, setSaveIt] = useState(false);
  const [order, setOrder] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [depth, setDepth] = useState(0);
  const [shown, setShown] = useState(0);
  const [left, setLeft] = useState(TIME * 10);
  const [input, setInput] = useState("");
  const [bad, setBad] = useState("");
  const [sug, setSug] = useState<Answer | null>(null);
  const [sugText, setSugText] = useState("");
  const [shake, setShake] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  const [copied, setCopied] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const q: Question | undefined = order.length ? Q[order[round]] : undefined;
  const total = rounds.reduce((s, r) => s + r.pts, 0);
  const today = todayKey();
  const archive = useMemo(() => (screen === "menu" ? daysList().map((k) => ({ k, s: getSaved(k) })) : []), [screen]);
  const savedToday = archive.length ? archive[0].s : null;

  const goMenu = () => {
    setScreen("menu");
    setDepth(0);
    setShown(0);
  };

  const resetRun = (ord: number[]) => {
    setOrder(ord);
    setRound(0);
    setRounds([]);
    setDepth(0);
    setShown(0);
    setInput("");
    setBad("");
    setSug(null);
    setCopied("");
    setScreen("play");
  };
  const beginDay = (day: string) => {
    setPractice(false);
    setCurDay(day);
    setSaveIt(!getSaved(day));
    resetRun(pickOrder(false, day));
  };
  const beginPractice = () => {
    setPractice(true);
    setCurDay(null);
    setSaveIt(false);
    resetRun(pickOrder(true, ""));
  };

  const finish = (text: string) => {
    if (screen !== "play" || !q) return;
    const hit = findAnswer(q, text);
    const tier = hit ? tierOf(hit[1]) : null;
    setRounds([...rounds, { q, text: text.trim(), hit, tier, pts: tier ? tier.pts : 0 }]);
    setAnimDone(false);
    setSug(null);
    setScreen("reveal");
  };

  const submit = () => {
    if (!q) return;
    const v = input;
    if (!v.trim()) {
      setBad("Írj be egy választ!");
      return;
    }
    if (sug && norm(v) === sugText) {
      finish(sug[0]);
      return;
    }
    if (findAnswer(q, v)) {
      finish(v);
      return;
    }
    const s = suggest(q, v);
    if (s) {
      setSug(s);
      setSugText(norm(v));
      setBad("");
      return;
    }
    setBad(`„${v.trim()}” nem jó, vagy nincs a listámban. Próbálj egy másikat!`);
    setInput("");
    setShake((n) => n + 1);
    inputRef.current?.focus();
  };

  const next = () => {
    if (round >= order.length - 1) {
      if (!practice && saveIt && curDay) putSaved(curDay, { depth, emoji: rounds.map((r) => r.tier?.ico ?? "🫧").join("") });
      setScreen("end");
    } else {
      setRound(round + 1);
      setInput("");
      setBad("");
      setSug(null);
      setScreen("play");
    }
  };

  useEffect(() => {
    if (screen !== "play") return;
    setLeft(TIME * 10);
    const id = setInterval(() => setLeft((l) => l - 1), 100);
    return () => clearInterval(id);
  }, [screen, round]);

  useEffect(() => {
    if (screen === "play" && left <= 0) finish(input);
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (screen === "play") inputRef.current?.focus();
  }, [screen, round]);

  useEffect(() => {
    if (animDone) nextRef.current?.focus();
  }, [animDone]);

  const res = rounds[rounds.length - 1];
  const last = round >= order.length - 1;
  const verdict =
    depth >= 5000 ? "Mélytengeri legenda! 🐙" : depth >= 3000 ? "Remek merülés, a sötétségig jutottál. 🔦" : depth >= 1500 ? "Szép munka, a kék zónát elérted. 🐠" : "Még a felszín közelében jársz, próbáld ritkább válaszokkal! 🌊";
  const share = `Rákillió 🌊 ${practice ? "gyakorlás" : curDay} · ${depth.toLocaleString("hu-HU")} m\n${rounds.map((r) => r.tier?.ico ?? "🫧").join("")}`;
  const d = Math.min(1, shown / MAXD);

  return (
    <div style={{ "--d": String(d) } as CSSProperties}>
      <style>{css}</style>
      <div className="sunglow" />
      <svg className="kelp" viewBox="0 0 1000 130" preserveAspectRatio="none" aria-hidden="true">
        {KELP.map((x) => (
          <path key={x} d={`M${x} 130 C${x - 18} 95 ${x + 22} 70 ${x + 4} 20 C${x + 30} 70 ${x + 8} 100 ${x + 26} 130Z`} />
        ))}
      </svg>
      <div className="dim" />
      <Background d={d} />

      <div className="gauge">
        <small>{shown.toLocaleString("hu-HU")} m</small>
        <div className="track"><div className="fill" style={{ height: `${d * 100}%` }} /></div>
        <small>7000 m</small>
      </div>

      <div className="wrap">
        <header>
          {screen !== "menu" && (
            <button className="btn ghost" style={{ marginBottom: 10, padding: "6px 14px", fontSize: ".85rem" }} onClick={goMenu}>← Vissza a menübe</button>
          )}
          <h1>Rá<em>killió</em></h1>
          <p>Minél ritkább a helyes válaszod, annál mélyebbre jutsz.</p>
        </header>

        <div className="card">
          {screen === "menu" && (
            <>
              <h2>Merülj le a mélybe!</h2>
              <div className="meta"><span>Ma: {dayLabel(today)}</span></div>
              <br />
              <p style={{ color: "var(--muted)", lineHeight: 1.55 }}>
                7 kérdést kapsz, mindegyikre {TIME} másodperced van. Sok válasz helyes, de az a kérdés, mennyien gondoltak rá: minél ritkább a jó válaszod, annál több pontot (és métert) kapsz. Ha elgépelsz valamit, megkérdezem, erre gondoltál-e. A „gyakoriság” a játék saját, beépített becslése, nem valódi játékosok adata.
              </p>
              <div className="tiers">
                {TIERS.map((t) => <span className="tier" key={t.name}>{t.ico} {t.name} · {t.pts} pt</span>)}
              </div>
              <br />
              {savedToday ? (
                <p style={{ marginBottom: 12 }}>
                  A mai merülésed már megvan: <b>{savedToday.depth.toLocaleString("hu-HU")} m</b> {savedToday.emoji}
                  <br /><span className="hint">Holnap új kérdéssor jön, a régieket lent találod.</span>
                </p>
              ) : (
                <><button className="btn" onClick={() => beginDay(today)}>Mai napi merülés</button>{" "}</>
              )}
              <button className="btn ghost" onClick={beginPractice}>Gyakorlás (véletlen kérdések)</button>

              <h3 style={{ margin: "20px 0 4px" }}>📅 Napi merülések archívuma</h3>
              <div className="hint" style={{ margin: "0 0 8px" }}>2026. nov. 25-től minden napi kérdéssor el van tárolva, bármikor visszamehetsz rájuk.</div>
              <div className="archive">
                {archive.map(({ k, s }) => (
                  <div className="arow" key={k}>
                    <span className="ad">{dayLabel(k)}{k === today && <em>ma</em>}</span>
                    <span className="ar">{s ? <>{s.emoji} <b>{s.depth.toLocaleString("hu-HU")} m</b></> : <span style={{ color: "var(--muted)" }}>még nem játszottad</span>}</span>
                    <button className={`btn${s ? " ghost" : ""}`} onClick={() => beginDay(k)}>{s ? "Újra (nem számít)" : "Játék"}</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {screen === "play" && q && (
            <>
              <div className="meta"><span>{round + 1} / {order.length}. kérdés</span><span>{Math.ceil(left / 10)} mp</span></div>
              <div className="timer"><i className={left < 80 ? "low" : ""} style={{ width: `${Math.max(0, (left / (TIME * 10)) * 100)}%` }} /></div>
              <h2>{q.p}</h2>
              {sug && (
                <div className="sug on">
                  Erre gondoltál: <b>{sug[0]}</b>?{" "}
                  <button className="btn" onClick={() => finish(sug[0])}>Igen</button>{" "}
                  <button className="btn ghost" onClick={() => { setSug(null); setInput(""); inputRef.current?.focus(); }}>Nem</button>
                </div>
              )}
              <div className="row">
                <input
                  key={shake}
                  ref={inputRef}
                  className={shake ? "shake" : ""}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (sug && norm(e.target.value) !== sugText) setSug(null);
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                  autoComplete="off"
                  autoCapitalize="off"
                  placeholder="Írd be a válaszod…"
                />
                <button className="btn" onClick={submit}>Küldés</button>
              </div>
              <div className="badmsg">{bad}</div>
              <div className="hint">
                <button className="btn ghost" style={{ padding: "6px 12px", fontSize: ".85rem" }} onClick={() => finish("")}>Kihagyás</button>
              </div>
            </>
          )}

          {screen === "reveal" && res && (
            <>
              <Stage
                key={rounds.length}
                from={depth}
                pts={res.pts}
                tier={res.tier}
                onProgress={setShown}
                onDone={(to) => {
                  setDepth(to);
                  setShown(to);
                  setAnimDone(true);
                }}
              />
              <div className="res" style={{ visibility: animDone ? "visible" : "hidden" }}>
                {res.hit && res.tier ? (
                  <>
                    <span className="badge" style={{ background: res.tier.color, color: "#04141f" }}>{res.tier.ico} {res.tier.name}</span>
                    <div className="big">+{res.pts} pont</div>
                    <p>„{res.hit[0]}”: a játékosok kb. {String(res.hit[1]).replace(".", ",")}%-a írta ezt. Lejjebb süllyedtél {res.pts * 10} métert.</p>
                  </>
                ) : (
                  <>
                    <span className="badge" style={{ background: "#33475a" }}>🫧 Nem találtam</span>
                    <div className="big">+0 pont</div>
                    <p>
                      {res.text ? `A(z) „${res.text}” nincs a listámban, vagy nem illik a kérdéshez.` : "Nem érkezett válasz."} Egy nagyon ritka megoldás lett volna: {rarest(res.q)}.
                    </p>
                  </>
                )}
                <button ref={nextRef} className="btn" onClick={next}>{last ? "Eredmény" : "Következő"}</button>
              </div>
            </>
          )}

          {screen === "end" && (
            <>
              <div className="center">
                <div className="meta" style={{ justifyContent: "center" }}>
                  {practice ? "Gyakorlás" : `Merülés · ${curDay ? dayLabel(curDay) : ""}${saveIt ? "" : " · újrajátszás"}`} · vége
                </div>
                <div className="score big">{total}</div>
                <div className="pts">PONT · {depth.toLocaleString("hu-HU")} m mélység</div>
                <p style={{ color: "var(--muted)" }}>{verdict}</p>
              </div>
              <Report rounds={rounds} total={total} />
              <table>
                <thead>
                  <tr><th></th><th>Válaszod</th><th>Szint</th><th>Pont</th><th>Ritka példa</th></tr>
                </thead>
                <tbody>
                  {rounds.map((r, i) => (
                    <tr key={i}>
                      <td>{r.tier?.ico ?? "🫧"}</td>
                      <td>{r.hit ? r.hit[0] : r.text ? "—" : "kihagyva"}</td>
                      <td>{r.tier?.name ?? ""}</td>
                      <td>{r.pts}</td>
                      <td>{rarest(r.q)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="row">
                <button className="btn" onClick={goMenu}>Vissza a menübe</button>
                <button className="btn ghost" onClick={() => navigator.clipboard.writeText(share).then(() => setCopied("Kimásolva!"), () => setCopied(share))}>Eredmény másolása</button>
              </div>
              <div className="hint">{copied}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}