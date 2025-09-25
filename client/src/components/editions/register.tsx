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
} from "@cartridge/ui";
import { useAccount } from "@starknet-react/core";
import { useCallback, useMemo, useState } from "react";
import { type AllowArray, byteArray, type Call } from "starknet";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
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
  type EditionModel,
  type GameModel,
  Properties,
  Socials,
} from "@cartridge/arcade";
import type ControllerConnector from "@cartridge/connector/controller";
import { MetadataHelper } from "@/helpers/metadata";
import { formSchema } from "./form";
import ControllerAction from "../modules/controller-action";

export function Register({
  game,
  edition,
}: {
  game: GameModel;
  edition?: EditionModel;
}) {
  const { account, connector } = useAccount();
  const { provider } = useArcade();
  const [loading, setLoading] = useState(false);
  const [close, setClose] = useState(false);

  const defaultValues = useMemo(() => {
    return {
      worldAddress: edition?.worldAddress || "",
      namespace: edition?.namespace || "",
      project: edition?.config.project || "",
      rpc: edition?.config.rpc || "",
      policies: edition?.config.policies || "",
      preset: edition?.properties?.preset || "",
      name: edition?.name || "",
      description: edition?.description || "",
      image: edition?.properties.icon || "",
      website: edition?.socials?.website || "",
      github: edition?.socials?.github || "",
      videos: edition?.socials?.videos?.join("\n") || "",
      images: edition?.socials?.images?.join("\n") || "",
    };
  }, [edition]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onDelete = useCallback(() => {
    if (!edition || !account) return;
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) return;
    const process = async () => {
      setLoading(true);
      try {
        const args = {
          editionId: edition.id,
        };
        const calls = provider.registry.remove_edition(args);
        await account.execute(calls);
        setClose(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    process();
  }, [provider, account, connector, edition, setClose]);

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (!account) return;
      const controller = (connector as ControllerConnector)?.controller;
      if (!controller) return;
      const process = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        // Fetch images and encode them in base64
        const image = await MetadataHelper.editionImage(
          game.color,
          game.properties.cover || "",
          values.image,
        );
        try {
          let calls: AllowArray<Call> = [];
          const attributes = new Attributes({
            preset: values.preset,
          });
          const properties = new Properties({
            preset: values.preset,
            icon: values.image,
          });
          const socials = new Socials({
            website: values.website,
            github: values.github,
            videos: values.videos.split("\n"),
            images: values.images.split("\n"),
          });
          const args = {
            worldAddress: `0x${BigInt(values.worldAddress).toString(16)}`,
            namespace: values.namespace,
            gameId: `0x${BigInt(game.id).toString(16)}`,
            editionId: `0x${BigInt(edition?.id || 0).toString(16)}`,
            project: byteArray.byteArrayFromString(values.project),
            rpc: byteArray.byteArrayFromString(values.rpc),
            policies: byteArray.byteArrayFromString(values.policies),
            color: byteArray.byteArrayFromString(game.color),
            image: byteArray.byteArrayFromString(image),
            image_data: byteArray.byteArrayFromString(""),
            external_url: byteArray.byteArrayFromString(values.website),
            description: byteArray.byteArrayFromString(values.description),
            name: byteArray.byteArrayFromString(values.name),
            attributes: attributes.compile(),
            animation_url: byteArray.byteArrayFromString(""),
            youtube_url: byteArray.byteArrayFromString(""),
            properties: properties.compile(),
            socials: socials.compile(),
          };
          if (!edition) {
            calls = provider.registry.register_edition(args);
          } else {
            calls = provider.registry.update_edition(args);
          }
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
        {!edition ? (
          <Button
            size="icon"
            className="w-8 h-8 bg-background-150 hover:bg-background-200 text-foreground-300 hover:text-foreground-100"
            // disabled // Remove locally to register
          >
            <PlusIcon size="sm" variant="solid" />
          </Button>
        ) : (
          <ControllerAction
            disabled={!account}
            label={"Update"}
            Icon={<GearIcon size="sm" />}
          />
        )}
      </SheetTrigger>
      <SheetContent className="border-background-300 overflow-clip flex flex-col">
        <SheetHeader>
          <SheetTitle className="select-none">
            {edition ? "Update an Edition" : "Register a new Edition"}
          </SheetTitle>
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
                disabled={!!edition}
              />
              <Field
                name="namespace"
                label="Namespace *"
                placeholder="dojo_starter"
                form={form}
                disabled={!!edition}
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
            </div>
            <div className="flex flex-col gap-2">
              <Topic label="Attributes" />
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
              {edition && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => onDelete()}
                >
                  <TrashIcon size="xs" />
                </Button>
              )}
              <Button className="grow" type="submit" isLoading={loading}>
                {edition ? "Update" : "Register"}
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
          | "worldAddress"
          | "namespace"
          | "project"
          | "rpc"
          | "policies"
          | "name"
          | "description"
          | "image"
          | "website"
          | "github"
          | "preset"
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
