export type TrailPoint = {
  title: string;
  tag: string;
  why: string;
  lat: number;
  lon: number;
  /** true when the coordinate is an estimate from the surrounding trail
   * description rather than a verified map point. */
  approx?: boolean;
  image?: string;
  credit?: string;
};

export const CHRIBY_POINTS: TrailPoint[] = [
  {
    title: "Bradlo – 543 m",
    tag: "skalnatý vrchol",
    why: "Prakticky „domácí hora“ Vřesovic. Z Vřesovic na něj vede zelená přes Koryčanskou kapli; nahoře jsou pískovcové skály a vrcholová kniha KČT Vřesovice.",
    lat: 49.097,
    lon: 17.189,
    approx: true,
  },
  {
    title: "Koryčanská kaple",
    tag: "kaplička v hlubokém lese",
    why: "Asi 2,2 km severně od Vřesovic, na starém Koryčanském chodníku; pochází z 1. poloviny 19. století.",
    lat: 49.0817,
    lon: 17.1991,
  },
  {
    title: "Moravanské louky",
    tag: "přírodní rezervace",
    why: "Staré louky ukryté uprostřed lesů asi 1 km severně od Bradla. Je tam i Mravenčí skála a staré hranečníky.",
    lat: 49.106,
    lon: 17.189,
    approx: true,
  },
  {
    title: "Římský most",
    tag: "starý kamenný most/propustek",
    why: "Zajímavá lesní památka nedaleko Moravanských luk. Název je samozřejmě trochu zavádějící – není to římská stavba.",
    lat: 49.104,
    lon: 17.193,
    approx: true,
  },
  {
    title: "Zubkova studánka",
    tag: "lesní pramen",
    why: "Mezi Vřesovicemi a Koryčanskou kaplí.",
    lat: 49.07,
    lon: 17.207,
    approx: true,
  },
  {
    title: "Kozel",
    tag: "22m skalní věž",
    why: "Jedna z nejvýraznějších skal celých Chřibů, asi 650 m od Cimburku.",
    lat: 49.0976,
    lon: 17.2167,
  },
  {
    title: "Rozštípená skála",
    tag: "skalní útvar",
    why: "Hned v oblasti Kozla; společně tvoří známý horolezecký sektor.",
    lat: 49.098,
    lon: 17.218,
    approx: true,
  },
  {
    title: "Kazatelna – 542 m",
    tag: "8m skalní věž + kříž",
    why: "Za mě jeden z nejlepších bodů. Vytesané schody, nahoře kříž a výhled směrem na Cimburk a Koryčanskou přehradu.",
    lat: 49.095,
    lon: 17.205,
    approx: true,
  },
  {
    title: "Ocásek – 553 m",
    tag: "vrchol + PR",
    why: "Staré karpatské bučiny; rezervace leží jen asi 400 m od Kazatelny.",
    lat: 49.098,
    lon: 17.207,
    approx: true,
  },
  {
    title: "U Mísy",
    tag: "silná studánka",
    why: "Historický zdroj vody pro Cimburk, pěkné místo mezi Kozlem, Kazatelnou a Cimburkem.",
    lat: 49.099,
    lon: 17.213,
    approx: true,
  },
  {
    title: "Zřícenina hradu Cimburk",
    tag: "hrad",
    why: "Jednoznačně jeden z hlavních cílů této části Chřibů.",
    lat: 49.1037,
    lon: 17.2161,
  },
  {
    title: "Svatý Kliment / Klimentek",
    tag: "archeologická lokalita",
    why: "Velmi zajímavé místo spojené s velkomoravskou a cyrilometodějskou tradicí.",
    lat: 49.078,
    lon: 17.23,
    approx: true,
  },
  {
    title: "Hroby – 504 m",
    tag: "lesní vrchol/hřeben",
    why: "Méně známá část hlavního hřebene mezi Ocáskem a oblastí Holého kopce.",
    lat: 49.1009,
    lon: 17.2534,
  },
  {
    title: "Holý kopec – 548 m",
    tag: "výrazný vrchol",
    why: "Archeologicky zajímavá oblast a jeden z výraznějších vrcholů centrálních Chřibů.",
    lat: 49.12,
    lon: 17.27,
    approx: true,
  },
  {
    title: "Buchlovský kámen",
    tag: "skalní útvar",
    why: "Velký izolovaný balvan/skála v buchlovské části Chřibů.",
    lat: 49.1368,
    lon: 17.2993,
  },
  {
    title: "Břestecká skála",
    tag: "skály + výhled",
    why: "Jedna z nejhezčích skalnatých oblastí severovýchodní části Chřibů.",
    lat: 49.1115,
    lon: 17.3356,
  },
  {
    title: "Hrad Buchlov",
    tag: "hrad + výrazný kopec",
    why: "Už trochu dál od Vřesovic, ale pořád v rámci Chřibů.",
    lat: 49.1073,
    lon: 17.311,
    image: "/images/attractions/buchlov.jpg",
    credit: "Wikimedia Commons, CC BY-SA 3.0",
  },
  {
    title: "Rozhledna Brdo",
    tag: "587 m – nejvyšší vrchol Chřibů",
    why: "Kamenná rozhledna a nejvyšší bod celého pohoří.",
    lat: 49.1709,
    lon: 17.3086,
    image: "/images/attractions/brdo.jpg",
    credit: "Wikimedia Commons, CC BY-SA 3.0",
  },
  {
    title: "Čertovy kameny",
    tag: "skály",
    why: "Méně známý skalní útvar u Střílek.",
    lat: 49.1345,
    lon: 17.2178,
  },
  {
    title: "Zikmundova skála",
    tag: "skalní útvar",
    why: "Zajímavé místo v osvětimanské části Chřibů.",
    lat: 49.0816,
    lon: 17.2418,
  },
];
