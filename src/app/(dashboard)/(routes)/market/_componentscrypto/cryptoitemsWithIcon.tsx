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
};

interface CryptoItemWithIconProps {
  index: number;
  symbol: string; // Symbol from WebSocket (e.g., 'btcusdt')
  finalPrice: number; // Real-time price from WebSocket
  percentChange: number; // Real-time 24h percentage change from WebSocket
}

const CryptoItemWithIcon: React.FC<CryptoItemWithIconProps> = ({
  index,
  symbol,
  finalPrice,
  percentChange,
}) => {
  // Extract token symbol (e.g., 'BTC' from 'btcusdt')
  const tokenSymbol = symbol.slice(0, -4).toUpperCase();
  const textPercentColor = setPercentChangesColor(percentChange);

  // Get CoinMarketCap ID based on the symbol
  const cmcId = symbolToCMCId[symbol.toLowerCase()] || "unknown";

  // Generate the CoinMarketCap image URL
  const tokenImage =
    cmcId !== "unknown"
      ? `https://s2.coinmarketcap.com/static/img/coins/32x32/${cmcId}.png`
      : "/fallback-icon.png"; // Use fallback image if no ID found

  return (
    <Card className="flex flex-row p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-row items-center">
          <div className="ml-2 mr-3 text-gray-500 dark:text-gray-400 text-sm font-medium">{index + 1}</div>
          <div className="mr-3">
            <CustomImage
              imageUrl={tokenImage}
              size={28}
            />
          </div>
          <div className="flex flex-col mr-2">
            <div className="font-semibold text-sm text-gray-900 dark:text-white">{tokenSymbol}</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {symbol.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="text-gray-900 dark:text-white font-semibold text-sm">
              ${removePriceDecimals(finalPrice)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {removePriceDecimals(finalPrice)} USDT
            </div>
          </div>
          <div
            className={`px-2 py-1 min-w-[60px] text-center transition-all duration-200 ${
              textPercentColor === "text-red-500"
                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                : textPercentColor === "text-green-500"
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
            }`}
          >
            <div className={`font-semibold text-xs flex items-center justify-center ${textPercentColor}`}>
              {percentChange >= 0 ? '+' : ''}{removePercentDecimals(percentChange)}%
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CryptoItemWithIcon;
