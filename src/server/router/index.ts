// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { mainPageRouter } from "./mainPage";
import { postRouter } from "./postRouter";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("main.", mainPageRouter)
  .merge("post.", postRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
