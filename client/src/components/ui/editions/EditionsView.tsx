import { Select, SelectContent, DotsIcon } from "@cartridge/ui";
import ArcadeMenuButton from "@/components/ui/modules/menu-button";
import EditionActions from "@/components/ui/modules/edition-actions";
import EditionAction from "@/components/ui/modules/edition-item";
import { Register } from "./register";
import { Publish } from "./publish";
import { Whitelist } from "./whitelist";
import { Prioritize } from "./prioritize";
import type { EditionsViewModel } from "@/features/editions/useEditionsViewModel";
import type { EditionModel } from "@cartridge/arcade";

interface EditionsViewProps extends EditionsViewModel {}

export const EditionsView = ({
  game,
  selectedEdition,
  editions,
  isEditionOwner,
  isGameOwner,
  navigateToEdition,
  updateLocalEdition,
}: EditionsViewProps & {
  updateLocalEdition: (
    updater: (edition: EditionModel) => EditionModel,
  ) => void;
}) => {
  if (!game || editions.length === 0) return null;

  return (
    <div className="flex items-stretch gap-2 h-8">
      <EditionActions
        disabled={editions.length < 2}
        label={selectedEdition?.name || ""}
        certified={selectedEdition?.certified}
        whitelisted={selectedEdition?.whitelisted}
        published={selectedEdition?.published}
      >
        {editions.map((item) => (
          <EditionAction
            key={item.id}
            active={item.active}
            label={item.name}
            certified={item.certified}
            whitelisted={item.whitelisted}
            published={item.published}
            onClick={() => navigateToEdition(item.edition)}
          />
        ))}
      </EditionActions>
      {selectedEdition && isEditionOwner && (
        <Register game={game} edition={selectedEdition} />
      )}
      {selectedEdition && (isEditionOwner || isGameOwner) && (
        <Select>
          <div className="grow flex justify-end items-center self-center">
            <ArcadeMenuButton
              active={false}
              className="bg-background-150 border border-background-200 hover:text-foreground-100"
            >
              <DotsIcon size="sm" />
            </ArcadeMenuButton>
          </div>
          <SelectContent className="bg-background-100">
            {selectedEdition && isEditionOwner && (
              <Register
                key={selectedEdition.id}
                game={game}
                edition={selectedEdition}
              />
            )}
            {selectedEdition && isEditionOwner && (
              <Publish
                key={selectedEdition.published ? "hide" : "publish"}
                edition={selectedEdition}
                action={selectedEdition.published ? "hide" : "publish"}
                setPublished={(status) =>
                  updateLocalEdition(
                    (curr) => ({ ...curr, published: status }) as EditionModel,
                  )
                }
              />
            )}
            {selectedEdition && isGameOwner && (
              <Whitelist
                key={selectedEdition.whitelisted ? "blacklist" : "whitelist"}
                edition={selectedEdition}
                action={selectedEdition.whitelisted ? "blacklist" : "whitelist"}
                setWhitelisted={(status) =>
                  updateLocalEdition(
                    (curr) =>
                      ({ ...curr, whitelisted: status }) as EditionModel,
                  )
                }
              />
            )}
            {selectedEdition && isGameOwner && (
              <Prioritize
                key="up"
                edition={selectedEdition}
                editions={editions.map((item) => item.edition)}
                direction="up"
              />
            )}
            {selectedEdition && isGameOwner && (
              <Prioritize
                key="down"
                edition={selectedEdition}
                editions={editions.map((item) => item.edition)}
                direction="down"
              />
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
