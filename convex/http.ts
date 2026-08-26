import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Required by @convex-dev/auth — handles sign-in/sign-out HTTP callbacks
auth.addHttpRoutes(http);

export default http;
