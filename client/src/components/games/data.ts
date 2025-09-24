import rawData from "./data.json";

export const data = {
  eternum0: {
    ...rawData["eternum-mainnet-0"],
    images: rawData["eternum-mainnet-0"].images.join("\n"),
    videos: rawData["eternum-mainnet-0"].videos.join("\n"),
  },
  eternum1: {
    ...rawData["arcade-eternum-1"],
    images: rawData["arcade-eternum-1"].images.join("\n"),
    videos: rawData["arcade-eternum-1"].videos.join("\n"),
  },
  darkshuffle: {
    ...rawData["budokan-mainnet-2"],
    images: rawData["budokan-mainnet-2"].images.join("\n"),
    videos: rawData["budokan-mainnet-2"].videos.join("\n"),
  },
  blobarena: {
    ...rawData["arcade-blobarena"],
    images: rawData["arcade-blobarena"].images.join("\n"),
    videos: rawData["arcade-blobarena"].videos.join("\n"),
  },
  blobarena1: {
    ...rawData["arcade-blobarena-mainnet"],
    images: rawData["arcade-blobarena-mainnet"].images.join("\n"),
    videos: rawData["arcade-blobarena-mainnet"].videos.join("\n"),
  },
  ponziland: {
    ...rawData["arcade-ponziland"],
    images: rawData["arcade-ponziland"].images.join("\n"),
    videos: rawData["arcade-ponziland"].videos.join("\n"),
  },
  pistols: {
    ...rawData["pistols-mainnet"],
    images: rawData["pistols-mainnet"].images.join("\n"),
    videos: rawData["pistols-mainnet"].videos.join("\n"),
  },
  dopewars: {
    ...rawData["arcade-dopewars"],
    images: rawData["arcade-dopewars"].images.join("\n"),
    videos: rawData["arcade-dopewars"].videos.join("\n"),
  },
  // dragark: {
  //   ...rawData["arcade-dragark"],
  //   images: rawData["arcade-dragark"].images.join("\n"),
  //   videos: rawData["arcade-dragark"].videos.join("\n"),
  // },
  zkube0: {
    ...rawData["zkube-v1-mainnet"],
    images: rawData["zkube-v1-mainnet"].images.join("\n"),
    videos: rawData["zkube-v1-mainnet"].videos.join("\n"),
  },
  evolute0: {
    ...rawData["evolute-duel-arcade"],
    images: rawData["evolute-duel-arcade"].images.join("\n"),
    videos: rawData["evolute-duel-arcade"].videos.join("\n"),
  },
  evolute1: {
    ...rawData["evolute-duel"],
    images: rawData["evolute-duel"].images.join("\n"),
    videos: rawData["evolute-duel"].videos.join("\n"),
  },
  jokersofneondev: {
    ...rawData["jokersofneondev"],
    images: rawData["jokersofneondev"].images.join("\n"),
    videos: rawData["jokersofneondev"].videos.join("\n"),
  },
};
