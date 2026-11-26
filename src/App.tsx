import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Answer = [string, number, string?];
type WD = { p31?: string[]; p30?: string[]; p17?: string; pop?: boolean };
type Question = { p: string; a: Answer[]; wd?: WD };
type Tier = { min: number; name: string; pts: number; color: string; ico: string };
type RoundResult = { q: Question; text: string; hit: Answer | null; tier: Tier | null; pts: number };
type Screen = "menu" | "play" | "reveal" | "end";

/* Kérdések: [megjelenített név, gyakoriság %, alternatív írásmódok (| jellel)] */
const Q: Question[] = [
    {"p":"Nevezz meg egy európai fővárost!","a":[["Párizs",14,"paris"],["London",12],["Berlin",11],["Róma",10,"roma|rome"],["Madrid",9],["Budapest",8],["Bécs",6,"becs|wien|vienna"],["Prága",5,"praga|prague"],["Athén",4,"athen|athens"],["Lisszabon",4,"lisbon"],["Varsó",3,"varso|warsaw"],["Amszterdam",3],["Brüsszel",2.5,"brussel|brussels"],["Dublin",2],["Helsinki",1.5],["Oslo",1.5],["Stockholm",1.5],["Koppenhága",1.2,"koppenhaga|copenhagen"],["Zágráb",1,"zagrab|zagreb"],["Pozsony",1,"bratislava"],["Belgrád",0.8,"belgrad|belgrade"],["Bukarest",0.7,"bucharest"],["Reykjavík",0.6,"reykjavik"],["Valletta",0.2],["Andorra la Vella",0.1,"andorra"],["Vaduz",0.1],["Moszkva",3,"moscow"],["Kijev",1.2,"kiev"],["Bern",1,"berne"],["Tallinn",1.2],["Riga",1.2],["Vilnius",1.2],["Szófia",0.9,"sofia"],["Ljubljana",0.9],["Szarajevó",0.7,"sarajevo"],["Tirana",0.5],["Skopje",0.5],["Minszk",0.5,"minsk"],["Luxembourg",0.5],["Podgorica",0.3],["Pristina",0.3],["Chisinau",0.3,"kisinyov"],["Nicosia",0.3,"nikozia"],["Vatikánváros",0.3,"vatikan"],["Monaco",0.2],["San Marino",0.15]]},
    {"p":"Nevezz meg egy gyümölcsöt, ami piros is lehet!","a":[["Alma",22],["Eper",18],["Cseresznye",12],["Meggy",7],["Málna",7,"malna"],["Görögdinnye",6,"gorogdinnye|dinnye"],["Ribizli",5],["Paradicsom",4],["Gránátalma",4,"granatalma"],["Vörös áfonya",1.5,"piros afonya|vörös áfonya"],["Licsi",1],["Csipkebogyó",0.8,"csipkebogyo"],["Sárkánygyümölcs",0.8,"sarkanygyumolcs|pitaja"],["Som",0.6],["Goji",0.5,"goji bogyo"],["Kaktuszfüge",0.3,"kaktuszfuge"],["Berkenye",0.2],["Szamóca",1.5],["Piros szőlő",1.2],["Mangó",1],["Őszibarack",1],["Vérnarancs",1,"piros narancs"],["Piros grapefruit",0.7,"grapefruit"],["Piros körte",0.8],["Papaya",0.4],["Galagonya",0.5],["Cseresznyeszilva",0.5],["Rambutan",0.3],["Piros banán",0.3],["Madárbirs",0.3],["Tamarillo",0.15],["Vörös ribizli",0.8,"piros ribizli"],["Barack",0.8,"kajszi|kajszibarack"],["Cseresznyeparadicsom",0.4]]},
    {"p":"Nevezz meg egy hangszert!","a":[["Gitár",20,"gitar"],["Zongora",18],["Dob",10],["Hegedű",9,"hegedu"],["Fuvola",7],["Trombita",5],["Szaxofon",4],["Cselló",4,"csello"],["Klarinét",3,"klarinet"],["Basszusgitár",3,"basszusgitar|basszus"],["Hárfa",2.5,"harfa"],["Harmonika",2],["Orgona",2],["Furulya",1.5],["Citera",1.5],["Cimbalom",1.2],["Tuba",1],["Oboa",0.9],["Duda",0.8],["Tárogató",0.4,"tarogato"],["Okarina",0.3],["Tekerőlant",0.15,"tekerolant"],["Teremin",0.1,"theremin"],["Üvegharmonika",0.05,"uvegharmonika"],["Ukulele",0.8],["Mandolin",0.7],["Szintetizátor",2,"szinti"],["Xilofon",1,"xylofon"],["Cintányér",1.2,"cinel"],["Triangulum",1.2],["Kürt",1.2],["Harsona",1.2,"pozan"],["Fagott",0.8],["Bendzsó",0.6,"banjo"],["Szitár",0.3,"sitar"],["Gong",0.8],["Tamburin",1,"csorgodob"],["Marimba",0.4],["Kalimba",0.3],["Didzseridu",0.5],["Pánsíp",0.5],["Lant",0.6],["Koboz",0.4],["Cajón",0.2],["Bongó",0.4],["Dobfelszerelés",1,"dobszerko"],["Brácsa",1.2,"viola"],["Nagybőgő",1.5,"bogo"],["Elektromos gitár",2,"e-gitar|elektromos"],["Akusztikus gitár",1],["Szájharmonika",2],["Piccolo",0.5],["Angolkürt",0.2],["Harmónium",0.3],["Billentyű",0.5,"keyboard|billentyus"]]},
    {"p":"Nevezz meg egy tengeri élőlényt!","a":[["Cápa",18,"capa"],["Delfin",15],["Bálna",12,"balna"],["Rák",8,"rak"],["Polip",8],["Medúza",7,"meduza"],["Tengeri csillag",5],["Tintahal",4],["Tengeri teknős",4,"teknos|teknőc"],["Kagyló",3,"kagylo"],["Rája",2.5,"raja"],["Fóka",2,"foka"],["Homár",2,"homar"],["Angolna",1.5],["Korall",1.5],["Tengeri csikó",1.5,"tengeri csiko|csikohal"],["Krill",1.2],["Rozmár",1.2,"rozmar"],["Moréna",0.8,"morena"],["Szivacs",0.8],["Narvál",0.5,"narval"],["Ördöghal",0.4,"ordoghal"],["Tengeri uborka",0.4],["Nautilusz",0.3],["Lámpáshal",0.2,"lampashal"],["Tonhal",2],["Lazac",1.5],["Hering",1],["Kardhal",1],["Barrakuda",0.4],["Tengeri sün",1.5],["Garnélarák",2,"garnela"],["Languszta",0.8],["Fésűkagyló",0.4],["Osztriga",1.5],["Kalmár",1.2],["Szépia",0.6,"sepia"],["Cetcápa",0.5],["Óriáspolip",0.3],["Manta",1.2,"mantaraja"],["Pörölycápa",0.6],["Bohóchal",2,"nemo"],["Papagájhal",0.5],["Orka",2,"kardszarnyu delfin"],["Manátusz",0.5,"tengeri tehen"],["Tengeri vidra",0.6],["Tengeri csiga",0.5],["Hínár",0.3],["Plankton",1.2],["Tengeri kígyó",0.5]]},
    {"p":"Nevezz meg egy magyar várost!","a":[["Budapest",20],["Debrecen",12],["Szeged",9],["Pécs",8,"pecs"],["Győr",7,"gyor"],["Miskolc",6],["Eger",5],["Sopron",3],["Székesfehérvár",3,"szekesfehervar"],["Kecskemét",2.5,"kecskemet"],["Veszprém",2.5,"veszprem"],["Szombathely",2],["Nyíregyháza",2,"nyiregyhaza"],["Esztergom",1.5],["Szolnok",1.5],["Zalaegerszeg",1.5],["Siófok",1.5,"siofok"],["Békéscsaba",1,"bekescsaba"],["Tokaj",1.2],["Hódmezővásárhely",0.8,"hodmezovasarhely"],["Gyula",0.8],["Kalocsa",0.5],["Mohács",0.5,"mohacs"],["Sárospatak",0.4,"sarospatak"],["Tata",0.4],["Pannonhalma",0.2],["Hollókő",0.1,"hollokő|hollokõ"],["Szekszárd",1],["Kaposvár",1.2],["Nagykanizsa",0.8],["Dunaújváros",1],["Érd",1.2],["Tatabánya",1.2],["Salgótarján",0.8],["Balatonfüred",0.8],["Keszthely",1.2],["Hajdúszoboszló",1.5],["Gödöllő",0.8],["Szentendre",1],["Visegrád",0.8],["Vác",0.8],["Baja",0.6],["Orosháza",0.4],["Makó",0.4],["Szarvas",0.4],["Jászberény",0.4],["Gyöngyös",0.8],["Mosonmagyaróvár",0.4],["Kőszeg",0.6],["Pápa",0.6],["Ajka",0.3],["Paks",1],["Dombóvár",0.2],["Mezőkövesd",0.4],["Tiszaújváros",0.3],["Ózd",0.5],["Cegléd",0.6],["Szentes",0.3],["Kisvárda",0.3],["Hajdúböszörmény",0.8],["Hajdúnánás",0.2],["Berettyóújfalu",0.2],["Komló",0.3],["Siklós",0.2],["Villány",0.5],["Abádszalók",0.4],["Abaújszántó",0.4],["Abony",0.4],["Ács",0.4],["Adony",0.4],["Albertirsa",0.4],["Alsózsolca",0.4],["Aszód",0.4],["Bábolna",0.4],["Bácsalmás",0.4],["Badacsonytomaj",0.4],["Baktalórántháza",0.4],["Balassagyarmat",0.4],["Balatonalmádi",0.4],["Balatonboglár",0.4],["Balatonföldvár",0.4],["Balkány",0.4],["Barcs",0.4],["Bátonyterenye",0.4],["Battonya",0.4],["Bélapátfalva",0.4],["Békés",0.4],["Bóly",0.4],["Bonyhád",0.4],["Budakeszi",0.4],["Budaörs",0.4],["Cigánd",0.4],["Csenger",0.4],["Csepreg",0.4],["Csongrád",0.4],["Csorna",0.4],["Csurgó",0.4],["Dabas",0.4],["Derecske",0.4],["Devecser",0.4],["Dombrád",0.4],["Dunaföldvár",0.4],["Dunakeszi",0.4],["Dunavarsány",0.4],["Edelény",0.4],["Encs",0.4],["Enying",0.4],["Fehérgyarmat",0.4],["Fertőd",0.4],["Fonyód",0.4],["Gárdony",0.4],["Gyál",0.4],["Gyömrő",0.4],["Gyönk",0.4],["Hajós",0.4],["Halásztelek",0.4],["Harkány",0.4],["Hatvan",0.4],["Heves",0.4],["Hévíz",0.4],["Ibrány",0.4],["Isaszeg",0.4],["Izsák",0.4],["Jánossomorja",0.4],["Jászapáti",0.4],["Jászárokszállás",0.4],["Kapuvár",0.4],["Karcag",0.4],["Kazincbarcika",0.4],["Kemecse",0.4],["Kerepes",0.4],["Kiskőrös",0.4],["Kiskunfélegyháza",0.4],["Kiskunhalas",0.4],["Kiskunmajsa",0.4],["Komárom",0.4],["Körmend",0.4],["Kunszentmárton",0.4],["Lenti",0.4],["Létavértes",0.4],["Lajosmizse",0.4],["Letenye",0.4],["Mágocs",0.4],["Marcali",0.4],["Martfű",0.4],["Mátészalka",0.4],["Mezőberény",0.4],["Mezőcsát",0.4],["Mezőhegyes",0.4],["Mezőtúr",0.4],["Mór",0.4],["Nagyatád",0.4],["Nagykáta",0.4],["Nagykőrös",0.4],["Nyírbátor",0.4],["Nyíradony",0.4],["Ócsa",0.4],["Pásztó",0.4],["Pécel",0.4],["Pécsvárad",0.4],["Pilisvörösvár",0.4],["Polgár",0.4],["Püspökladány",0.4],["Pusztaszabolcs",0.4],["Rákóczifalva",0.4],["Rétság",0.4],["Sárbogárd",0.4],["Sárvár",0.4],["Sátoraljaújhely",0.4],["Sellye",0.4],["Sümeg",0.4],["Szabadszállás",0.4],["Szécsény",0.4],["Szentgotthárd",0.4],["Szigetszentmiklós",0.4],["Szigetvár",0.4],["Tab",0.4],["Tamási",0.4],["Tapolca",0.4],["Tiszafüred",0.4],["Tiszavasvári",0.4],["Tolna",0.4],["Törökszentmiklós",0.4],["Túrkeve",0.4],["Újfehértó",0.4],["Vámospércs",0.4],["Vasvár",0.4],["Várpalota",0.4],["Vecsés",0.4],["Velence",0.4],["Zalakaros",0.4],["Zirc",0.4],["Balatonfűzfő",0.4],["Ercsi",0.4],["Mélykút",0.4],["Kunszentmiklós",0.4],["Tótkomlós",0.4],["Gyomaendrőd",0.4],["Jánoshalma",0.4],["Bátaszék",0.4],["Dunaharaszti",0.4],["Százhalombatta",0.4],["Biatorbágy",0.4],["Törökbálint",0.4],["Diósd",0.4],["Szentlőrinc",0.4],["Hegyeshalom",0.4],["Lébény",0.4],["Tét",0.4],["Zsámbék",0.4],["Pomáz",0.4],["Veresegyház",0.4],["Fót",0.4],["Mogyoród",0.4],["Tura",0.4],["Ráckeve",0.4],["Szob",0.4],["Nagymaros",0.4],["Solymár",0.4],["Szigethalom",0.4],["Tököl",0.4],["Monor",0.4],["Üllő",0.4],["Maglód",0.4]],"wd":{"p17":"Q28","pop":true}},
    {"p":"Nevezz meg egy elemet a periódusos rendszerből!","a":[["Oxigén",15,"oxigen"],["Hidrogén",14,"hidrogen"],["Szén",10,"szen"],["Vas",9],["Arany",8],["Nitrogén",6,"nitrogen"],["Hélium",6,"helium"],["Ezüst",4,"ezust"],["Réz",3,"rez"],["Urán",3,"uran"],["Nátrium",2.5,"natrium"],["Klór",2,"klor"],["Kalcium",2],["Higany",2],["Ólom",2,"olom"],["Neon",1.5],["Cink",1.2],["Platina",1],["Kén",1,"ken"],["Foszfor",1],["Szilícium",1,"szilicium"],["Bór",0.5,"bor"],["Gallium",0.4],["Bizmut",0.3],["Ozmium",0.1],["Lantán",0.1,"lantan"],["Lítium",2.2],["Magnézium",2],["Alumínium",3.5],["Titán",1.5],["Króm",1.2],["Nikkel",1.2],["Kobalt",1],["Mangán",0.7],["Jód",1.2],["Fluor",1],["Bróm",0.6],["Argon",1.2],["Kripton",0.8],["Xenon",0.8],["Radon",1],["Rádium",0.8],["Plutónium",1.2],["Kálium",1.8],["Arzén",0.8],["Ón",1],["Volfrám",0.8,"wolfram"],["Palládium",0.4],["Berillium",0.5],["Bárium",0.5],["Stroncium",0.4],["Cézium",0.4],["Rubídium",0.2],["Antimon",0.4],["Tallium",0.3],["Kadmium",0.5],["Szelén",0.4],["Tellúr",0.2],["Germánium",0.2],["Cirkónium",0.2],["Molibdén",0.3],["Vanádium",0.3],["Neodímium",0.2],["Európium",0.1],["Oganesszon",0.02],["Einsteinium",0.03],["Kalifornium",0.03],["Hafnium",0.05],["Tantál",0.1],["Irídium",0.2],["Ródium",0.1],["Rénium",0.05],["Technécium",0.1],["Prométium",0.05],["Nobélium",0.03]],"wd":{"p31":["Q11344"]}},
    {"p":"Nevezz meg egy zöldséget!","a":[["Répa",12,"sargarepa|sárgarépa|repa"],["Paradicsom",11],["Burgonya",10,"krumpli"],["Uborka",9],["Paprika",9],["Hagyma",8,"voroshagyma|vöröshagyma"],["Brokkoli",5],["Káposzta",4,"kaposzta"],["Cukkini",3.5],["Karfiol",3],["Spenót",3,"spenot"],["Padlizsán",2,"padlizsan"],["Fokhagyma",2],["Zeller",1.5],["Kukorica",1.5],["Borsó",1.5,"borso|zoldborso"],["Retek",1.2],["Sütőtök",1.2,"sutotok|toktok"],["Spárga",1,"sparga"],["Karalábé",0.8,"karalabe"],["Kelkáposzta",0.8,"kelkaposzta"],["Cékla",0.8,"cekla"],["Édesburgonya",0.7,"edesburgonya"],["Kelbimbó",0.6,"kelbimbo"],["Pasztinák",0.5,"pasztinak"],["Articsóka",0.4,"articsoka"],["Mángold",0.4,"mangold"],["Torma",0.3],["Rebarbara",0.1],["Édeskömény",0.5],["Póréhagyma",1.5,"poreh"],["Zöldbab",1.8,"bab"],["Csicseriborsó",0.4,"csicseri"],["Saláta",3],["Rukkola",0.8],["Kínai kel",0.5],["Pak choi",0.2],["Újhagyma",1],["Fehérrépa",0.5],["Petrezselyemgyökér",0.6,"petrezselyem"],["Patisszon",0.3],["Gomba",1.5],["Okra",0.3],["Csicsóka",0.3,"topinambur"],["Lilahagyma",0.5],["Mogyoróhagyma",0.3],["Cukorborsó",0.3],["Szójabab",0.2],["Daikon",0.15,"kinai retek"],["Vöröskáposzta",1],["Romanesco",0.15],["Chili",1,"csipos paprika"],["Pritaminpaprika",1.2,"pritamin"],["Tök",2]]},
    {"p":"Nevezz meg egy sportágat!","a":[["Foci",25,"labdarugas|futball"],["Kosárlabda",10,"kosarlabda|kosar"],["Tenisz",9],["Úszás",8,"uszas"],["Kézilabda",6,"kezilabda"],["Röplabda",5,"roplabda"],["Atlétika",4,"atletika|futas"],["Jégkorong",4,"jegkorong|hoki"],["Vízilabda",3.5,"vizilabda"],["Torna",3],["Kerékpározás",2.5,"kerekparozas|biciklizes"],["Vívás",2,"vivas"],["Birkózás",1.8,"birkozas"],["Íjászat",1.5,"ijaszat"],["Golf",1.5],["Rögbi",1.5,"rogbi"],["Lovaglás",1.2,"lovaglas"],["Curling",0.9],["Cselgáncs",0.8,"cselgancs|judo"],["Kajak-kenu",0.8,"kajak|kenu"],["Krikett",0.7,"cricket"],["Sziklamászás",0.6,"sziklamaszas"],["Modern ötpróba",0.4,"otproba|pentatlon"],["Skeleton",0.15],["Sepak takraw",0.05],["Triatlon",1],["Maratoni futás",0.6,"maraton"],["Sífutás",0.6],["Műkorcsolya",1],["Gyorskorcsolya",0.5],["Síugrás",0.6],["Snowboard",0.8],["Alpesi síelés",1.2,"sizes|sielés"],["Szörfözés",0.8,"szorf"],["Vitorlázás",0.8],["Evezés",1],["Ökölvívás",1.8,"boksz"],["Karate",1.2],["Taekwondo",1],["Asztalitenisz",2,"ping-pong|pingpong"],["Tollaslabda",1.5,"tollas"],["Squash",0.5],["Baseball",0.8],["Amerikai futball",0.8],["Softball",0.2],["Bowling",0.6],["Darts",0.4],["Biliárd",0.4],["Snooker",0.3],["Súlyemelés",1.2],["Gyaloglás",0.3],["Rúdugrás",0.4],["Magasugrás",0.3],["Távolugrás",0.3],["Gerelyhajítás",0.4],["Diszkoszvetés",0.4],["Kalapácsvetés",0.3],["Műugrás",0.4],["Szinkronúszás",0.3],["Ritmikus gimnasztika",0.5,"ritmikus"],["Parkour",0.2],["Gyephoki",0.5],["Sakk",0.5],["E-sport",0.2]]},
    {"p":"Nevezz meg egy színt!","a":[["Piros",20],["Kék",18,"kek"],["Zöld",16,"zold"],["Sárga",10,"sarga"],["Fekete",6],["Fehér",5,"feher"],["Narancs",5,"narancssarga"],["Lila",4],["Rózsaszín",3,"rozsaszin"],["Barna",3],["Szürke",2.5,"szurke"],["Vörös",1.5,"voros"],["Türkiz",1.5,"turkiz"],["Bordó",1.2,"bordo"],["Ibolya",1.2],["Arany",0.8],["Indigó",0.6,"indigo"],["Okker",0.4],["Bíbor",0.4,"bibor"],["Cián",0.3,"cian|cyan"],["Magenta",0.3],["Karmazsin",0.2],["Azúr",0.2,"azur"],["Világoskék",1.5],["Sötétkék",1.5],["Világoszöld",0.8],["Sötétzöld",0.8],["Citromsárga",0.8],["Mályva",0.5],["Levendula",0.4],["Smaragdzöld",0.5,"smaragd"],["Rubinvörös",0.2,"rubin"],["Korall",0.3],["Bézs",1],["Krémszín",0.3,"krem"],["Khaki",0.3],["Olívazöld",0.4,"oliva"],["Mentazöld",0.2,"menta"],["Tengerkék",0.3],["Égszínkék",0.5],["Ciklámen",0.2],["Pink",1.5],["Fukszia",0.2],["Ezüst",1],["Terrakotta",0.2],["Mahagóni",0.1],["Homok",0.15],["Mustár",0.2,"mustarsarga"],["Kobaltkék",0.2],["Zafírkék",0.1],["Mélykék",0.1]]},
    {"p":"Nevezz meg egy afrikai országot!","a":[["Egyiptom",16],["Dél-Afrika",12],["Nigéria",8,"nigeria"],["Kenya",8],["Marokkó",7,"marokko"],["Etiópia",5,"etiopia"],["Ghána",4,"ghana"],["Tunézia",4,"tunezia"],["Algéria",3.5,"algeria"],["Tanzánia",3,"tanzania"],["Szenegál",2.5,"szenegal"],["Uganda",2],["Kamerun",1.8],["Madagaszkár",1.8,"madagaszkar"],["Szomália",1.2,"szomalia"],["Namíbia",1.2,"namibia"],["Zimbabwe",1],["Botswana",0.8],["Mali",0.7],["Eritrea",0.4],["Szváziföld",0.3,"eswatini|svazifold"],["Dzsibuti",0.2],["Comore-szigetek",0.1,"comore"],["Angola",1.2],["Mozambik",1.2],["Zambia",1],["Malawi",0.6],["Ruanda",1],["Burundi",0.4],["Szudán",1.8],["Dél-Szudán",0.5],["Líbia",1.5],["Csád",0.6],["Niger",0.5],["Burkina Faso",0.4],["Elefántcsontpart",1.8],["Libéria",0.5],["Sierra Leone",0.5],["Guinea",0.5],["Gambia",0.4],["Zöld-foki Köztársaság",0.2,"zold-foki szigetek"],["Mauritánia",0.5],["Benin",0.3],["Togo",0.3],["Gabon",0.4],["Kongó",1.2,"kongoi koztarsasag"],["Kongói Demokratikus Köztársaság",0.8,"kongoi demokratikus"],["Közép-afrikai Köztársaság",0.3],["Egyenlítői-Guinea",0.2],["Lesotho",0.4],["Mauritius",0.4],["Seychelle-szigetek",0.3,"seychelles"],["Bissau-Guinea",0.1,"guinea-bissau"]],"wd":{"p31":["Q6256","Q3624078"],"p30":["Q15"]}},
    {"p":"Nevezz meg egy madarat!","a":[["Sas",12],["Veréb",11,"vereb"],["Galamb",10],["Varjú",8,"varju"],["Fecske",7],["Papagáj",6,"papagaj"],["Bagoly",6],["Gólya",5,"golya"],["Holló",5,"hollo"],["Szarka",4],["Pingvin",4],["Kolibri",3],["Sólyom",3,"solyom"],["Strucc",3],["Flamingó",2.5,"flamingo"],["Cinege",2],["Rigó",2,"rigo"],["Páva",1.8,"pava"],["Harkály",1.5,"harkaly"],["Pelikán",1.5,"pelikan"],["Daru",1.5],["Kakukk",1.5],["Tukán",1,"tukan"],["Albatrosz",1],["Kiwi",0.9],["Búbosbanka",0.8,"bubosbanka"],["Emu",0.7],["Kormorán",0.6,"kormoran"],["Kakapó",0.1,"kakapo"],["Fácán",1.5],["Fogoly",0.6],["Túzok",0.5],["Pacsirta",1.2],["Fülemüle",0.6],["Csalogány",0.8],["Vörösbegy",1.2],["Széncinege",0.8],["Kék cinege",0.5],["Seregély",0.8],["Csóka",0.6],["Vörös kánya",0.4],["Egerészölyv",0.8,"olyv"],["Karvaly",0.8],["Vércse",0.6],["Rétisas",0.4],["Parlagi sas",0.3],["Uhu",0.8],["Fülesbagoly",0.5],["Kuvik",0.3],["Gém",0.8],["Kócsag",0.4],["Kanalasgém",0.2],["Fekete gólya",0.3],["Hattyú",4],["Lúd",1.8],["Kacsa",5],["Liba",4],["Pulyka",2.5],["Tyúk",4],["Kakas",2.5],["Csirke",4],["Gyöngytyúk",0.6],["Sarlósfecske",0.5],["Jégmadár",0.6],["Szajkó",0.6],["Gyurgyalag",0.4],["Gerle",0.5],["Vadgalamb",0.3],["Kakadu",1.2],["Ara",0.5],["Hullámos papagáj",1.5,"hullamos"],["Kanári",1],["Nimfapapagáj",0.6,"nimfa"],["Sirály",1.8],["Császárpingvin",0.5],["Kondor",0.6],["Keselyű",1],["Dodó",0.4],["Paradicsommadár",0.3]]},
    {"p":"Nevezz meg egy tésztafélét!","a":[["Spagetti",22,"spaghetti"],["Penne",10],["Lasagne",6,"lasagna|lazanya"],["Tagliatelle",5],["Makaróni",5,"makaroni"],["Fusilli",5],["Gnocchi",4,"nyoki"],["Tortellini",3.5],["Ravioli",3.5],["Farfalle",3],["Fettuccine",2.5],["Rigatoni",2.2],["Cannelloni",2],["Tarhonya",1.5],["Galuska",1.5],["Nokedli",1.5],["Pappardelle",1.2],["Orecchiette",0.8],["Csipetke",0.7],["Bucatini",0.6],["Orzo",0.5,"risoni"],["Gemelli",0.3],["Cavatappi",0.1],["Trofie",0.1],["Rotini",0.8,"spiral"],["Linguine",1.2],["Tagliolini",0.3],["Capellini",0.2,"angyalhaj"],["Ziti",0.2],["Paccheri",0.1],["Conchiglie",0.4],["Agnolotti",0.2],["Cappelletti",0.1],["Tortelloni",0.3],["Vermicelli",0.5],["Ditalini",0.1],["Soba",0.6],["Udon",0.5],["Ramen",1.2],["Rizstészta",0.8],["Üvegtészta",0.4],["Metélt",1.5],["Cérnametélt",1],["Kockatészta",1,"kocka"],["Csigatészta",0.8,"csiga"],["Szarvacska",1],["Lebbencs",0.6],["Szaggatott",0.3],["Derelye",0.2],["Kiflitészta",0.3],["Radiatori",0.05],["Lumaconi",0.05]]},
    {"p":"Nevezz meg egy háziállatot!","a":[["Kutya",28,"eb"],["Macska",26,"cica"],["Nyúl",6,"hazinyul"],["Hörcsög",5],["Papagáj",4],["Aranyhal",4,"hal"],["Tengerimalac",3.5],["Teknős",3],["Ló",2.5],["Tyúk",1.5],["Disznó",1,"malac|sertes"],["Kecske",1.2],["Juh",0.8,"birka"],["Kanári",1],["Gekkó",1],["Kígyó",1.2],["Tarantula",0.5,"pok"],["Görény",0.6],["Csincsilla",0.8],["Patkány",0.8],["Egér",0.5],["Axolotl",0.4],["Díszhal",0.4],["Törpesün",0.3],["Iguána",0.4],["Kaméleon",0.3],["Szakállas agáma",0.3,"agama"],["Alpaka",0.2],["Láma",0.15],["Hasas disznó",0.1,"vietnami hasasdiszno"]]},
    {"p":"Nevezz meg egy fát!","a":[["Tölgy",14],["Fenyő",12],["Nyírfa",9,"nyir"],["Bükk",8],["Akác",8],["Fűz",6],["Szil",3],["Hárs",4],["Juhar",5],["Éger",2.5],["Cédrus",2.5],["Platán",2.5],["Gesztenye",3,"gesztenyefa"],["Dió",3,"diofa"],["Almafa",3,"alma"],["Cseresznyefa",2],["Körtefa",1.5],["Ciprus",1.5],["Pálma",2.5],["Eukaliptusz",1.5],["Bambusz",0.8],["Olajfa",1.8],["Lucfenyő",1.5],["Jegenyefenyő",0.8],["Mamutfenyő",0.6],["Vörösfenyő",0.8],["Tiszafa",0.4],["Ginkgo",0.4,"ginko"],["Kőris",1.2],["Nyárfa",2.5,"nyar"],["Vadgesztenye",2],["Eperfa",0.8],["Datolyapálma",0.3],["Banyánfa",0.2,"banyan"],["Baobab",0.8,"majomkenyerfa"],["Szekvoja",0.5,"sequoia"],["Mahagóni",0.2],["Teak",0.1],["Balzsafa",0.05],["Sárkányfa",0.05],["Kakaófa",0.2]]},
    {"p":"Nevezz meg egy európai országot!","a":[["Németország",12],["Franciaország",12],["Olaszország",12],["Spanyolország",12],["Egyesült Királyság",12,"anglia|nagy-britannia|uk|skocia"],["Magyarország",12],["Lengyelország",12],["Ausztria",6],["Svájc",6],["Hollandia",6],["Belgium",6],["Görögország",6],["Portugália",6],["Svédország",6],["Románia",6],["Csehország",6],["Ukrajna",6],["Oroszország",6],["Norvégia",3],["Dánia",3],["Finnország",3],["Írország",3],["Horvátország",3],["Szerbia",3],["Szlovákia",3],["Bulgária",3],["Törökország",3],["Szlovénia",1.5],["Litvánia",1.5],["Lettország",1.5],["Észtország",1.5],["Izland",1.5],["Fehéroroszország",1.5],["Bosznia-Hercegovina",1.5],["Albánia",1.5],["Észak-Macedónia",1.5,"macedonia"],["Moldova",1.5],["Luxemburg",0.7],["Montenegró",0.7],["Málta",0.7],["Ciprus",0.7],["Koszovó",0.7],["Liechtenstein",0.2],["Monaco",0.2],["San Marino",0.2],["Andorra",0.2],["Vatikán",0.2]],"wd":{"p31":["Q6256","Q3624078"],"p30":["Q46"]}},
    {"p":"Nevezz meg egy ázsiai országot!","a":[["Kína",12],["Japán",12],["India",12],["Dél-Korea",12],["Thaiföld",12],["Vietnám",6],["Indonézia",6],["Fülöp-szigetek",6],["Szaúd-Arábia",6],["Irán",6],["Irak",6],["Izrael",6],["Pakisztán",6],["Észak-Korea",6],["Malajzia",3],["Szingapúr",3],["Kazahsztán",3],["Mongólia",3],["Nepál",3],["Banglades",3],["Afganisztán",3],["Szíria",3],["Libanon",3],["Egyesült Arab Emírségek",3,"emirsegek|dubai"],["Jordánia",1.5],["Kuvait",1.5],["Katar",1.5],["Omán",1.5],["Jemen",1.5],["Mianmar",1.5,"burma"],["Kambodzsa",1.5],["Laosz",1.5],["Srí Lanka",1.5],["Üzbegisztán",1.5],["Grúzia",1.5],["Örményország",1.5],["Azerbajdzsán",1.5],["Bhután",0.7],["Brunei",0.7],["Kirgizisztán",0.7],["Tádzsikisztán",0.7],["Türkmenisztán",0.7],["Bahrein",0.7],["Palesztina",0.7],["Maldív-szigetek",0.2,"maldiv"],["Kelet-Timor",0.2],["Tajvan",0.2]],"wd":{"p31":["Q6256","Q3624078"],"p30":["Q48"]}},
    {"p":"Nevezz meg egy amerikai országot!","a":[["Egyesült Államok",12,"usa|amerika"],["Kanada",12],["Brazília",12],["Mexikó",12],["Argentína",12],["Kuba",6],["Chile",6],["Kolumbia",6],["Peru",6],["Venezuela",6],["Ecuador",3],["Bolívia",3],["Uruguay",3],["Paraguay",3],["Costa Rica",3],["Panama",3],["Jamaica",3],["Haiti",3],["Dominikai Köztársaság",3],["Guatemala",1.5],["Honduras",1.5],["Nicaragua",1.5],["El Salvador",1.5],["Belize",1.5],["Guyana",1.5],["Suriname",1.5],["Bahama-szigetek",1.5,"bahamak"],["Trinidad és Tobago",1.5,"trinidad"],["Barbados",0.7],["Grenada",0.7],["Antigua és Barbuda",0.7],["Saint Lucia",0.7],["Dominika",0.7],["Saint Kitts és Nevis",0.2],["Saint Vincent és a Grenadine-szigetek",0.2]],"wd":{"p31":["Q6256","Q3624078"],"p30":["Q49","Q18"]}},
    {"p":"Nevezz meg egy folyót!","a":[["Duna",12],["Tisza",12],["Rajna",12],["Nílus",12],["Amazonas",12],["Dráva",6],["Rába",6],["Mississippi",6],["Volga",6],["Szajna",6,"szena"],["Temze",6],["Dnyeper",6],["Jangce",6],["Sárga-folyó",6,"huang ho"],["Zala",3],["Hernád",3],["Körös",3],["Maros",3],["Sajó",3],["Ipoly",3],["Garam",3],["Vág",3],["Moldva",3],["Visztula",3],["Odera",3],["Rhône",3],["Pó",3],["Tigris",3],["Eufrátesz",3],["Gangesz",3],["Indus",3],["Kongó",3],["Zambézi",3],["Száva",3],["Szamos",1.5],["Berettyó",1.5],["Kapos",1.5],["Sió",1.5],["Zagyva",1.5],["Hortobágy",1.5],["Ebro",1.5],["Tajo",1.5],["Loire",1.5],["Elba",1.5],["Don",1.5],["Ob",1.5],["Léna",1.5],["Jenyiszej",1.5],["Amur",1.5],["Mekong",1.5],["Orinoco",1.5],["Niger",1.5],["Colorado",1.5],["Yukon",1.5],["Murray",1.5],["Lajta",0.7],["Marcal",0.7],["Répce",0.7],["Fekete-Körös",0.7],["Kraszna",0.7],["Bodrog",0.7],["Latorca",0.7],["Tarna",0.7],["Pinka",0.2],["Szinva",0.2],["Sebes-Körös",0.2]],"wd":{"p31":["Q4022"]}},
    {"p":"Nevezz meg egy hegyet vagy hegységet!","a":[["Mount Everest",12,"everest"],["Alpok",12],["Mátra",12],["Kékes",12,"kekestető"],["Kilimandzsáró",12],["Mont Blanc",6],["Bükk",6],["Tátra",6],["Kárpátok",6],["Himalája",6],["Andok",6],["Pireneusok",6],["Matterhorn",6],["Zempléni-hegység",3,"zemplen"],["Bakony",3],["Mecsek",3],["Vértes",3],["Pilis",3],["Börzsöny",3],["Gerecse",3],["K2",3],["Fudzsi",3,"fuji"],["Elbrusz",3],["Urál",3],["Kaukázus",3],["Sziklás-hegység",3],["Aconcagua",3],["Denali",3],["Vezúv",3],["Gerlachfalvi-csúcs",1.5,"gerlach"],["Gellért-hegy",1.5],["Szent György-hegy",1.5],["Badacsony",1.5],["Cserhát",1.5],["Grossglockner",1.5],["Zugspitze",1.5],["Olimposz",1.5],["Etna",1.5],["Kangcsendzsönga",1.5],["Lhotse",1.5],["Makalu",1.5],["Annapurna",1.5],["Chimborazo",1.5],["Sas-hegy",0.7],["Naszály",0.7],["Visegrádi-hegység",0.7],["Soproni-hegység",0.7],["Velencei-hegység",0.7],["Zselic",0.2],["Kőszegi-hegység",0.2]],"wd":{"p31":["Q8502","Q46831"]}},
    {"p":"Nevezz meg egy tavat!","a":[["Balaton",12],["Velencei-tó",12],["Fertő",12],["Tisza-tó",12],["Bajkál",12],["Genfi-tó",6],["Garda-tó",6],["Bodeni-tó",6],["Viktória-tó",6],["Aral-tó",6],["Kaszpi-tenger",6],["Hévízi-tó",3],["Orfűi-tó",3],["Kolon-tó",3],["Fehér-tó",3],["Szelidi-tó",3],["Ontario-tó",3],["Huron-tó",3],["Michigan-tó",3],["Erie-tó",3],["Ladoga",3],["Onyega",3],["Öreg-tó",1.5],["Kis-Balaton",1.5],["Maggiore-tó",1.5],["Lugánói-tó",1.5],["Tanganyika-tó",1.5],["Malawi-tó",1.5],["Titicaca-tó",1.5],["Nagy-Medve-tó",1.5],["Winnipeg-tó",1.5],["Ohridi-tó",0.7],["Bledi-tó",0.7],["Hallstatti-tó",0.7],["Königssee",0.7],["Sevan-tó",0.7],["Van-tó",0.7],["Morskie Oko",0.2],["Vörös-tó",0.2]],"wd":{"p31":["Q23397"]}},
    {"p":"Nevezz meg egy ruhadarabot!","a":[["Póló",12],["Nadrág",12],["Pulóver",12],["Kabát",12],["Zokni",12],["Sapka",12],["Farmer",12],["Ing",6],["Szoknya",6],["Ruha",6],["Dzseki",6],["Kalap",6],["Sál",6],["Kesztyű",6],["Cipő",6],["Csizma",6],["Szandál",6],["Papucs",6],["Rövidnadrág",6],["Alsónadrág",6],["Melltartó",6],["Mellény",3],["Kardigán",3],["Esőkabát",3],["Télikabát",3],["Trikó",3],["Leggings",3],["Melegítő",3],["Fürdőruha",3],["Bikini",3],["Nyakkendő",3],["Öv",3],["Harisnya",3],["Blúz",1.5],["Tunika",1.5],["Overall",1.5],["Kosztüm",1.5],["Kötény",1.5],["Pizsama",1.5],["Hálóing",1.5],["Köntös",1.5],["Fejpánt",1.5],["Kendő",1.5],["Zakó",1.5],["Öltöny",1.5],["Szmoking",1.5],["Poncsó",0.7],["Kaftán",0.7],["Kimonó",0.7],["Szári",0.7],["Sarong",0.7],["Bunda",0.7],["Ködmön",0.7],["Suba",0.7],["Szűr",0.7],["Mente",0.7],["Kalucsni",0.2],["Pelerin",0.2],["Kamásli",0.2],["Pantalló",0.2],["Zsabó",0.2],["Frakk",0.2]]},
    {"p":"Nevezz meg egy magyar ételt!","a":[["Gulyásleves",12,"gulyas"],["Pörkölt",12],["Lecsó",12],["Töltött káposzta",12],["Halászlé",12],["Rántott hús",12],["Paprikás csirke",12],["Palacsinta",12],["Húsleves",6],["Rakott krumpli",6],["Főzelék",6],["Paprikás krumpli",6],["Lángos",6],["Túrós csusza",6],["Kolbász",6],["Szalonna",6],["Kocsonya",6],["Pogácsa",6],["Székelygulyás",6],["Bableves",6],["Tökfőzelék",6],["Rántott sajt",6],["Bécsi szelet",6],["Hortobágyi palacsinta",6],["Gyümölcsleves",3],["Meggyleves",3],["Pacalpörkölt",3],["Szilvásgombóc",3],["Túrógombóc",3],["Sólet",3],["Hurka",3],["Tepertő",3],["Zsíros kenyér",3],["Töltött paprika",3],["Rizseshús",3],["Rakott káposzta",3],["Zöldbableves",3],["Gombapaprikás",3],["Cigánypecsenye",1.5],["Dödölle",1.5],["Bográcsgulyás",1.5],["Bakonyi sertésszelet",1.5],["Brassói aprópecsenye",1.5],["Vadas marha",1.5],["Betyárleves",1.5],["Lacipecsenye",1.5],["Szalontüdő",1.5],["Ludaskása",0.7],["Székelykáposzta",0.7],["Mákos tészta",0.7],["Tejbegríz",0.7],["Rókagombás",0.2],["Fogasfilé",0.2],["Fatányéros",0.2]]},
    {"p":"Nevezz meg egy süteményt vagy desszertet!","a":[["Dobostorta",12],["Rétes",12],["Somlói galuska",12],["Fagylalt",12],["Muffin",12],["Tiramisu",12],["Brownie",12],["Sacher-torta",6],["Linzer",6],["Kürtőskalács",6],["Bukta",6],["Képviselőfánk",6],["Eszterházy-torta",6],["Rigó Jancsi",6],["Krémes",6],["Túrógombóc",6],["Palacsinta",6],["Csokitorta",6],["Sajttorta",6],["Almáspite",6],["Mézeskalács",6],["Panna cotta",6],["Profiterol",6],["Macaron",6],["Fánk",6],["Briós",6],["Gesztenyepüré",3],["Flódni",3],["Zserbó",3],["Hókifli",3],["Vaníliás kifli",3],["Bejgli",3],["Lúdláb",3],["Rumos golyó",3],["Kókuszgolyó",3],["Baklava",3],["Churros",3],["Pavlova",3],["Crème brûlée",3],["Eclair",3],["Madeleine",3],["Croissant",3],["Gofri",3],["Balatoni szelet",1.5],["Francia krémes",1.5],["Rákóczi túrós",1.5],["Aranygaluska",1.5],["Gundel palacsinta",1.5],["Szaloncukor",1.5],["Csörögefánk",1.5],["Pozsonyi kifli",1.5],["Kakaós csiga",1.5],["Pischinger",1.5],["Feketeerdő torta",0.7],["Cannoli",0.7],["Cheesecake",0.7],["Zabajone",0.7],["Mille-feuille",0.7],["Salzburgi nokedli",0.2],["Kremsnitt",0.2]]},
    {"p":"Nevezz meg egy italt!","a":[["Víz",12],["Tej",12],["Kávé",12],["Tea",12],["Kóla",12],["Sör",12],["Bor",12],["Limonádé",12],["Narancslé",6],["Almalé",6],["Ásványvíz",6],["Szóda",6],["Kakaó",6],["Pálinka",6],["Whisky",6],["Vodka",6],["Fröccs",6],["Energiaital",6],["Cappuccino",3],["Espresso",3],["Latte",3],["Rum",3],["Gin",3],["Tequila",3],["Konyak",3],["Pezsgő",3],["Prosecco",3],["Unicum",3],["Jegeskávé",3],["Forralt bor",3],["Almabor",3],["Fanta",3],["Sprite",3],["Pepsi",3],["Tokaji",1.5],["Egri bikavér",1.5],["Törköly",1.5],["Likőr",1.5],["Kefir",1.5],["Sangria",1.5],["Mojito",1.5],["Margarita",1.5],["Martini",1.5],["Absinth",1.5],["Matcha",0.7],["Rooibos",0.7],["Chai",0.7],["Kombucha",0.7],["Ayran",0.7],["Lassi",0.7],["Maté",0.7],["Kvasz",0.2],["Cosmopolitan",0.2],["Pina colada",0.2]]},
    {"p":"Nevezz meg egy fűszert vagy gyógynövényt!","a":[["Paprika",12],["Só",12],["Bors",12],["Fokhagyma",12],["Petrezselyem",12],["Bazsalikom",12],["Oregánó",12],["Majoranna",12],["Kapor",6],["Kakukkfű",6],["Rozmaring",6],["Menta",6],["Fahéj",6],["Szegfűszeg",6],["Gyömbér",6],["Kömény",6],["Lestyán",6],["Babérlevél",3],["Zsálya",3],["Koriander",3],["Kurkuma",3],["Szerecsendió",3],["Vanília",3],["Kardamom",3],["Sáfrány",3],["Tárkony",3],["Citromfű",3],["Snidling",3],["Mustármag",3],["Ánizs",1.5],["Kamilla",1.5],["Csalán",1.5],["Levendula",1.5],["Római kömény",1.5],["Fűszerpaprika",1.5],["Szumák",1.5],["Szecsuáni bors",1.5],["Csillagánizs",1.5],["Galangál",1.5],["Tamarind",1.5],["Wasabi",1.5],["Zatar",0.7],["Asafoetida",0.7],["Fekete kömény",0.7]]},
    {"p":"Nevezz meg egy virágot!","a":[["Rózsa",12],["Tulipán",12],["Százszorszép",12],["Napraforgó",12],["Margaréta",12],["Orgona",12],["Hóvirág",12],["Liliom",12],["Gyöngyvirág",12],["Árvácska",12],["Nárcisz",6],["Szegfű",6],["Kankalin",6],["Búzavirág",6],["Pipacs",6],["Muskátli",6],["Petúnia",6],["Ibolya",6],["Jácint",6],["Krizantém",6],["Mályva",6],["Pitypang",6],["Írisz",3],["Dália",3],["Gerbera",3],["Orchidea",3],["Lótusz",3],["Fátyolvirág",3],["Boglárka",3],["Kökörcsin",3],["Gladiólusz",3],["Begónia",3],["Rezeda",3],["Hortenzia",1.5],["Mimóza",1.5],["Kamélia",1.5],["Azálea",1.5],["Rododendron",1.5],["Tűzliliom",1.5],["Szarkaláb",1.5],["Vadrózsa",1.5],["Gyopár",0.7],["Tárnics",0.7],["Kardvirág",0.7],["Kikerics",0.7],["Mák",0.7],["Rafflesia",0.2],["Kosbor",0.2]]},
    {"p":"Nevezz meg egy gyümölcsöt!","a":[["Alma",12],["Banán",12],["Körte",12],["Narancs",12],["Szőlő",12],["Eper",12],["Citrom",12],["Barack",12],["Meggy",6],["Cseresznye",6],["Szilva",6],["Dinnye",6],["Őszibarack",6],["Ananász",6],["Mandarin",6],["Kiwi",6],["Mangó",6],["Málna",6],["Szeder",6],["Grapefruit",3],["Áfonya",3],["Ribizli",3],["Egres",3],["Füge",3],["Datolya",3],["Gránátalma",3],["Papaya",3],["Avokádó",3],["Kókusz",3],["Maracuja",3],["Licsi",3],["Birsalma",1.5],["Naspolya",1.5],["Kökény",1.5],["Som",1.5],["Nektarin",1.5],["Mirabella",1.5],["Ringló",1.5],["Kaki",1.5],["Kumquat",1.5],["Pomelo",1.5],["Guava",1.5],["Durián",0.7],["Mangosztán",0.7],["Jackfruit",0.7],["Rambutan",0.7],["Longan",0.7],["Karambola",0.7],["Sárkánygyümölcs",0.7],["Noni",0.7],["Salak",0.7],["Cherimoya",0.7]]},
    {"p":"Nevezz meg egy emlős állatot!","a":[["Kutya",12],["Macska",12],["Ló",12],["Tehén",12],["Disznó",12],["Nyúl",12],["Egér",12],["Elefánt",12],["Oroszlán",12],["Tigris",12],["Medve",6],["Farkas",6],["Róka",6],["Szarvas",6],["Őz",6],["Vaddisznó",6],["Zsiráf",6],["Majom",6],["Kenguru",6],["Delfin",6],["Bálna",6],["Zebra",6],["Víziló",6],["Orrszarvú",6],["Gepárd",6],["Leopárd",6],["Mókus",3],["Sün",3],["Borz",3],["Nyest",3],["Menyét",3],["Vidra",3],["Hód",3],["Pocok",3],["Patkány",3],["Denevér",3],["Panda",3],["Koala",3],["Jegesmedve",3],["Rozmár",3],["Fóka",3],["Teve",3],["Láma",3],["Alpaka",3],["Bölény",3],["Jak",3],["Gorilla",3],["Csimpánz",3],["Orángután",3],["Hiéna",1.5],["Sakál",1.5],["Hiúz",1.5],["Puma",1.5],["Jaguár",1.5],["Ocelot",1.5],["Tapír",1.5],["Lajhár",1.5],["Hangyász",1.5],["Nyérc",1.5],["Görény",1.5],["Hermelin",1.5],["Coboly",1.5],["Mongúz",1.5],["Szurikáta",1.5],["Gazella",1.5],["Antilop",1.5],["Gnú",1.5],["Hörcsög",0.7],["Ürge",0.7],["Tasmán ördög",0.7],["Vombat",0.7],["Csőrös emlős",0.7,"ornitorinkusz"],["Okapi",0.7],["Narvál",0.7],["Manátusz",0.7],["Pangolin",0.7],["Kinkaju",0.7],["Aye-aye",0.2],["Binturong",0.2],["Fossza",0.2],["Dugong",0.2]]},
    {"p":"Nevezz meg egy rovart!","a":[["Méh",12],["Légy",12],["Szúnyog",12],["Hangya",12],["Darázs",12],["Pillangó",12],["Katica",12],["Szöcske",12],["Szitakötő",12],["Bogár",12],["Lepke",6],["Tücsök",6],["Poszméh",6],["Szarvasbogár",6],["Cserebogár",6],["Csótány",6],["Bolha",6],["Tetű",6],["Moly",6],["Kabóca",6],["Fülbemászó",6],["Sáska",3],["Imádkozó sáska",3],["Botsáska",3],["Lótücsök",3],["Hangyaleső",3],["Szúbogár",3],["Ganajtúró",3],["Aranybogár",3],["Levéltetű",3],["Poloska",3],["Kérész",3],["Álkérész",1.5],["Tűzlepke",1.5],["Pávaszem",1.5],["Atlaszlepke",1.5],["Halálfejes lepke",1.5],["Ászka",1.5],["Tripsz",1.5],["Cikád",1.5],["Fürkész",0.7],["Pajzstetű",0.7]]},
    {"p":"Nevezz meg egy dinoszauruszt!","a":[["Tyrannosaurus rex",12,"t-rex|t rex|tirannoszaurusz"],["Triceratops",12],["Velociraptor",12],["Brontosaurus",12],["Stegosaurus",12],["Diplodocus",6],["Brachiosaurus",6],["Spinosaurus",6],["Ankylosaurus",6],["Allosaurus",6],["Iguanodon",6],["Parasaurolophus",6],["Pachycephalosaurus",3],["Compsognathus",3],["Archaeopteryx",3],["Apatosaurus",3],["Carnotaurus",3],["Giganotosaurus",3],["Megalosaurus",3],["Dilophosaurus",3],["Gallimimus",3],["Therizinosaurus",1.5],["Oviraptor",1.5],["Baryonyx",1.5],["Argentinosaurus",1.5],["Microraptor",1.5],["Utahraptor",1.5],["Edmontosaurus",1.5],["Maiasaura",1.5],["Deinonychus",1.5],["Coelophysis",1.5],["Mamenchisaurus",0.7],["Kentrosaurus",0.7],["Plateosaurus",0.7],["Camarasaurus",0.7],["Troodon",0.7],["Albertosaurus",0.7],["Styracosaurus",0.7],["Protoceratops",0.7],["Eoraptor",0.2],["Herrerasaurus",0.2],["Amargasaurus",0.2],["Nigersaurus",0.2],["Suchomimus",0.2],["Tarbosaurus",0.2],["Telmatosaurus",0.2]]},
    {"p":"Nevezz meg egy égitestet!","a":[["Nap",12],["Hold",12],["Mars",12],["Vénusz",12],["Jupiter",12],["Szaturnusz",12],["Merkúr",12],["Föld",12],["Uránusz",12],["Neptunusz",12],["Plútó",12],["Szíriusz",6],["Sarkcsillag",6,"polaris"],["Androméda-galaxis",6],["Tejút",6],["Halley-üstökös",6,"halley"],["Orion-köd",6],["Phobos",6],["Deimos",6],["Io",6],["Európa",6],["Ganymedes",6],["Callisto",6],["Titán",6],["Enceladus",6],["Triton",6],["Charon",6],["Ceres",6],["Proxima Centauri",3],["Betelgeuse",3],["Rigel",3],["Vega",3],["Aldebaran",3],["Arcturus",3],["Eris",3],["Makemake",3],["Haumea",3],["Mimas",3],["Dione",3],["Rhea",3],["Iapetus",3],["Oberon",3],["Titania",3],["Miranda",3],["Umbriel",3],["Ariel",3],["Nereid",3],["TRAPPIST-1",1.5],["Alfa Centauri",1.5],["Barnard-csillaga",1.5],["Wolf 359",1.5],["Tau Ceti",1.5],["Gliese 581",1.5],["Kepler-22b",1.5]]},
    {"p":"Nevezz meg egy járművet!","a":[["Autó",12],["Busz",12,"autóbusz"],["Vonat",12],["Repülő",12,"repülőgép"],["Hajó",12],["Bicikli",12,"kerékpár"],["Motor",12,"motorkerékpár"],["Villamos",12],["Metró",12],["Taxi",12],["Teherautó",12],["Roller",6],["Kamion",6],["Tank",6],["Helikopter",6],["Traktor",6],["Troli",6,"trolibusz"],["Komp",6],["Vitorlás",6],["Csónak",6],["Kajak",6],["Kenu",6],["Szán",6],["Gördeszka",6],["Görkorcsolya",6],["Kocsi",6],["Szekér",6],["Mentőautó",6],["Tűzoltóautó",6],["Rendőrautó",6],["Léghajó",3],["Hőlégballon",3,"ballon"],["Űrhajó",3],["Rakéta",3],["Tengeralattjáró",3],["Jacht",3],["Ladik",3],["Kerekesszék",3],["Kismotor",3],["Quad",3],["Fogaskerekű",3],["Libegő",3],["Sikló",3],["Siklóernyő",3],["Segway",3],["Riksa",3],["Tuk-tuk",3],["Lovaskocsi",3],["Fiáker",3],["Hintó",3],["Gokart",3],["Hidrofoil",1.5],["Légpárnás hajó",1.5],["Kotrógép",1.5],["Daru",1.5],["Markológép",1.5],["Buldózer",1.5],["Úthenger",1.5],["Hókotró",1.5],["Dzsonka",1.5],["Gondola",1.5],["Monorail",1.5],["Drezina",1.5],["Zeppelin",0.7],["Cirkáló",0.7],["Anyahajó",0.7],["Teherhajó",0.7],["Gőzmozdony",0.7],["Gőzhajó",0.7],["Gyorsvonat",0.7]]},
    {"p":"Nevezz meg egy szerszámot!","a":[["Kalapács",12],["Csavarhúzó",12],["Fogó",12],["Fűrész",12],["Olló",12],["Véső",12],["Reszelő",12],["Csavarkulcs",6],["Franciakulcs",6],["Fúró",6],["Gyalu",6],["Vízmérték",6],["Mérőszalag",6],["Balta",6],["Csákány",6],["Ásó",6],["Kapa",6],["Gereblye",6],["Vasvilla",6],["Lapát",6],["Kasza",6],["Sarló",6],["Metszőolló",6],["Szögfogó",3],["Imbuszkulcs",3],["Villáskulcs",3],["Dugókulcs",3],["Fúrógép",3],["Csiszoló",3],["Flex",3],["Sarokcsiszoló",3],["Szike",3],["Spatulya",3],["Simító",3],["Kőműveskanál",3],["Sablon",3],["Satu",3],["Vonókés",1.5],["Tárcsás fűrész",1.5],["Szegecselő",1.5],["Pillanatszorító",1.5],["Hajlítógép",1.5],["Ráspoly",1.5],["Kézi gyalu",1.5],["Dörzsár",0.7],["Menetfúró",0.7],["Tolómérő",0.7],["Mikrométer",0.7],["Ékkulcs",0.7]]},
    {"p":"Nevezz meg egy konyhai eszközt!","a":[["Kés",12],["Villa",12],["Kanál",12],["Tányér",12],["Pohár",12],["Serpenyő",12],["Fazék",12],["Lábas",12],["Tepsi",12],["Sodrófa",12],["Fakanál",12],["Merőkanál",6],["Habverő",6],["Reszelő",6],["Szita",6],["Tölcsér",6],["Evőpálcika",6],["Kávéfőző",6],["Turmixgép",6],["Botmixer",6],["Robotgép",6],["Húsdaráló",6],["Fokhagymanyomó",6],["Zöldségpucoló",6],["Palacsintasütő",6],["Kuktafazék",6],["Wok",6],["Mozsár",6],["Teáskanna",6],["Tálca",6],["Spatula",6],["Hőmérő",3],["Konzervnyitó",3],["Dugóhúzó",3],["Tésztaszűrő",3],["Késélező",3],["Kenyérvágó",3],["Szeletelő",3],["Gyümölcscentrifuga",3],["Vízforraló",3],["Kenyérpirító",3],["Mikrohullámú sütő",3,"mikró"],["Fagyasztó",3],["Mosogatógép",3],["Szószkanál",1.5],["Pástétomforma",1.5],["Hústűző",1.5],["Gombóckiszúró",1.5],["Citrusprés",1.5],["Pizzavágó",1.5],["Tésztagép",1.5],["Kuglófforma",1.5],["Perecsütő",1.5]]},
    {"p":"Nevezz meg egy foglalkozást!","a":[["Tanár",12],["Orvos",12],["Ápoló",12],["Rendőr",12],["Tűzoltó",12],["Pék",12],["Szakács",12],["Pincér",12],["Sofőr",12],["Építész",12],["Villanyszerelő",12],["Programozó",12],["Mérnök",12],["Ügyvéd",12],["Bíró",12],["Fodrász",12],["Eladó",12],["Gazdálkodó",6,"farmer"],["Ács",6],["Asztalos",6],["Kőműves",6],["Szobafestő",6],["Vízvezeték-szerelő",6,"vízszerelő"],["Kovács",6],["Cipész",6],["Szabó",6],["Hentes",6],["Halász",6],["Pásztor",6],["Postás",6],["Pilóta",6],["Színész",6],["Zenész",6],["Festő",6],["Író",6],["Újságíró",6],["Fotós",6],["Gyógyszerész",6],["Fogorvos",6],["Állatorvos",6],["Kémikus",3],["Fizikus",3],["Csillagász",3],["Régész",3],["Történész",3],["Mentős",3],["Katona",3],["Matróz",3],["Kéményseprő",3],["Bányász",3],["Üvegfúvó",3],["Kosárfonó",3],["Fazekas",3],["Kerékgyártó",3],["Bognár",3],["Molnár",3],["Pszichológus",3],["Könyvelő",3],["Titkár",3],["Recepciós",3],["Takarító",3],["Biztonsági őr",3],["Gemológus",1.5],["Szőlész",1.5],["Borász",1.5],["Méhész",1.5],["Erdész",1.5],["Vadász",1.5],["Halőr",1.5],["Kőfaragó",1.5],["Hímző",1.5],["Cukrász",1.5],["Gyorsíró",1.5],["Fordító",1.5],["Tolmács",1.5],["Műszerész",0.7],["Órás",0.7],["Ötvös",0.7],["Kalapos",0.7],["Csizmadia",0.7],["Takács",0.7],["Tímár",0.7],["Szíjgyártó",0.7],["Kádár",0.7],["Ostyasütő",0.7]]},
    {"p":"Nevezz meg egy iskolai tantárgyat!","a":[["Matematika",12,"matek"],["Magyar",12],["Történelem",12],["Fizika",12],["Kémia",12],["Biológia",12],["Földrajz",12],["Angol",12],["Német",12],["Ének",12],["Rajz",12],["Testnevelés",12],["Informatika",12],["Technika",6],["Irodalom",6],["Nyelvtan",6],["Erkölcstan",6],["Hittan",6],["Osztályfőnöki",6],["Latin",6],["Francia",6],["Spanyol",6],["Természetismeret",6],["Környezetismeret",6],["Olvasás",6],["Írás",6],["Művészettörténet",3],["Filozófia",3],["Pszichológia",3],["Közgazdaságtan",3],["Etika",3],["Dráma",3],["Mozgóképkultúra",3],["Tánc",3],["Számtan",3],["Háztartástan",3],["Ábrázoló geometria",1.5],["Statisztika",1.5],["Jog",1.5],["Szociológia",1.5],["Logika",1.5],["Retorika",1.5],["Kézügyesség",1.5],["Asztronómia",0.7],["Gépírás",0.7],["Ókori görög",0.7],["Héber",0.7]]},
    {"p":"Nevezz meg egy testrészt!","a":[["Fej",12],["Haj",12],["Szem",12],["Orr",12],["Száj",12],["Fül",12],["Nyak",12],["Váll",12],["Kar",12],["Kéz",12],["Ujj",12],["Mellkas",12],["Has",12],["Hát",12],["Láb",12],["Térd",12],["Boka",12],["Talp",12],["Lábujj",12],["Comb",6],["Könyök",6],["Csukló",6],["Fog",6],["Nyelv",6],["Ajak",6],["Áll",6],["Homlok",6],["Arc",6],["Szemöldök",6],["Szempilla",6],["Köldök",6],["Derék",6],["Csípő",6],["Sarok",6],["Lábszár",6],["Alkar",6],["Felkar",6],["Tenyér",6],["Köröm",6],["Hüvelykujj",6],["Mutatóujj",6],["Halánték",3],["Torok",3],["Gége",3],["Orrcimpa",3],["Pofa",3],["Orrlyuk",3],["Fülcimpa",3],["Állkapocs",3],["Lapocka",3],["Kulcscsont",3],["Gerinc",3],["Ágyék",3],["Vádli",3],["Belső comb",3],["Nyakszirt",3],["Tarkó",3],["Orrnyereg",1.5],["Szemgolyó",1.5],["Pupilla",1.5],["Szivárványhártya",1.5],["Ínhüvely",1.5],["Kisujj",1.5],["Gyűrűsujj",1.5],["Középső ujj",1.5],["Hüvelykujjtőpercs",1.5],["Dobhártya",0.7],["Fülkagyló",0.7],["Nyelvcsap",0.7],["Lágyék",0.7],["Térdkalács",0.7],["Sarokcsont",0.7]]},
    {"p":"Nevezz meg egy zenei műfajt!","a":[["Pop",12],["Rock",12],["Jazz",12],["Metál",12],["Rap",12],["Hip-hop",12],["Techno",12],["House",12],["Country",12],["Blues",12],["Reggae",12],["Klasszikus",12],["Opera",6],["Folk",6],["Punk",6],["Disco",6],["Soul",6],["Funk",6],["R&B",6],["Latin",6],["Szving",6,"swing"],["Ska",6],["Grunge",6],["Indie",6],["Elektronikus",6],["Dubstep",6],["Drum and bass",6],["Trance",6],["Hard rock",6],["Gospel",6],["Bossa nova",3],["Flamenco",3],["Tangó",3],["Népzene",3],["Operett",3],["Alternatív",3],["Death metal",3],["Black metal",3],["Gregorián",3],["Ambient",3],["Lo-fi",3],["Trap",3],["Fado",1.5],["Polka",1.5],["Valcer",1.5],["Mazurka",1.5],["Csárdás",1.5],["Verbunkos",1.5],["Zydeco",1.5],["Bluegrass",1.5],["Chanson",1.5],["Throat singing",0.7],["Kantele",0.7],["Qawwali",0.7],["Gamelan",0.7],["Rembetiko",0.7]]},
    {"p":"Nevezz meg egy tengert vagy óceánt!","a":[["Atlanti-óceán",12],["Csendes-óceán",12],["Indiai-óceán",12],["Földközi-tenger",12],["Fekete-tenger",12],["Adriai-tenger",12,"adria"],["Északi-sarki-óceán",6],["Balti-tenger",6],["Északi-tenger",6],["Vörös-tenger",6],["Holt-tenger",6],["Karib-tenger",6],["Dél-kínai-tenger",6],["Japán-tenger",6],["Égei-tenger",6],["Jón-tenger",3],["Tirrén-tenger",3],["Ligur-tenger",3],["Azovi-tenger",3],["Márvány-tenger",3],["Fehér-tenger",3],["Barents-tenger",3],["Bering-tenger",3],["Arab-tenger",3],["Sárga-tenger",3],["Koral-tenger",1.5],["Tasman-tenger",1.5],["Timor-tenger",1.5],["Szargasszó-tenger",1.5],["Ross-tenger",1.5],["Weddell-tenger",1.5],["Labrador-tenger",1.5],["Norvég-tenger",1.5],["Kara-tenger",1.5],["Beaufort-tenger",1.5],["Laptyev-tenger",0.7],["Ohotszki-tenger",0.7],["Kelet-szibériai-tenger",0.7],["Chukcs-tenger",0.7],["Szulu-tenger",0.7]],"wd":{"p31":["Q165","Q9430","Q37901"]}},
    {"p":"Nevezz meg egy szigetet!","a":[["Szicília",12],["Szardínia",12],["Korzika",12],["Málta",12],["Ciprus",12],["Kréta",12],["Mallorca",12],["Ibiza",12],["Izland",12],["Írország",12],["Nagy-Britannia",12],["Grönland",12],["Hawaii",12],["Madagaszkár",12],["Kuba",12],["Rodosz",6],["Korfu",6],["Menorca",6],["Madeira",6],["Bali",6],["Jáva",6],["Szumátra",6],["Borneó",6],["Jamaica",6],["Haiti",6],["Tahiti",6],["Tasmania",6],["Szahalin",6],["Hokkaidó",6],["Honshu",6],["Srí Lanka",6],["Zanzibár",6],["Santorini",6],["Mykonos",6],["Capri",6],["Elba",3],["Wight-sziget",3],["Man-sziget",3],["Gotland",3],["Bornholm",3],["Rügen",3],["Csepel",3],["Szentendrei-sziget",3],["Margit-sziget",3],["Hajógyári-sziget",3],["Óbudai-sziget",3],["Fidzsi-szigetek",3],["Húsvét-sziget",3],["Galápagos",3],["Helgoland",1.5],["Feröer-szigetek",1.5,"feroer"],["Lampedusa",1.5],["Kyushu",1.5],["Shikoku",1.5],["Hiiumaa",1.5],["Saaremaa",1.5],["Lofoten",1.5]],"wd":{"p31":["Q23442"]}},
    {"p":"Nevezz meg egy magyar megyét!","a":[["Pest",12],["Borsod-Abaúj-Zemplén",12,"borsod"],["Hajdú-Bihar",12],["Szabolcs-Szatmár-Bereg",12,"szabolcs"],["Fejér",12],["Veszprém",12],["Győr-Moson-Sopron",12],["Zala",12],["Somogy",12],["Baranya",12],["Jász-Nagykun-Szolnok",6],["Heves",6],["Nógrád",6],["Komárom-Esztergom",6],["Vas",6],["Tolna",6],["Bács-Kiskun",6],["Csongrád-Csanád",6,"csongrad"],["Békés",6]]},
    {"p":"Nevezz meg egy nyelvet!","a":[["Magyar",12],["Angol",12],["Német",12],["Francia",12],["Spanyol",12],["Olasz",12],["Orosz",12],["Kínai",12],["Japán",12],["Arab",12],["Portugál",6],["Török",6],["Hindi",6],["Koreai",6],["Lengyel",6],["Holland",6],["Svéd",6],["Dán",6],["Norvég",6],["Finn",6],["Görög",6],["Héber",6],["Román",6],["Cseh",6],["Szlovák",6],["Szerb",6],["Horvát",6],["Bolgár",6],["Ukrán",6],["Latin",6],["Észt",3],["Lett",3],["Litván",3],["Albán",3],["Thai",3],["Vietnami",3],["Indonéz",3],["Perzsa",3],["Szuahéli",3],["Eszperantó",3],["Katalán",3],["Baszk",3],["Ír",3],["Walesi",3],["Izlandi",3],["Máltai",3],["Jiddis",3],["Maori",1.5],["Zulu",1.5],["Tibeti",1.5],["Mongol",1.5],["Urdu",1.5],["Bengáli",1.5],["Tamil",1.5],["Romani",1.5],["Szlovén",1.5],["Macedón",1.5],["Grúz",1.5],["Örmény",1.5],["Okszitán",0.7],["Szardíniai",0.7],["Feröeri",0.7],["Számi",0.7],["Kurd",0.7],["Pastu",0.7],["Hausza",0.7],["Amhara",0.7],["Navahó",0.7],["Guarani",0.7],["Kecsua",0.7]],"wd":{"p31":["Q34770","Q1288568"]}},
    {"p":"Nevezz meg egy pénznemet!","a":[["Forint",12],["Euró",12],["Dollár",12,"amerikai dollár|usd"],["Font",12,"angol font"],["Jen",12,"japán jen"],["Frank",6,"svájci frank"],["Cseh korona",6,"korona"],["Zloty",6],["Rubel",6],["Jüan",6,"renminbi"],["Rúpia",6],["Lej",6,"román lej"],["Dinár",6],["Lira",6,"török líra"],["Peso",6],["Real",6,"brazil real"],["Won",6],["Baht",6],["Dirham",3],["Rand",3],["Dán korona",3],["Svéd korona",3],["Norvég korona",3],["Kanadai dollár",3],["Ausztrál dollár",3],["Hrivnya",3],["Leva",3,"bolgár leva"],["Kuna",1.5],["Lari",1.5],["Dram",1.5],["Tenge",1.5],["Kwacha",0.7],["Naira",0.7],["Birr",0.7],["Cedi",0.7],["Shilling",0.7],["Riyal",0.7],["Rial",0.7],["Taka",0.7]],"wd":{"p31":["Q8142"]}},
    {"p":"Nevezz meg egy hüllőt vagy kétéltűt!","a":[["Béka",12],["Varangy",12],["Gyík",12],["Kígyó",12],["Teknős",12],["Krokodil",12],["Gekkó",12],["Kaméleon",12],["Szalamandra",12],["Gőte",12],["Aligátor",6],["Iguána",6],["Pitón",6],["Kobra",6],["Vipera",6],["Keresztes vipera",6],["Rézsikló",6],["Vízisikló",6],["Zöld gyík",6],["Fürge gyík",6],["Mocsári teknős",6],["Varánusz",6],["Anakonda",6],["Boa",6],["Csörgőkígyó",6],["Komodói varánusz",3],["Mamba",3],["Axolotl",3],["Tarajos gőte",3],["Foltos szalamandra",3],["Levelibéka",3],["Nílusi krokodil",3],["Gaviál",3],["Szakállas agáma",3],["Tuatara",3],["Taipán",1.5],["Szarvas vipera",1.5],["Gyémánthátú csörgőkígyó",1.5],["Madagaszkári levélfarkú gekkó",1.5],["Bőrhátú tengeri teknős",1.5],["Tengeri iguána",1.5],["Óriás szalamandra",1.5]]}
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
/* Ide írd a Cloudflare Worker címét (lásd worker.js). Ha üres, csak a beépített lista és a Wikidata dönt. */
const AI_URL: string = "";

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
function dayIndex(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  const [y0, m0, d0] = START_DAY.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y0, m0 - 1, d0)) / 864e5);
}
function shuffle<T>(a: T[], r: () => number): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
let PERM: number[] | null = null;
function perm(): number[] {
  if (!PERM) PERM = shuffle(Q.map((_, i) => i), rng(hash("rakillio-perm")));
  return PERM;
}
/* A napi kérdéssor: a kérdések fix, kevert sorrendben követik egymást, naponta 7 újabb jön.
   Az első megnyitáskor eltároljuk, így később is ugyanaz marad. */
function pickOrder(practice: boolean, day: string): number[] {
  if (practice) return shuffle(Q.map((_, i) => i), Math.random).slice(0, 7);
  const st = lsGet<number[]>("melyviz:set:" + day);
  if (st && st.length === 7 && st.every((i) => Q[i])) return st;
  const P = perm();
  const n = P.length;
  const s = (((dayIndex(day) * 7) % n) + n) % n;
  const res: number[] = [];
  for (let i = 0; i < 7; i++) res.push(P[(s + i) % n]);
  shuffle(res, rng(hash("o-" + day)));
  lsSet("melyviz:set:" + day, res);
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

/* ---------- Ismeretlen válasz ellenőrzése a Wikidata nyílt adatbázisában ---------- */
type Claim = { mainsnak?: { datavalue?: { value?: { id?: string } } } };
type Entity = { claims?: Record<string, Claim[]>; labels?: Record<string, { value: string }> };

async function webCheck(q: Question, text: string): Promise<string | null> {
  const wd = q.wd;
  const n = norm(text);
  if (!wd || n.length < 3 || navigator.onLine === false) return null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 6000);
  try {
    const base = "https://www.wikidata.org/w/api.php?format=json&origin=*";
    const s = (await (await fetch(`${base}&action=wbsearchentities&language=hu&uselang=hu&limit=8&search=${encodeURIComponent(text)}`, { signal: ctl.signal })).json()) as {
      search?: { id: string; label?: string; match?: { text?: string } }[];
    };
    const ids = (s.search || [])
      .filter((x) => norm(x.label || "") === n || norm(x.match?.text || "") === n)
      .map((x) => x.id)
      .slice(0, 5);
    if (!ids.length) return null;
    const r = (await (await fetch(`${base}&action=wbgetentities&props=claims|labels&languages=hu|en&ids=${ids.join("|")}`, { signal: ctl.signal })).json()) as {
      entities?: Record<string, Entity>;
    };
    for (const id of ids) {
      const e = r.entities?.[id];
      if (!e) continue;
      const c = e.claims || {};
      const get = (p: string) => (c[p] || []).map((x) => x.mainsnak?.datavalue?.value?.id).filter((x): x is string => !!x);
      const has = (p: string, list?: string[]) => !list || get(p).some((x) => list.includes(x));
      const ok = has("P31", wd.p31) && has("P30", wd.p30) && (!wd.p17 || get("P17").includes(wd.p17)) && (!wd.pop || (!!c.P1082 && !!c.P625));
      if (ok) return e.labels?.hu?.value || e.labels?.en?.value || text.trim();
    }
  } catch {
    /* nincs net, vagy blokkolva van */
  } finally {
    clearTimeout(timer);
  }
  return null;
}

async function aiCheck(q: Question, text: string): Promise<string | null> {
  if (!AI_URL) return null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q.p, answer: text.slice(0, 60) }),
      signal: ctl.signal,
    });
    const j = (await r.json()) as { ok?: boolean; label?: string };
    if (j.ok === true && typeof j.label === "string" && j.label.trim()) return j.label.trim().slice(0, 40);
  } catch {
    /* hálózati hiba */
  } finally {
    clearTimeout(timer);
  }
  return null;
}

/* a felismert új válaszokat megjegyezzük, így legközelebb azonnal elfogadja */
function learn(q: Question, label: string) {
  if (findAnswer(q, label)) return;
  q.a.push([label, 0.4]);
  const L = lsGet<Record<string, string[]>>("melyviz:learned") || {};
  (L[q.p] = L[q.p] || []).push(label);
  lsSet("melyviz:learned", L);
}
(function mergeLearned() {
  const L = lsGet<Record<string, string[]>>("melyviz:learned");
  if (!L) return;
  Q.forEach((q) => (L[q.p] || []).forEach((n) => { if (!findAnswer(q, n)) q.a.push([n, 0.4]); }));
})();

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
  const [checking, setChecking] = useState(false);
  const screenRef = useRef<Screen>("menu");
  screenRef.current = screen;
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

  const badAnswer = (v: string) => {
    setBad(`„${v.trim()}” nem jó, vagy nincs a listámban. Próbálj egy másikat!`);
    setInput("");
    setShake((n) => n + 1);
    inputRef.current?.focus();
  };

  const online = async (v: string) => {
    if (!q || checking) return;
    if (!q.wd && !AI_URL) {
      badAnswer(v);
      return;
    }
    setChecking(true);
    setBad("Ellenőrzöm…");
    let label = q.wd ? await webCheck(q, v) : null;
    if (!label && AI_URL) label = await aiCheck(q, v);
    setChecking(false);
    if (screenRef.current !== "play") return;
    if (label) {
      learn(q, label);
      setBad("");
      finish(label);
    } else badAnswer(v);
  };

  const submit = () => {
    if (!q || checking) return;
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
    void online(v);
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
                  <button className="btn ghost" onClick={() => { const v = input; setSug(null); if (q.wd || AI_URL) void online(v); else { setInput(""); inputRef.current?.focus(); } }}>Nem</button>
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
              <div className="badmsg" style={checking ? { color: "var(--muted)" } : undefined}>{bad}</div>
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