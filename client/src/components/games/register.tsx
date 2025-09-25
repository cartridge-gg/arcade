import { useArcade } from "@/hooks/arcade";
import {
  Button,
  Input,
  PlusIcon,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Textarea,
} from "@cartridge/ui";
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
import { Attributes, Properties, Socials } from "@cartridge/arcade";
import ControllerConnector from "@cartridge/connector/controller";
import { MetadataHelper } from "@/helpers/metadata";
import { formSchema } from "./register-form";
// import { data } from "./data";

export function Register() {
  const { account, connector } = useAccount();
  const { provider } = useArcade();
  const [loading, setLoading] = useState(false);
  const [close, setClose] = useState(false);

  const defaultValues = useMemo(() => {
    // return { ...data.eternum };
    return {
      worldAddress: "",
      namespace: "",
      project: "",
      rpc: "",
      policies: "",
      preset: "",
      color: "",
      name: "",
      description: "",
      image: "",
      banner: "",
      cover: "",
      discord: "",
      telegram: "",
      twitter: "",
      youtube: "",
      website: "",
      github: "",
      videos: "",
      images: "",
    };
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (!account) return;
      const controller = (connector as ControllerConnector)?.controller;
      if (!controller) return;
      const process = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        // Fetch images and encode them in base64
        const gameImage = await MetadataHelper.gameImage(
          values.color,
          values.cover,
          values.image,
        );
        const editionImage = await MetadataHelper.editionImage(
          values.color,
          values.cover,
          values.image,
        );
        try {
          const gameAttributes = new Attributes({
            color: values.color,
            preset: values.preset,
          });
          const editionAttributes = new Attributes({
            color: values.color,
            preset: values.preset,
            game: values.name,
          });
          const properties = new Properties({
            preset: values.preset,
            icon: values.image,
            banner: values.banner,
            cover: values.cover,
          });
          const gameSocials = new Socials({
            discord: values.discord,
            telegram: values.telegram,
            twitter: values.twitter,
            youtube: values.youtube,
          });
          const editionSocials = new Socials({
            website: values.website,
            github: values.github,
            videos: values.videos.split("\n"),
            images: values.images.split("\n"),
          });
          const args = {
            worldAddress: `0x${BigInt(values.worldAddress).toString(16)}`,
            namespace: values.namespace,
            project: byteArray.byteArrayFromString(values.project),
            rpc: byteArray.byteArrayFromString(values.rpc),
            policies: byteArray.byteArrayFromString(""),
            color: byteArray.byteArrayFromString(values.color),
            game_image: byteArray.byteArrayFromString(gameImage),
            edition_image: byteArray.byteArrayFromString(editionImage),
            external_url: byteArray.byteArrayFromString(values.website),
            description: byteArray.byteArrayFromString(values.description),
            game_name: byteArray.byteArrayFromString(values.name),
            edition_name: byteArray.byteArrayFromString("Main"),
            game_attributes: gameAttributes.compile(),
            edition_attributes: editionAttributes.compile(),
            animation_url: byteArray.byteArrayFromString(""),
            youtube_url: byteArray.byteArrayFromString(values.youtube),
            properties: properties.compile(),
            game_socials: gameSocials.compile(),
            edition_socials: editionSocials.compile(),
          };
          const calls: AllowArray<Call> = provider.registry.register_game(args);
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
        <Button
          data-disabled
          className="normal-case text-sm font-medium text-foreground-300 tracking-normal font-sans grow data-[disabled]:opacity-50"
          variant="secondary"
          disabled
        >
          <PlusIcon size="xs" variant="solid" />
          Register Game
        </Button>
      </SheetTrigger>
      <SheetContent className="border-background-300 overflow-clip flex flex-col">
        <SheetHeader>
          <SheetTitle className="select-none">Register a new Game</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 overflow-y-scroll"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex flex-col gap-2">
              <Topic label="General" />
              <Field
                name="worldAddress"
                label="World Address *"
                placeholder="0x..."
                form={form}
              />
              <Field
                name="namespace"
                label="Namespace *"
                placeholder="dojo_starter"
                form={form}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Topic label="Config" />
              <Field
                name="project"
                label="Project (slot namespace) *"
                placeholder="dojogame"
                form={form}
              />
              <Field
                name="rpc"
                label="RPC *"
                placeholder="https://rpc.dojo.com"
                form={form}
              />
              <Field
                name="policies"
                label="Policies"
                placeholder="https://policies.dojo.com"
                form={form}
              />
            </div>
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
              <Button className="grow" type="submit" isLoading={loading}>
                Register
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
