import { queryKeys } from "@/queries/keys";
import { sqlClient } from "@/queries";
import { useQuery } from "react-query";

export type Metadata = {
  traitName: string;
  traitValue: string;
  count: number;
};

type MetadataResponse = {
  count: number;
  trait_name: string;
  trait_value: string;
};

const getMetadataQuery = ({
  contractAddress,
  traits,
}: { contractAddress: string; traits: { name: string; value: string }[] }) => {
  const whereClause =
    traits
      .map(
        (trait) =>
          `(trait_name LIKE '${trait.name}' AND trait_value LIKE '${trait.value}')`,
      )
      .join(" OR ") || "1 = 1";
  return `SELECT
        trait_name,
        trait_value,
        count
    FROM (
        SELECT
            trait_name,
            trait_value,
            COUNT(*) AS count,
            ROW_NUMBER() OVER (PARTITION BY trait_value ORDER BY COUNT(*) DESC) AS rn
        FROM token_attributes
        WHERE token_id IN (
            SELECT token_id
            FROM token_attributes
            WHERE ${whereClause}
              AND token_id LIKE '0x${BigInt(contractAddress).toString(16)}:%'
            GROUP BY token_id
            ${traits.length > 0 ? `HAVING COUNT(DISTINCT trait_name) = ${traits.length}` : ""}
        )
        GROUP BY trait_name, trait_value
    ) ranked
    WHERE rn = 1
    ORDER BY trait_value, trait_name;
  `;
};

export const getMetadataQueryOptions = ({
  contractAddress,
  traits,
}: { contractAddress: string; traits: { name: string; value: string }[] }) => {
  return {
    queryKey: queryKeys.metadata.traits(contractAddress, traits),
    queryFn: async () => {
      const data = await sqlClient<MetadataResponse>(
        getMetadataQuery({ contractAddress, traits }),
      );

      return data.map((meta) => ({
        traitName: meta.trait_name,
        traitValue: meta.trait_value,
        count: meta.count,
      }));
    },
  };
};

export const useMetadata = ({
  contractAddress,
  traits,
}: { contractAddress: string; traits: { name: string; value: string }[] }) => {
  return useQuery({
    queryKey: [
      "torii-metadata",
      contractAddress,
      traits.map((t) => `${t.name}-${t.value}`).join("-"),
    ],
    queryFn: async () => {
      try {
        const query = getMetadataQuery({ contractAddress, traits });
        const data = await sqlClient<MetadataResponse>(query);
        return data.map((meta) => ({
          traitName: meta.trait_name,
          traitValue: meta.trait_value,
          count: meta.count,
        }));
      } catch (error) {
        console.error("Error fetching metadata:", error);
        return "";
      }
    },
    enabled: !!contractAddress,
  });
};
