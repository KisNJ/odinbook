import { createRouter } from "./context";
import { z } from "zod";
import { createNextApiHandler } from "@trpc/server/adapters/next";
import { createProtectedRouter } from "./protected-router";

export const mainPageRouter = createProtectedRouter()
  //get friends' posts
  .query("posts", {
    resolve({ ctx }) {
      // ctx.prisma.post.findMany({ where: { author: { friends: "asdsd" } } });
      return {
        posts: ctx.prisma.post.findMany({
          where: {
            OR: [
              {
                author: {
                  friends: {
                    some: {
                      id: ctx.session.user.id,
                    },
                  },
                },
              },
              {
                author: {
                  is: {
                    id: ctx.session.user.id,
                  },
                },
              },
            ],
          },
        }),
      };
    },
  });
