import {
  faAppleWhole,
  faCarrot,
  faClover,
  faCrown,
  faDiceSix,
  faGem,
  faLeaf,
  faLemon,
  faPepperHot,
  faSeedling,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import FontAwesomeBackboard from "./backboard";
import { FONT_AWESOME_BACKBOARD_CONFIG } from "./backboardTrailConfig";

const BASE_REEL_MATH = [
  { winRate: 10, multiplier: 1 },
  { winRate: 8, multiplier: 2 },
  { winRate: 5, multiplier: 3 },
  { winRate: 4, multiplier: 4 },
  { winRate: 3, multiplier: 5 },
  { winRate: 2, multiplier: 10 },
  { winRate: 1, multiplier: 15 },
  { winRate: 0.5, multiplier: 25 },
  { winRate: 0.1, multiplier: 50 },
  { winRate: 0.01, multiplier: 100 },
];

export const themeSettings = {
  id: "font-awesome",
  name: "FontAwesome",
  reelItemArray: [
    { id: "reelItem1", rank: 1, name: "Apple", icon: faAppleWhole, iconColor: "#ff6b6b" },
    { id: "reelItem2", rank: 2, name: "Lemon", icon: faLemon, iconColor: "#ffd447" },
    { id: "reelItem3", rank: 3, name: "Carrot", icon: faCarrot, iconColor: "#ff9f43" },
    { id: "reelItem4", rank: 4, name: "Pepper", icon: faPepperHot, iconColor: "#ff4d6d" },
    { id: "reelItem5", rank: 5, name: "Leaf", icon: faLeaf, iconColor: "#76d672" },
    { id: "reelItem6", rank: 6, name: "Seedling", icon: faSeedling, iconColor: "#4fdc8d" },
    { id: "reelItem7", rank: 7, name: "Clover", icon: faClover, iconColor: "#57bf63" },
    { id: "reelItem8", rank: 8, name: "Gem", icon: faGem, iconColor: "#74d7ff" },
    { id: "reelItem9", rank: 9, name: "Crown", icon: faCrown, iconColor: "#f5c451" },
    { id: "reelItem10", rank: 10, name: "Dice", icon: faDiceSix, iconColor: "#d08cff" },
  ].map((item, idx) => ({
    ...item,
    label: item.name,
    winRate: BASE_REEL_MATH[idx].winRate,
    multiplier: BASE_REEL_MATH[idx].multiplier,
  })),
  bonusItem: {
    id: "bonusItem",
    name: "Gold Star",
    label: "Gold Star",
    icon: faStar,
    iconColor: "#f6c453",
  },
  colourScheme: {
    primaryBackground: "#1b2d2f",
    textOnePrimaryBackground: "#e9f6f3",
    secondaryBackground: "#223c3d",
    textOneSecondaryBackground: "#def1eb",
    primary: "#1ea89d",
    textOnPrimary: "#03201d",
    secondary: "#3fb37b",
    textOnSecondary: "#082315",
    tertiary: "#cae37a",
    textOnTertiary: "#1f2a0f",
    nudgeColour: "#3f98ff",
    holdColour: "#f04444",
    backboardColour: "#f1c65b",
  },
  background:
    "radial-gradient(circle at 14% 12%, rgba(67, 142, 130, 0.33), transparent 42%), radial-gradient(circle at 83% 18%, rgba(120, 98, 145, 0.18), transparent 38%), linear-gradient(168deg, #162226, #151a1f 62%, #11161b)",
  backboardComponent: FontAwesomeBackboard,
  backboardConfig: FONT_AWESOME_BACKBOARD_CONFIG,
};
