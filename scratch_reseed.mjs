import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const client = new ConvexHttpClient("https://patient-squirrel-8.convex.cloud");

async function main() {
  console.log("Calling reseedGames...");
  const res = await client.mutation(api.seed.reseedGames);
  console.log("reseedGames response:", res);

  const games = await client.query(api.listings.getGames);
  console.log("New games in Convex:", games.map(g => ({ name: g.name, slug: g.slug, id: g._id })));

  console.log("Calling seed50to100PerGame...");
  const res2 = await client.mutation(api.seed50to100.seed50to100PerGame);
  console.log("seed50to100PerGame response:", res2);
}

main();
