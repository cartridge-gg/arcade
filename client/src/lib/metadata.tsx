import type { Token } from "@dojoengine/torii-wasm";
import { addAddressPadding } from "starknet";
import { getToriiAssetUrl } from "@cartridge/arcade";

const JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3ZjhjN2JlYy00OGIwLTQ4ODQtOTllMS1lY2U2NTk4YTNjZWQiLCJlbWFpbCI6ImJhbDdoYXphckBwcm90b24ubWUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNTgxNjFkM2ZkYjNlOTE5MGVlNjUiLCJzY29wZWRLZXlTZWNyZXQiOiJhNjk1MjFjMjYwZWQ4ODA2YjdlYTg1YmU2OWFlMGE5MTE0ZmQ1YmIyOTJiYzJjM2FhYWVmZDgxZjU0ZmFlN2ExIiwiZXhwIjoxNzc4MDc3MDE3fQ.vNU3I0QnD-D-jZChENS5mTFYNGjppU56IJv38K8X7gQ";

export type MetadataAttribute = {
  trait_type: string;
  value: string;
  tokens: string[];
};

export const MetadataHelper = {
  async check(url: string): Promise<boolean> {
    const response = await fetch(url);
    return response.ok;
  },

  extract: (tokens: Token[]) => {
    const newMetadata: { [key: string]: MetadataAttribute } = {};
    for (const token of tokens) {
      let metadata;
      if (typeof token.metadata === "string") {
        try {
          metadata = JSON.parse(token.metadata);
        } catch {
          continue;
        }
      } else {
        metadata = token.metadata;
      }

      if (!metadata?.attributes) continue;

      for (const attribute of metadata.attributes) {
        const trait = attribute.trait_type;
        const value = attribute.value;
        const key = `${trait}-${value}`;
        if (!newMetadata[key]) {
          newMetadata[key] = {
            trait_type: trait,
            value: value,
            tokens: [token.token_id || ""],
          };
        } else {
          newMetadata[key].tokens.push(token.token_id || "");
        }
      }
    }

    return Object.values(newMetadata);
  },

  async encode(url: string): Promise<string | ArrayBuffer | null> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  async upload(content: string) {
    if (!content) return "";

    const blob = new Blob([content], { type: "image/svg+xml" });
    const file = new File([blob], "image.svg", { type: "image/svg+xml" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("network", "public");

    const res = await fetch("https://uploads.pinata.cloud/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      body: formData,
    });

    if (!res.ok) {
      console.error("❌ IPFS upload failed:", await res.text());
      throw new Error("Failed to upload to IPFS");
    }

    const data = await res.json();
    const cid = data.data.cid;
    const ipfsUrl = `https://turquoise-legal-fox-870.mypinata.cloud/ipfs/${cid}`;

    console.log("✅ Image uploaded to IPFS:", ipfsUrl);
    return ipfsUrl;
  },

  async gameImage(
    color: string,
    coverUrl: string,
    imageUrl: string,
  ): Promise<string> {
    const image = await MetadataHelper.encode(imageUrl);
    const cover = await MetadataHelper.encode(coverUrl);
    const data = `<svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="300" height="300" fill="#161A17"/>
<mask id="mask0_10793_49693" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300">
<rect width="300" height="300" fill="url(#paint0_linear_10793_49693)"/>
</mask>
<g mask="url(#mask0_10793_49693)">
<path d="M0 0H300V300H0V0Z" fill="url(#pattern0_10793_49693)"/>
</g>
<path fill-rule="evenodd" clip-rule="evenodd" d="M227 54C227.552 54 228 54.4477 228 55V209C228 209.552 227.552 210 227 210H73C72.4477 210 72 209.552 72 209V55C72 54.4477 72.4477 54 73 54H227Z" fill="#1E221F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M227 54C227.552 54 228 54.4477 228 55V209C228 209.552 227.552 210 227 210H73C72.4477 210 72 209.552 72 209V55C72 54.4477 72.4477 54 73 54H227Z" fill="url(#pattern1_10793_49693)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M228 50V54H232V210H228V214H72V210H68V54H72V50H228ZM76 58H72V206H76V210H224V206H228V58H224V54H76V58Z" fill="${color}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M224 54V58H228V206H224V210H76V206H72V58H76V54H224ZM80 62H76V202H80V206H220V202H224V62H220V58H80V62Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M244 38H248V42H252V46H256V254H252V258H248V262H244V266H56V262H52V258H48V254H44V46H48V42H52V38H56V34H244V38ZM72 54H68V210H72V214H228V210H232V54H228V50H72V54Z" fill="#2C2D2D"/>
<path opacity="0.04" d="M244 226V230H248V234H252V238H256V254H252V258H248V262H244V266H56V262H52V258H48V254H44V238H48V234H52V230H56V226H244Z" fill="white"/>
<rect x="56" y="246" width="8" height="4" fill="#222523"/>
<rect x="56" y="242" width="8" height="4" fill="black"/>
<rect x="236" y="246" width="8" height="4" fill="#222523"/>
<rect x="236" y="242" width="8" height="4" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M216 234V238H220V242H224V250H220V254H216V258H84V254H80V250H76V242H80V238H84V234H216Z" fill="#0F1210"/>
<path opacity="0.08" d="M220 254H216V258H84V254H80V250H76V246H84V250H88V254H212V250H216V246H224V250H220V254Z" fill="white"/>
<path d="M220 238H216V234H84V238H80V242H76V246H84V242H88V238H212V242H216V246H224V242H220V238Z" fill="black"/>
<path opacity="0.02" d="M56 222H60V226H56V230H52V234H48V238H44V46H48V42H52V38H56V222Z" fill="white"/>
<path opacity="0.02" d="M244 222H240V226H244V230H248V234H252V238H256V46H252V42H248V38H244V222Z" fill="white"/>
<path opacity="0.5" d="M256 50H260V258H256V262H252V266H248V270H60V266H244V262H248V258H252V254H256V50Z" fill="black"/>
<defs>
<pattern id="pattern0_10793_49693" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_10793_49693" transform="translate(-1) scale(0.002)"/>
</pattern>
<pattern id="pattern1_10793_49693" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image1_10793_49693" transform="scale(0.00125)"/>
</pattern>
<linearGradient id="paint0_linear_10793_49693" x1="150" y1="0" x2="150" y2="300" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="0.697115" stop-color="white" stop-opacity="0"/>
</linearGradient>
<image id="image0_10793_49693" width="1500" height="500" preserveAspectRatio="none" xlink:href="${cover}" />
<image id="image1_10793_49693" width="800" height="800" preserveAspectRatio="none" xlink:href="${image}" />
</defs>
</svg>`;
    const minified = data.replace(/\s+/g, " ").trim();
    return MetadataHelper.upload(minified);
  },

  async editionImage(
    color: string,
    coverUrl: string,
    imageUrl: string,
  ): Promise<string> {
    const image = await MetadataHelper.encode(imageUrl);
    const cover = await MetadataHelper.encode(coverUrl);
    const data = `<svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="300" height="300" fill="#161A17"/>
<mask id="mask0_10793_49658" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300">
<rect width="300" height="300" fill="url(#paint0_linear_10793_49658)"/>
</mask>
<g mask="url(#mask0_10793_49658)">
<g style="mix-blend-mode:luminosity">
<path d="M0 0H300V300H0V0Z" fill="url(#pattern0_10793_49658)"/>
</g>
</g>
<path fill-rule="evenodd" clip-rule="evenodd" d="M227 54C227.552 54 228 54.4477 228 55V209C228 209.552 227.552 210 227 210H73C72.4477 210 72 209.552 72 209V55C72 54.4477 72.4477 54 73 54H227Z" fill="#1E221F"/>
<path d="M90 49C90 48.4477 90.4477 48 91 48H209C209.552 48 210 48.4477 210 49V167C210 167.552 209.552 168 209 168H91C90.4477 168 90 167.552 90 167V49Z" fill="url(#pattern1_10793_49658)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M206 48V52H210V164H206V168H94V164H90V52H94V48H206ZM98 56H94V160H98V164H202V160H206V56H202V52H98V56Z" fill="${color}"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M202 52V56H206V160H202V164H98V160H94V56H98V52H202ZM102 60H98V156H102V160H198V156H202V60H198V56H102V60Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M210 40H214V44H218V48H222V232H218V236H214V240H210V244H206V248H202V252H198V256H194V260H90V256H86V252H82V248H78V48H82V44H86V40H90V36H210V40ZM94 48V52H90V164H94V168H206V164H210V52H206V48H94Z" fill="#2C2D2D"/>
<path opacity="0.5" d="M222 52H226V236H222V240H218V244H214V248H210V252H206V256H202V260H198V264H94V260H194V256H198V252H202V248H206V244H210V240H214V236H218V232H222V52Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M110 180V184H114V244H110V248H94V244H90V184H94V180H110Z" fill="#1E1F1F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M110 184H114V244H110V248H94V244H90V184H94V180H110V184ZM98 188H94V240H98V244H106V240H110V188H106V184H98V188Z" fill="#1E1F1F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M142 180V184H146V244H142V248H126V244H122V184H126V180H142Z" fill="#1E1F1F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M174 180V184H178V244H174V248H158V244H154V184H158V180H174Z" fill="#1E1F1F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M206 180V184H210V220H206V224H190V220H186V184H190V180H206Z" fill="#1E1F1F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M142 184H146V244H142V248H126V244H122V184H126V180H142V184ZM130 188H126V240H130V244H138V240H142V188H138V184H130V188Z" fill="#1E1F1F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M174 184H178V244H174V248H158V244H154V184H158V180H174V184ZM162 188H158V240H162V244H170V240H174V188H170V184H162V188Z" fill="#1E1F1F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M206 184H210V220H206V224H190V220H186V184H190V180H206V184ZM194 188H190V216H194V220H202V216H206V188H202V184H194V188Z" fill="#1E1F1F"/>
<defs>
<filter id="grayscale">
<feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0"/>
</filter>
<pattern id="pattern0_10793_49658" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_10793_49658" transform="translate(-1) scale(0.002)"/>
</pattern>
<pattern id="pattern1_10793_49658" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image1_10793_49658" transform="scale(0.00125)"/>
</pattern>
<linearGradient id="paint0_linear_10793_49658" x1="150" y1="0" x2="150" y2="300" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="0.697115" stop-color="white" stop-opacity="0"/>
</linearGradient>
<image id="image0_10793_49658" width="1500" height="500" preserveAspectRatio="none" filter="url(#grayscale)" xlink:href="${cover}" />
<image id="image1_10793_49658" width="800" height="800" preserveAspectRatio="none" xlink:href="${image}" />
</defs>
</svg>`;
    const minified = data.replace(/\s+/g, " ").trim();
    return MetadataHelper.upload(minified);
  },

  getToriiContractImage: async (
    project: string,

    contractAddress: string,
  ): Promise<string | undefined> => {
    if (!contractAddress) return;

    const toriiImage = getToriiAssetUrl(
      project,
      addAddressPadding(contractAddress),
    );

    // Fetch if the image exists

    try {
      const response = await fetch(toriiImage);

      if (response.ok) {
        return toriiImage;
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  },

  getToriiImage: async (
    project: string,
    token: Token,
  ): Promise<string | undefined> => {
    if (!token.contract_address || !token.token_id) return;
    const toriiImage = getToriiAssetUrl(
      project,
      addAddressPadding(token.contract_address),
      addAddressPadding(token.token_id),
    );
    // Fetch if the image exists
    try {
      const response = await fetch(toriiImage);
      if (response.ok) {
        return toriiImage;
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  },
  unsafeGetToriiImage: async (
    project: string,
    token: Token,
  ): Promise<string | undefined> => {
    if (!token.contract_address || !token.token_id) return;
    return getToriiAssetUrl(
      project,
      addAddressPadding(token.contract_address),
      addAddressPadding(token.token_id),
    );
  },

  getMetadataImage: async (token: Token): Promise<string | undefined> => {
    if (!token.metadata) return;
    let metadata;
    if (typeof token.metadata === "string") {
      try {
        metadata = JSON.parse(token.metadata);
        const response = await fetch(metadata.image);
        if (response.ok) {
          const image = metadata.image;
          if (image.startsWith("ipfs://")) {
            return image.replace(
              "ipfs://",
              "https://gateway.pinata.cloud/ipfs/",
            );
          }
          return image;
        }
      } catch (error) {
        console.error("Error parsing metadata:", error);
      }
    }
  },
};
