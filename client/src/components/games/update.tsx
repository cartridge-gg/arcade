import { useArcade } from "@/hooks/arcade";
import {
  Button,
  GearIcon,
  Input,
  PlusIcon,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Textarea,
  TrashIcon,
} from "@cartridge/ui-next";
import { useAccount } from "@starknet-react/core";
import { useCallback, useMemo, useState } from "react";
import { AllowArray, byteArray, Call, constants } from "starknet";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Attributes,
  GameModel,
  Properties,
  Socials,
} from "@bal7hazar/arcade-sdk";
import ControllerConnector from "@cartridge/connector/controller";
import { MetadataHelper } from "@/helpers/metadata";

const formSchema = z.object({
  color: z.string().startsWith("#", { message: "Invalid Color" }),
  preset: z.string().min(2, { message: "Preset is required" }),
  name: z.string().min(2, { message: "Name is required" }),
  description: z.string().min(2, { message: "Description is required" }),
  // Assets
  // Fetch to ensure the image is valid
  image: z
    .string()
    .refine((val) => val.startsWith("http") || !val, {
      message: "Invalid Image URL",
    })
    .refine(
      async (val) => {
        const response = await fetch(val);
        return !!response && response.status !== 404;
      },
      {
        message: "Asset not found",
      },
    ),
  banner: z
    .string()
    .refine((val) => val.startsWith("http") || !val, {
      message: "Invalid Banner URL",
    })
    .refine(
      async (val) => {
        const response = await fetch(val);
        return !!response && response.status !== 404;
      },
      {
        message: "Asset not found",
      },
    ),
  cover: z
    .string()
    .refine((val) => val.startsWith("http") || !val, {
      message: "Invalid Cover URL",
    })
    .refine(
      async (val) => {
        const response = await fetch(val);
        return !!response && response.status !== 404;
      },
      {
        message: "Asset not found",
      },
    ),
  // Socials
  discord: z.string().refine((val) => val.startsWith("http") || !val, {
    message: "Invalid Discord URL",
  }),
  telegram: z.string().refine((val) => val.startsWith("http") || !val, {
    message: "Invalid Telegram URL",
  }),
  twitter: z.string().refine((val) => val.startsWith("http") || !val, {
    message: "Invalid Twitter URL",
  }),
  youtube: z.string().refine((val) => val.startsWith("http") || !val, {
    message: "Invalid Youtube URL",
  }),
  website: z.string().refine((val) => val.startsWith("http") || !val, {
    message: "Invalid Website URL",
  }),
  github: z.string().refine((val) => val.startsWith("http") || !val, {
    message: "Invalid Github URL",
  }),
  videos: z
    .string()
    .refine((val) => val.split("\n").every((v) => v.startsWith("http") || !v), {
      message: "Invalid Video URL",
    }),
  images: z
    .string()
    .refine((val) => val.split("\n").every((v) => v.startsWith("http") || !v), {
      message: "Invalid Image URL",
    }),
});

export function Update({ game }: { game?: GameModel }) {
  const { account, connector } = useAccount();
  const { provider } = useArcade();
  const [loading, setLoading] = useState(false);
  const [close, setClose] = useState(false);

  const defaultValues = useMemo(() => {
    return {
      color: game?.color || "",
      preset: game?.properties?.preset || "",
      name: game?.name || "",
      description: game?.description || "",
      image: game?.properties.icon || "",
      banner: game?.properties.banner || "",
      cover: game?.properties.cover || "",
      discord: game?.socials?.discord || "",
      telegram: game?.socials?.telegram || "",
      twitter: game?.socials?.twitter || "",
      youtube: game?.socials?.youtube || "",
      website: game?.socials?.website || "",
      github: game?.socials?.github || "",
      videos: game?.socials?.videos?.join("\n") || "",
      images: game?.socials?.images?.join("\n") || "",
    };
  }, [game]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // defaultValues: {
    //   worldAddress: game?.worldAddress || "0x1405692c316d05ac219d844829293d1ff1271fde8fd486e5fe1e68a774b2adb",
    //   namespace: game?.namespace || "amma_blobert",
    //   project: game?.config.project || "ba-pve-dev-alex",
    //   rpc: game?.config.rpc || "https://api.cartridge.gg/x/starknet/sepolia",
    //   policies: JSON.stringify(game?.config.policies) || "",
    //   color: game?.metadata.color || "#D7B000",
    //   preset: game?.metadata.preset || "blob-arena-amma",
    //   name: game?.metadata.name || "Blob Arena AMMA",
    //   description: game?.metadata.description || `Blob Area is a mini-game designed for a game jam, featuring unique characters known as "Bloberts" engaging in strategic, Pokemon-like battles. Players will navigate through exciting encounters, against other players or against AI, using their Bloberts' distinctive traits to outsmart and defeat opponents. The game's core mechanic revolves around an enhanced rock-paper-scissors style combat modified by each character's attributes.`,
    //   image: game?.metadata.image || "https://static.cartridge.gg/presets/blob-arena-amma/icon.png",
    //   banner: game?.metadata.banner || "https://static.cartridge.gg/presets/blob-arena-amma/cover.png",
    //   discord: game?.socials.discord || "",
    //   telegram: game?.socials.telegram || "",
    //   twitter: game?.socials.twitter || "https://x.com/Blobarena",
    //   youtube: game?.socials.youtube || "",
    //   website: game?.socials.website || "https://blobarena.xyz/",
    //   github: game?.socials.github || "https://github.com/GrugLikesRocks/Blob-arena",
    //   videos: game?.socials.videos?.join("\n") || [],
    //   images: game?.socials.images?.join("\n") || [],
    // },
    // defaultValues: {
    //   worldAddress: game?.worldAddress || "0x6a9e4c6f0799160ea8ddc43ff982a5f83d7f633e9732ce42701de1288ff705f",
    //   namespace: game?.namespace || "ds_v1_2_0",
    //   project: game?.config.project || "darkshufflebal",
    //   rpc: game?.config.rpc || "https://api.cartridge.gg/x/starknet/mainnet",
    //   policies: JSON.stringify(game?.config.policies) || ``,
    //   color: game?.metadata.color || "#F59100",
    //   preset: game?.metadata.preset || "dark-shuffle",
    //   name: game?.metadata.name || "Dark Shuffle",
    //   description: game?.metadata.description || "A Provable Roguelike Deck-building Game on Starknet, powered by LORDS.",
    //   image: game?.metadata.image || "https://static.cartridge.gg/presets/dark-shuffle/icon.svg",
    //   banner: game?.metadata.banner || "https://static.cartridge.gg/presets/dark-shuffle/cover.png",
    //   discord: game?.socials.discord || "https://discord.gg/CEXUEJF3",
    //   telegram: game?.socials.telegram || "",
    //   twitter: game?.socials.twitter || "https://x.com/await_0x",
    //   youtube: game?.socials.youtube || "",
    //   website: game?.socials.website || "https://darkshuffle.dev/",
    //   github: game?.socials.github || "https://github.com/Provable-Games/dark-shuffle",
    //   videos: game?.socials.videos?.join("\n") || "",
    //   images: game?.socials.images?.join("\n") || "",
    // },
    // defaultValues: {
    //   worldAddress:
    //     game?.worldAddress ||
    //     "0x4f3dccb47477c087ad9c76b8067b8aadded57f8df7f2d7543e6066bcb25332c",
    //   namespace: game?.namespace || "dopewars",
    //   project: game?.config.project || "dopewarsbal",
    //   rpc: game?.config.rpc || "https://api.cartridge.gg/x/starknet/mainnet",
    //   policies:
    //     JSON.stringify(game?.config.policies) ||
    //     `{"origin":"dopewars.game","chains":{"SN_MAIN":{"policies":{"contracts":{"0x051Fea4450Da9D6aeE758BDEbA88B2f665bCbf549D2C61421AA724E9AC0Ced8F":{"name":"VRF Provider","description":"Provides verifiable random functions","methods":[{"name":"Request Random","description":"Request a random number","entrypoint":"request_random"}]},"0x0410466536b5ae074f7fea81e5533b8134a9fa08b3dd077dd9db08f64997d113":{"name":"Paper Token","description":"Manages paper approvals","methods":[{"name":"Approve","description":"Approve paper usage","entrypoint":"approve"}]},"0x044a23BbfE03FFe90D3C23Fb6e5A8AD0341036C039363DfA6F3513278Aa51fCA":{"name":"Game Contract","description":"Core game mechanics","methods":[{"name":"Create Game","description":"Start a new game","entrypoint":"create_game"},{"name":"Travel","description":"Travel to a new location","entrypoint":"travel"},{"name":"Decide","description":"Make a game decision","entrypoint":"decide"},{"name":"End Game","description":"End the current game","entrypoint":"end_game"}]},"0x0412445e644070C69fEa16b964cC81Cd6dEBF6A4DBf683E2E9686a45ad088de8":{"name":"Laundromat Contract","description":"Manages game scoring and laundering","methods":[{"name":"Register Score","description":"Register a game score","entrypoint":"register_score"},{"name":"Claim","description":"Claim rewards","entrypoint":"claim"},{"name":"Launder","description":"Launder resources","entrypoint":"launder"}]}}}}},"theme":{"colors":{"primary":"#11ED83"},"cover":"cover.png","icon":"icon.png","name":"Dope Wars"}}`,
    //   color: game?.metadata.color || "#11ED83",
    //   preset: game?.metadata.preset || "dope-wars",
    //   name: game?.metadata.name || "Dope Wars",
    //   description:
    //     game?.metadata.description ||
    //     "Dope Wars is an onchain adaptation of the classic arbitrage game Drug Wars, built by Cartridge in partnership with Dope DAO.",
    //   image:
    //     game?.metadata.image ||
    //     "https://static.cartridge.gg/presets/dope-wars/icon.png",
    //   banner:
    //     game?.metadata.banner ||
    //     "https://static.cartridge.gg/presets/dope-wars/cover.png",
    //   discord: game?.socials.discord || "https://discord.gg/CEXUEJF3",
    //   telegram: game?.socials.telegram || "",
    //   twitter: game?.socials.twitter || "https://x.com/TheDopeWars",
    //   youtube: game?.socials.youtube || "",
    //   website: game?.socials.website || "https://dopewars.game/",
    //   github:
    //     game?.socials.github || "https://github.com/cartridge-gg/dopewars",
    //   videos:
    //     game?.socials.videos?.join("\n") ||
    //     "https://youtu.be/bkNF9VdY2-o?si=Fh2KQLC1-qQmYPlG\nhttps://youtu.be/-ptcWqcGiuo?si=eslLenE0vRqL-bRM\nhttps://youtube.com/shorts/OU8rqBxHdDI?si=mgZ9zLA1wc6OWzfB",
    //   images:
    //     game?.socials.images?.join("\n") ||
    //     "https://repository-images.githubusercontent.com/614510733/32e5253b-7fd6-4e39-b536-9678ee2557bc\nhttps://pbs.twimg.com/media/GI6077pW8AA6wrt?format=jpg&name=large",
    // },
    // defaultValues: {
    //   worldAddress:
    //     game?.worldAddress ||
    //     "0x022055481479edc9542aa28bc7da760c45fbf320bce571c31c161baddc13acd9",
    //   namespace: game?.namespace || "dragark",
    //   project: game?.config.project || "dragark-mainnet-v10-1",
    //   rpc: game?.config.rpc || "https://api.cartridge.gg/x/starknet/mainnet",
    //   policies: game?.config.policies
    //     ? JSON.stringify(game?.config.policies)
    //     : "",
    //   color: game?.metadata.color || "#71EB34",
    //   preset: game?.metadata.preset || "dragark",
    //   name: game?.metadata.name || "Dragark",
    //   description:
    //     game?.metadata.description ||
    //     "Dragark Mainnet is live now! Let's dive into the Action: Battle, Upgrade, and Mine for Dragark Stones!",
    //   image:
    //     game?.metadata.image ||
    //     "https://static.cartridge.gg/presets/dragark/icon.png",
    //   banner:
    //     game?.metadata.banner ||
    //     "https://static.cartridge.gg/presets/dragark/cover.png",
    //   discord: game?.socials.discord || "https://discord.gg/KEChMrdk7z",
    //   telegram: game?.socials.telegram || "",
    //   twitter: game?.socials.twitter || "https://x.com/playDRAGARK",
    //   youtube: game?.socials.youtube || "",
    //   website: game?.socials.website || "https://dragark.net/",
    //   github:
    //     game?.socials.github ||
    //     "https://github.com/DragarkTeam/dragark-contract",
    //   videos: game?.socials.videos?.join("\n") || [],
    //   images: game?.socials.images?.join("\n") || [],
    // },
    // defaultValues: {
    //   worldAddress:
    //     game?.worldAddress ||
    //     "0x02ea88c9a6314a10e7d8b6e557d01d68cf72d962707086aa242bc4805071f34d",
    //   namespace: game?.namespace || "pistols",
    //   project: game?.config.project || "pistols-staging",
    //   rpc: game?.config.rpc || "https://api.cartridge.gg/x/starknet/sepolia",
    //   policies: game?.config.policies
    //     ? JSON.stringify(game?.config.policies)
    //     : ``,
    //   color: game?.metadata.color || "#EF9758",
    //   preset: game?.metadata.preset || "pistols",
    //   name: game?.metadata.name || "Pistols",
    //   description:
    //     game?.metadata.description ||
    //     "Fully on-chain game made with Dojo by Underware.gg",
    //   image:
    //     game?.metadata.image ||
    //     "https://static.cartridge.gg/presets/pistols/icon.png",
    //   banner:
    //     game?.metadata.banner ||
    //     "https://static.cartridge.gg/presets/pistols/cover.png",
    //   discord: game?.socials.discord || "https://discord.gg/Zbap29dD",
    //   telegram: game?.socials.telegram || "",
    //   twitter: game?.socials.twitter || "https://x.com/underware_gg",
    //   youtube: game?.socials.youtube || "",
    //   website: game?.socials.website || "https://pistols.underware.gg/",
    //   github: game?.socials.github || "https://github.com/underware-gg/pistols",
    //   videos: game?.socials.videos?.join("\n") || [],
    //   images: game?.socials.images?.join("\n") || [],
    // },
    // defaultValues: {
    //   worldAddress:
    //     game?.worldAddress ||
    //     "0x30d5d5c610dd736faea146b20b850af64e34ca6e5c5a66462f76f32f48dd997",
    //   namespace: game?.namespace || "zkube",
    //   project: game?.config.project || "zkubebal",
    //   rpc: game?.config.rpc || "https://api.cartridge.gg/x/starknet/mainnet",
    //   policies: game?.config.policies
    //     ? JSON.stringify(game?.config.policies)
    //     : ``,
    //   color: game?.metadata.color || "#5bc3e6",
    //   preset: game?.metadata.preset || "zkube",
    //   name: game?.metadata.name || "zKube",
    //   description:
    //     game?.metadata.description ||
    //     "zKube is an engaging puzzle game that puts players' strategic thinking to the test. Set within a dynamic grid, the objective is simple: manipulate blocks to form solid lines and earn points. Each turn, a new line of blocks emerges from the bottom of the grid, and players have the opportunity to slide any block horizontally to strategically position them. The challenge lies in clearing lines efficiently to prevent the grid from filling up. With no notion of speed or acceleration, zKube offers a purely reflective gameplay experience, allowing players to focus solely on their puzzle-solving skills. Are you ready to dive into the world of zKube and master its captivating challenges?",
    //   image:
    //     game?.metadata.image ||
    //     "https://static.cartridge.gg/presets/zkube/icon.png",
    //   banner:
    //     game?.metadata.banner ||
    //     "https://static.cartridge.gg/presets/zkube/cover.png",
    //   discord: game?.socials.discord || "https://discord.gg/dH4gcNxb",
    //   telegram: game?.socials.telegram || "",
    //   twitter: game?.socials.twitter || "https://x.com/zKube_game",
    //   youtube: game?.socials.youtube || "",
    //   website: game?.socials.website || "https://app.zkube.xyz/",
    //   github: game?.socials.github || "https://github.com/z-korp/zkube",
    //   videos: game?.socials.videos?.join("\n") || [],
    //   images: game?.socials.images?.join("\n") || [],
    // },
    // defaultValues: {
    //   worldAddress:
    //     game?.worldAddress ||
    //     "0x6a9e4c6f0799160ea8ddc43ff982a5f83d7f633e9732ce42701de1288ff705f",
    //   namespace: game?.namespace || "s0_eternum",
    //   project: game?.config.project || "eternum-prod",
    //   rpc: game?.config.rpc || "https://api.cartridge.gg/x/starknet/mainnet",
    //   policies: JSON.stringify(game?.config.policies) || ``,
    //   color: game?.metadata.color || "#dc8b07",
    //   preset: game?.metadata.preset || "eternum",
    //   name: game?.metadata.name || "Eternum",
    //   description: game?.metadata.description || "Rule the Hex.",
    //   image:
    //     game?.metadata.image ||
    //     "https://static.cartridge.gg/presets/eternum/icon.svg",
    //   banner:
    //     game?.metadata.banner ||
    //     "https://static.cartridge.gg/presets/eternum/cover.png",
    //   discord: game?.socials.discord || "https://discord.gg/CEXUEJF3",
    //   telegram: game?.socials.telegram || "",
    //   twitter: game?.socials.twitter || "https://x.com/RealmsEternum",
    //   youtube: game?.socials.youtube || "",
    //   website: game?.socials.website || "https://eternum.realms.world/",
    //   github:
    //   game?.socials.github || "https://github.com/BibliothecaDAO/eternum",
    //   videos: game?.socials.videos?.join("\n") || [],
    //   images: game?.socials.images?.join("\n") || [],
    // },
    defaultValues,
    // defaultValues: {
    //   id: game?.id || 0,
    //   color: metadata?.color || "",
    //   preset: metadata?.properties?.preset || "",
    //   name: metadata?.name || "",
    //   description: metadata?.description || "",
    //   image: metadata?.image || "",
    //   banner: metadata?.banner || "",
    //   discord: metadata?.socials?.discord || "",
    //   telegram: metadata?.socials?.telegram || "",
    //   twitter: metadata?.socials?.twitter || "",
    //   youtube: metadata?.socials?.youtube || "",
    //   website: metadata?.socials?.website || "",
    //   github: metadata?.socials?.github || "",
    //   videos: metadata?.socials?.videos?.join("\n") || "",
    //   images: metadata?.socials?.images?.join("\n") || "",
    // },
  });

  const onDelete = useCallback(() => {
    if (!game || !account) return;
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) return;
    const process = async () => {
      setLoading(true);
      try {
        const args = {
          gameId: game.id,
        };
        const calls = provider.registry.remove_game(args);
        controller.switchStarknetChain(constants.StarknetChainId.SN_MAIN);
        await account.execute(calls);
        setClose(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    process();
  }, [provider, account, connector, game, setClose]);

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (!account) return;
      const controller = (connector as ControllerConnector)?.controller;
      if (!controller) return;
      const process = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        // Fetch images and encode them in base64
        const image = await MetadataHelper.gameImage(
          values.color,
          values.cover,
          values.image,
        );
        try {
          let calls: AllowArray<Call> = [];
          const attributes = new Attributes({
            color: values.color,
            preset: values.preset,
          });
          const properties = new Properties({
            preset: values.preset,
            icon: values.image,
            banner: values.banner,
            cover: values.cover,
          });
          const socials = new Socials({
            discord: values.discord,
            telegram: values.telegram,
            twitter: values.twitter,
            youtube: values.youtube,
            website: values.website,
            github: values.github,
            videos: values.videos.split("\n"),
            images: values.images.split("\n"),
          });
          const args = {
            gameId: BigInt(game?.id || 0),
            color: byteArray.byteArrayFromString(values.color),
            image: byteArray.byteArrayFromString(image),
            image_data: byteArray.byteArrayFromString(""),
            external_url: byteArray.byteArrayFromString(values.website),
            description: byteArray.byteArrayFromString(values.description),
            name: byteArray.byteArrayFromString(values.name),
            attributes: attributes.compile(),
            animation_url: byteArray.byteArrayFromString(""),
            youtube_url: byteArray.byteArrayFromString(values.youtube),
            properties: properties.compile(),
            socials: socials.compile(),
          };
          if (!game) {
            calls = provider.registry.register_game(args);
          } else {
            calls = provider.registry.update_game(args);
          }
          controller.switchStarknetChain(constants.StarknetChainId.SN_MAIN);
          await account.execute(calls);
          setClose(true);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      process(values);
    },
    [provider, account, connector, setClose],
  );

  return (
    <Sheet open={close} onOpenChange={setClose}>
      <SheetTrigger asChild>
        {!game ? (
          <Button
            className="normal-case text-sm font-medium text-foreground-300 tracking-normal font-sans grow"
            variant="secondary"
            disabled={!account}
          >
            <PlusIcon size="xs" variant="solid" />
            Register Game
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="icon"
            className="w-8 h-8 bg-background-150 hover:bg-background-200 text-foreground-300 hover:text-foreground-100 border border-background-200"
            disabled={!account}
          >
            <GearIcon size="sm" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="border-background-300 overflow-clip flex flex-col">
        <SheetHeader>
          <SheetTitle className="select-none">
            {game ? "Update a Game" : "Register a new Game"}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 overflow-y-scroll"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex flex-col gap-2">
              <Topic label="Metadata" />
              <Field
                name="name"
                label="Name *"
                placeholder="Dojo Starter"
                form={form}
              />
              <Field
                name="description"
                label="Description *"
                placeholder="A dojo starter game"
                form={form}
              />
              <Field
                name="image"
                label="Image"
                placeholder="https://dojo.com/icon.png"
                form={form}
              />
              <Field
                name="banner"
                label="Banner"
                placeholder="https://dojo.com/banner.png"
                form={form}
              />
              <Field
                name="cover"
                label="Cover"
                placeholder="https://dojo.com/cover.png"
                form={form}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Topic label="Attributes" />
              <Field
                name="color"
                label="Color *"
                placeholder="#123456"
                form={form}
              />
              <Field
                name="preset"
                label="Preset *"
                placeholder="cartridge"
                form={form}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Topic label="Socials" />
              <Field
                name="discord"
                label="Discord"
                placeholder="https://discord.com/dojo"
                form={form}
              />
              <Field
                name="telegram"
                label="Telegram"
                placeholder="https://t.me/dojoengine"
                form={form}
              />
              <Field
                name="twitter"
                label="Twitter"
                placeholder="https://x.com/ohayo_dojo"
                form={form}
              />
              <Field
                name="youtube"
                label="Youtube"
                placeholder="https://www.youtube.com/watch?v=lclg7FmIkLQ"
                form={form}
              />
              <Field
                name="website"
                label="Website"
                placeholder="https://book.dojoengine.org/"
                form={form}
              />
              <Field
                name="github"
                label="Github"
                placeholder="https://github.com/dojoengine/dojo"
                form={form}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Topic label="Gallery" />
              <Field
                name="videos"
                label="Videos"
                placeholder="https://youtu.be/bkNF9VdY2-o https://youtu.be/-ptcWqcGiuo"
                form={form}
              />
              <Field
                name="images"
                label="Images"
                placeholder="https://dojo.com/1.png https://dojo.com/2.png"
                form={form}
              />
            </div>
            <div className="flex gap-2 mt-4">
              {game && (
                <Button variant="secondary" size="icon" onClick={onDelete}>
                  <TrashIcon size="xs" />
                </Button>
              )}
              <Button className="grow" type="submit" isLoading={loading}>
                {game ? "Update" : "Register"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export const Topic = ({ label }: { label: string }) => {
  return (
    <div className="w-full select-none uppercase font-semibold text-xs text-background-500 flex gap-2 justify-between items-center">
      <div className="grow">
        <Separator
          orientation="horizontal"
          className="h-px bg-background-200"
        />
      </div>
      <p className="grow-0">{label}</p>
      <div className="grow">
        <Separator
          orientation="horizontal"
          className="h-px bg-background-200"
        />
      </div>
    </div>
  );
};

export const Field = ({
  name,
  label,
  placeholder,
  form,
  disabled,
}: {
  name: string;
  label: string;
  placeholder: string;
  form: UseFormReturn<z.infer<typeof formSchema>>;
  disabled?: boolean;
}) => {
  return (
    <FormField
      control={form.control}
      name={
        name as
          | "color"
          | "website"
          | "preset"
          | "description"
          | "image"
          | "banner"
          | "discord"
          | "telegram"
          | "twitter"
          | "youtube"
          | "videos"
          | "images"
      }
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-right w-20 select-none normal-case text-xs">
            {label}
          </FormLabel>
          <FormControl>
            {name === "videos" || name === "images" ? (
              <Textarea
                placeholder={placeholder}
                {...field}
                disabled={disabled}
              />
            ) : (
              <Input placeholder={placeholder} {...field} disabled={disabled} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
