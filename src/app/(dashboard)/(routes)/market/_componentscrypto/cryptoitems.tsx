import React from "react";
import { Card } from "./CryptoTabs/card";
import CustomImage from "./customImage";
import { removePriceDecimals, removePercentDecimals, setPercentChangesColor } from "@/CryptoThings/formater";


// Comprehensive mapping of symbols to CoinMarketCap numeric IDs
const symbolToCMCId: { [key: string]: number } = {
  // Major cryptocurrencies
  btcusdt: 1, // Bitcoin
  ethusdt: 1027, // Ethereum
  bnbusdt: 1839, // Binance Coin
  xrpusdt: 52, // XRP
  adausdt: 2010, // Cardano
  solusdt: 5426, // Solana
  dogeusdt: 74, // Dogecoin
  avaxusdt: 5805, // Avalanche
  dotusdt: 6636, // Polkadot
  maticusdt: 3890, // Polygon
  ltcusdt: 2, // Litecoin
  bchusdt: 1831, // Bitcoin Cash
  uniusdt: 7083, // Uniswap
  atomusdt: 3794, // Cosmos
  linkusdt: 1975, // Chainlink
  nearusdt: 6535, // NEAR Protocol
  aptusdt: 21794, // Aptos
  opusdt: 11840, // Optimism
  arbusdt: 42161, // Arbitrum
  filusdt: 2280, // Filecoin
  injusdt: 7226, // Injective
  ldousdt: 13573, // Lido DAO
  icpusdt: 8916, // Internet Computer
  vetusdt: 3077, // VeChain
  etcusdt: 1321, // Ethereum Classic
  manausdt: 1966, // Decentraland
  sandusdt: 6210, // The Sandbox
  galausdt: 7081, // Gala
  flowusdt: 4558, // Flow
  thetausdt: 2416, // Theta Network
  algousdt: 4030, // Algorand
  xtzusdt: 2011, // Tezos
  egldusdt: 6892, // MultiversX
  aaveusdt: 7278, // Aave
  crvusdt: 6538, // Curve DAO Token
  sushiusdt: 825, // SushiSwap
  compusdt: 5692, // Compound
  mkrusdt: 1518, // Maker
  snxusdt: 3406, // Synthetix
  yfiusdt: 5864, // yearn.finance
  inchusdt: 8104, // 1inch
  batusdt: 1697, // Basic Attention Token
  zecusdt: 1437, // Zcash
  dashusdt: 131, // Dash
  xlmusdt: 512, // Stellar
  neousdt: 1376, // NEO
  trxusdt: 1958, // TRON
  eosusdt: 1765, // EOS
  iotausdt: 1720, // IOTA
  qtumusdt: 1684, // Qtum
  wavesusdt: 1274, // Waves
  icxusdt: 2099, // ICON
  ontusdt: 2566, // Ontology
  zilusdt: 2469, // Zilliqa
  scusdt: 1042, // Siacoin
  steemusdt: 1230, // Steem
  nanousdt: 1567, // Nano
  dgbusdt: 109, // DigiByte
  rvnusdt: 2577, // Ravencoin
  dcrusdt: 1168, // Decred
  lskusdt: 1445, // Lisk
  arkusdt: 1586, // Ark
  repusdt: 1104, // Augur
  kmdusdt: 1168, // Komodo
  stratusdt: 1343, // Stratis
  pivxusdt: 1169, // PIVX
  sysusdt: 541, // Syscoin
  vtcusdt: 4, // Vertcoin
  monausdt: 213, // MonaCoin
  zenusdt: 1698, // Horizen
  xvgusdt: 693, // Verge
  
  // DeFi tokens
  dydxusdt: 11156, // dYdX
  gmxusdt: 11857, // GMX
  perpusdt: 11156, // Perpetual Protocol
  gnsusdt: 12023, // Gains Network
  pendleusdt: 9481, // Pendle
  rndrusdt: 11636, // Render Token
  lqtyusdt: 13143, // Liquity
  rplusdt: 2943, // Rocket Pool
  ssvusdt: 11595, // SSV Network
  farmusdt: 6067, // Harvest Finance
  bifiusdt: 8132, // Beefy Finance
  alcxusdt: 8613, // Alchemix
  spellusdt: 11289, // Spell Token
  cvxusdt: 9903, // Convex Finance
  fxsusdt: 6953, // Frax Share
  balusdt: 5728, // Balancer
  lrcusdt: 1934, // Loopring
  requsdt: 2071, // Request
  umausdt: 5617, // UMA
  rlcusdt: 1637, // iExec RLC
  kncusdt: 1982, // Kyber Network Crystal
  bandusdt: 5738, // Band Protocol
  renusdt: 2539, // Ren
  storjusdt: 1772, // Storj
  
  // Gaming tokens
  axsusdt: 6783, // Axie Infinity
  ilvusdt: 8719, // Illuvium
  yggusdt: 10688, // Yield Guild Games
  slpusdt: 5824, // Smooth Love Potion
  chzusdt: 4846, // Chiliz
  tlmusdt: 9119, // Alien Worlds
  aliceusdt: 8766, // My Neighbor Alice
  highusdt: 11645, // Highstreet
  vrausdt: 3701, // Verasity
  ufousdt: 7015, // UFO Gaming
  mboxusdt: 9175, // MOBOX
  darusdt: 11419, // Mines of Dalarnia
  gstusdt: 16352, // Green Satoshi Token
  gmtusdt: 18069, // STEPN
  
  // Meme coins
  shibusdt: 5994, // Shiba Inu
  pepeusdt: 24478, // Pepe
  bonkusdt: 28600, // Bonk
  flokiusdt: 14556, // Floki
  wifusdt: 28600, // dogwifhat
  memeusdt: 28600, // Meme
  bomeusdt: 28600, // BOOK OF MEME
  babyusdt: 28600, // Baby Doge Coin
  turbousdt: 28600, // Turbo
  penguusdt: 28600, // PENGU
  pumpusdt: 28600, // PUMP
  bananausdt: 28600, // Banana
  cookieusdt: 28600, // Cookie
  broccoli714usdt: 28600, // BROCCOLI
  catiusdt: 28600, // CATI
  dogsusdt: 28600, // DOGS
  mubarakusdt: 28600, // MUBARAK
  partiusdt: 28600, // PARTI
  treeusdt: 28600, // TREE
  usd1usdt: 28600, // USD1
  mbabyodogeusdt: 28600, // 1M Baby Doge
  bananas31usdt: 28600, // BANANAS31
  animeusdt: 28600, // ANIME
  aiusdt: 28600, // AI
  catusdt: 28600, // 1000CAT
  cheemsusdt: 28600, // 1000CHEEMS
  satsusdt: 28600, // 1000SATS
  
  // Layer 1 & Layer 2
  tonusdt: 11419, // Toncoin
  suiusdt: 20947, // Sui
  ftmusdt: 4195, // Fantom
  oneusdt: 3945, // Harmony
  celousdt: 10775, // Celo
  kavausdt: 4846, // Kava
  seiusdt: 23121, // Sei
  injectusdt: 7226, // Injective
  tiausdt: 22861, // Celestia
  strkusdt: 22691, // Starknet
  
  // AI & Innovation
  fetchusdt: 22153, // Fetch.ai
  agixusdt: 6719, // SingularityNET
  oceanusdt: 3911, // Ocean Protocol
  wldusdt: 21319, // Worldcoin
  arusdt: 21319, // Arweave
  grtusdt: 6719, // The Graph
  
  // Oracle & Data
  diausdt: 8636, // DIA
  api3usdt: 7737, // API3
  nestusdt: 11278, // Nest Protocol
  trbusdt: 11278, // Tellor
  
  // Additional tokens from your list
  c98usdt: 10903, // Coin98
  cakeusdt: 7186, // PancakeSwap
  celrousdt: 3814, // Celer Network
  cetususdt: 21319, // Cetus
  cfxusdt: 7334, // Conflux
  cgptusdt: 21319, // ChainGPT
  chessusdt: 21319, // Tranchess
  chrusdt: 3978, // Chromaway
  cityusdt: 21319, // Manchester City Fan Token
  ckbusdt: 4948, // Nervos Network
  cosusdt: 21319, // Contentos
  cotiusdt: 4705, // COTI
  cowusdt: 21319, // CoW Protocol
  ctkusdt: 4807, // CertiK
  ctsiusdt: 3964, // Cartesi
  cusdt: 21319, // C
  cvcusdt: 1816, // Civic
  cyberusdt: 21319, // CyberConnect
  datausdt: 21319, // Streamr
  degousdt: 21319, // Dego Finance
  dentusdt: 1886, // Dent
  dexeusdt: 21319, // DeXe
  dfusdt: 21319, // DF
  dodousdt: 7224, // DODO
  dolousdt: 21319, // DOLA
  dusdt: 21319, // D
  duskusdt: 21319, // Dusk Network
  dymusdt: 21319, // Dymension
  edenusdt: 21319, // Eden Network
  eduusdt: 21319, // EDU Coin
  eigenusdt: 21319, // EigenLayer
  enausdt: 21319, // Ethena
  enjusdt: 2132, // Enjin Coin
  ensusdt: 13855, // Ethereum Name Service
  epicusdt: 21319, // Epic Cash
  erausdt: 21319, // ERA Token
  ethfiusdt: 21319, // Ether.fi
  euriusdt: 21319, // EURI
  eurusdt: 21319, // EUR
  fdusdusdt: 21319, // First Digital USD
  ffusdt: 21319, // FF
  fidausdt: 21319, // Bonfida
  fiousdt: 21319, // FIO Protocol
  fisusdt: 21319, // Stafi
  flmusdt: 21319, // Flamingo
  fluxusdt: 21319, // Flux
  formusdt: 21319, // Formation Fi
  forthusdt: 21319, // Ampleforth Governance Token
  ftusdt: 21319, // FTT
  funusdt: 21319, // FunFair
  gasusdt: 21319, // Gas
  ghstusdt: 21319, // Aavegotchi
  glmrusdt: 21319, // Moonbeam
  glmusdt: 21319, // Golem
  gpsusdt: 21319, // GPS
  gtcusdt: 21319, // Gitcoin
  gunusdt: 21319, // Guncoin
  gusdt: 21319, // G
  haedalusdt: 21319, // Haedal
  hbarusdt: 4642, // Hedera Hashgraph
  heiusdt: 21319, // HEI
  hemiusdt: 21319, // HEMI
  hftusdt: 21319, // Hashflow
  hivusdt: 21319, // Hive
  hmstrusdt: 21319, // Hamster Kombat
  holousdt: 21319, // Holo
  homeusdt: 21319, // HomeCoin
  hookusdt: 21319, // Hooked Protocol
  hotusdt: 21319, // Holo
  humausdt: 21319, // Human Protocol
  hyperusdt: 21319, // Hyperliquid
  idexusdt: 21319, // IDEX
  idusdt: 21319, // ID
  imxusdt: 17234, // Immutable X
  initusdt: 21319, // Init
  iostusdt: 2405, // IOST
  iotxusdt: 2777, // IoTeX
  iousdt: 21319, // IO
  iqusdt: 21319, // IQ
  jasmyusdt: 8425, // JasmyCoin
  joeusdt: 21319, // JOE
  jstusdt: 21319, // JUST
  jtousdt: 21319, // Jito
  jupusdt: 21319, // Jupiter
  juvusdt: 21319, // Juventus Fan Token
  kaiausdt: 21319, // KAIA
  kaitousdt: 21319, // KAITO
  kdausdt: 21319, // Kadena
  kernelusdt: 21319, // Kernel
  kmnousdt: 21319, // Kamino
  lausdt: 21319, // LA
  layerusdt: 21319, // LayerAI
  laziousdt: 21319, // Lazio Fan Token
  lineausdt: 21319, // Linea
  listausdt: 21319, // Lista DAO
  lptusdt: 21319, // Livepeer
  lumiausdt: 21319, // Lumia
  lunausdt: 4172, // Terra Luna
  luncusdt: 4172, // Terra Luna Classic
  magicusdt: 21319, // Magic
  mantausdt: 21319, // Manta Network
  maskusdt: 8536, // Mask Network
  mavusdt: 21319, // Maverick Protocol
  mblusdt: 21319, // MovieBloc
  mdtusdt: 21319, // Measurable Data Token
  metisusdt: 21319, // MetisDAO
  meusdt: 21319, // ME
  minausdt: 21319, // Mina Protocol
  mirausdt: 21319, // Mira
  mitousdt: 21319, // Mito
  mlnusdt: 21319, // Melon Protocol
  morphousdt: 21319, // Morpho
  moveusdt: 21319, // Move
  movrusdt: 21319, // Moonriver
  mtlusdt: 21319, // Metal DAO
  neirusdt: 21319, // Neiro
  newtusdt: 21319, // Newton
  nexousdt: 21319, // Nexo
  nfpusdt: 21319, // NFPrompt
  nilusdt: 21319, // NIL
  nknusdt: 21319, // NKN
  nmrusdt: 21319, // Numeraire
  nomusdt: 21319, // Onomy Protocol
  notusdt: 21319, // Notcoin
  ntrnusdt: 21319, // Neutron
  nxpcusdt: 21319, // NXPC
  ognusdt: 21319, // Origin Protocol
  ogusdt: 21319, // OG
  omusdt: 21319, // MANTRA DAO
  ondousdt: 21319, // Ondo Finance
  ongusdt: 21319, // Ontology Gas
  openusdt: 21319, // OpenDAO
  orcusdt: 21319, // Orca
  ordiusdt: 21319, // ORDI
  osmousdt: 21319, // Osmosis
  oxtusdt: 21319, // Orchid Protocol
  paxgusdt: 21319, // PAX Gold
  phausdt: 21319, // Phala Network
  phbusdt: 21319, // Phoenix Global
  pixelusdt: 21319, // Pixels
  plumeusdt: 21319, // Plume Network
  pnutusdt: 21319, // Peanut
  polusdt: 21319, // Polkastarter
  polyxusdt: 21319, // Polymath
  pondusdt: 21319, // Marlin
  portausdt: 21319, // Portal
  portousdt: 21319, // Porto Fan Token
  powrusdt: 21319, // Power Ledger
  promusdt: 21319, // Prometeus
  proveusdt: 21319, // Prove
  psgusdt: 21319, // Paris Saint-Germain Fan Token
  pundixusdt: 21319, // Pundi X
  pyrusdt: 21319, // Vulcan Forged PYR
  pythusdt: 21319, // Pyth Network
  qiusdt: 21319, // QI
  qkcusdt: 21319, // QuarkChain
  qntusdt: 21319, // Quant
  quickusdt: 21319, // QuickSwap
  radusdt: 21319, // Radicle
  rareusdt: 21319, // SuperRare
  rdntusdt: 21319, // Radiant Capital
  redusdt: 21319, // RED
  reiusdt: 21319, // Rei Network
  renderusdt: 11636, // Render Token
  resolvusdt: 21319, // Resolv
  rezusdt: 21319, // Renzo Protocol
  rifusdt: 21319, // RSK Infrastructure Framework
  roninusdt: 21319, // Ronin
  roseusdt: 21319, // Oasis Network
  rsrusdt: 21319, // Reserve Rights
  runeusdt: 21319, // THORChain
  sagausdt: 21319, // Saga
  saharausdt: 21319, // Sahara DAO
  santosusdt: 21319, // Santos Fan Token
  scrusdt: 21319, // Scroll
  sfpusdt: 21319, // SafePal
  shellusdt: 21319, // Shell Token
  signusdt: 21319, // Signum
  sklusdt: 21319, // SKALE Network
  skyusdt: 21319, // Skycoin
  solvusdt: 21319, // Solv Protocol
  somiusdt: 21319, // Somi
  sophusdt: 21319, // Sophon
  spkusdt: 21319, // Spark Protocol
  stgusdt: 21319, // Stargate Finance
  stousdt: 21319, // STO
  straxusdt: 21319, // Stratis
  stxusdt: 21319, // Stacks
  sunusdt: 21319, // SUN
  superusdt: 21319, // SuperVerse
  susdt: 21319, // S
  sxpusdt: 21319, // Swipe
  sxtusdt: 21319, // SXT
  synusdt: 21319, // Synapse
  syrupusdt: 21319, // Syrup
  taousdt: 21319, // TAO
  tfuelusdt: 21319, // Theta Fuel
  theusdt: 21319, // THE
  tkousdt: 21319, // Tokocrypto
  tnsrusdt: 21319, // Tensor
  townsusdt: 21319, // Towns
  trumpusdt: 21319, // TRUMP
  truusdt: 21319, // TrueFi
  tstusdt: 21319, // TST
  tusdt: 21319, // T
  tusdusdt: 21319, // TrueUSD
  tutusdt: 21319, // Tutellus
  twtusdt: 21319, // Trust Wallet Token
  usdcusdt: 21319, // USD Coin
  usdeusdt: 21319, // USDe
  usdpusdt: 21319, // USDP
  ustcusdt: 21319, // TerraClassicUSD
  usualusdt: 21319, // USUAL
  utkusdt: 21319, // Utrust
  vanausdt: 21319, // VANA
  vanryusdt: 21319, // VANRY
  velodromeusdt: 21319, // Velodrome Finance
  vicusdt: 21319, // VIC
  virtualusdt: 21319, // Virtual Protocol
  voxelusdt: 21319, // Voxies
  vthousdt: 21319, // VTHO
  wanusdt: 21319, // Wanchain
  waxpusdt: 21319, // WAX
  wbethusdt: 21319, // Wrapped Beacon ETH
  wbtcusdt: 21319, // Wrapped Bitcoin
  wctusdt: 21319, // WCT
  winusdt: 21319, // WIN
  wlfiusdt: 21319, // WLFI
  woousdt: 21319, // WOO Network
  wusdt: 21319, // W
  xaiusdt: 21319, // XAI
  xecusdt: 21319, // eCash
  xnousdt: 21319, // XNO
  xplusdt: 21319, // XPL
  xusdusdt: 21319, // XUSD
  xvsusdt: 21319, // Venus
  zkcusdt: 21319, // zkSync
  zkusdt: 21319, // ZK
  zrousdt: 21319, // LayerZero
  zrxusdt: 1896, // 0x Protocol
};

interface CryptoItemProps {
  index: number;
  symbol: string; // Symbol from WebSocket (e.g., 'btcusdt')
  finalPrice: number; // Real-time price from WebSocket
  percentChange: number; // Real-time 24h percentage change from WebSocket
  isLoading?: boolean; // Whether the data is still loading
}

const CryptoItem: React.FC<CryptoItemProps> = ({
  index,
  symbol,
  finalPrice,
  percentChange,
  isLoading = false,
}) => {
  // Extract token symbol (e.g., 'BTC' from 'btcusdt')
  const tokenSymbol = symbol.slice(0, -4).toUpperCase();
  const textPercentColor = setPercentChangesColor(percentChange);

  // Show "--" when loading, otherwise show actual data
  const displayPrice = isLoading ? "--" : `$${removePriceDecimals(finalPrice)}`;
  const displayPriceUsdt = isLoading ? "-- USDT" : `${removePriceDecimals(finalPrice)} USDT`;
  const displayPercent = isLoading ? "--" : `${percentChange >= 0 ? '+' : ''}${removePercentDecimals(percentChange)}%`;
  
  // Use gray color when loading
  const percentColor = isLoading ? "text-gray-500" : textPercentColor;

  return (
    <Card className="flex flex-row p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-row items-center">
          <div className="flex flex-col mr-3">
            <div className="font-semibold text-sm text-gray-900 dark:text-white">{tokenSymbol}</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {symbol.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="text-gray-900 dark:text-white font-semibold text-sm">
              {displayPrice}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {displayPriceUsdt}
            </div>
          </div>
          <div
            className={`px-2 py-1 min-w-[60px] text-center transition-all duration-200 ${
              isLoading
                ? "bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                : percentColor === "text-red-500"
                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                : percentColor === "text-green-500"
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
            }`}
          >
            <div className={`font-semibold text-xs flex items-center justify-center ${percentColor}`}>
              {displayPercent}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CryptoItem;
