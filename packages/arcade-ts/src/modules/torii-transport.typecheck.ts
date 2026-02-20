import { fetchToriis } from "./torii-fetcher";
import { fetchToriisSql } from "./torii-sql-fetcher";

async function _typecheckToriiTransports() {
  await fetchToriis(["arcade-main"], {
    client: async () => ({ ok: true }),
  });

  await fetchToriisSql(["arcade-main"], "SELECT 1");

  // SQL must stay on the dedicated SQL transport.
  // @ts-expect-error fetchToriis is client-callback only.
  await fetchToriis(["arcade-main"], { sql: "SELECT 1" });
}

void _typecheckToriiTransports;
