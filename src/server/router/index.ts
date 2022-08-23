// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { mainPageRouter } from "./mainPage";
import { postRouter } from "./postRouter";
import { queryUsers } from "./queryUsers";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("main.", mainPageRouter)
  .merge("post.", postRouter)
  .merge("search.", queryUsers);

// export type definition of API
export type AppRouter = typeof appRouter;
