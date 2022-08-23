import { createRouter } from "./context";

import { createNextApiHandler } from "@trpc/server/adapters/next";
import { createProtectedRouter } from "./protected-router";

export const mainPageRouter = createProtectedRouter()
  //get friends' posts
  .query("posts", {
    async resolve({ ctx }) {
      // ctx.prisma.post.findMany({ where: { author: { friends: "asdsd" } } });
      return {
        posts: await ctx.prisma.post.findMany({
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
          orderBy: [
            {
              createdAt: "desc",
            },
          ],
          include: {
            author: true,
            // comments: true,
            comments: {
              include: {
                author: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
            likes: true,
          },
        }),
      };
    },
  });
