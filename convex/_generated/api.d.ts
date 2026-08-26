/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as conversations from "../conversations.js";
import type * as http from "../http.js";
import type * as listings from "../listings.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as seed from "../seed.js";
import type * as seed50to100 from "../seed50to100.js";
import type * as seedBulk from "../seedBulk.js";
import type * as seedReal from "../seedReal.js";
import type * as seedSellers from "../seedSellers.js";
import type * as seller from "../seller.js";
import type * as tickets from "../tickets.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  conversations: typeof conversations;
  http: typeof http;
  listings: typeof listings;
  notifications: typeof notifications;
  orders: typeof orders;
  seed: typeof seed;
  seed50to100: typeof seed50to100;
  seedBulk: typeof seedBulk;
  seedReal: typeof seedReal;
  seedSellers: typeof seedSellers;
  seller: typeof seller;
  tickets: typeof tickets;
  transactions: typeof transactions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
