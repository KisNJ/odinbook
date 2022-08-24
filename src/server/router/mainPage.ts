import * as trpc from "@trpc/server";
import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

export const mainPageRouter = createProtectedRouter()
  //get friends' posts
  .query("posts", {
    input: z
      .object({
        type: z.string().optional(),
        userId: z.string().cuid().optional(),
      })
      .optional(),
    async resolve({ ctx, input }) {
      if (input?.type === undefined) {
        return {
          posts: await ctx.prisma.post.findMany({
            where: {
              OR: [
                {
                  author: {
                    myFriends: {
                      some: {
                        id: ctx.session.user.id,
                      },
                    },
                  },
                },
                {
                  author: {
                    acceptedMyRequest: {
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
      } else if (input?.type === "THEIRS") {
        const userToDisplay = await ctx.prisma.user.findUnique({
          where: { id: input.userId as string },
          include: {
            myFriends: true,
            acceptedMyRequest: true,
          },
        });
        if (userToDisplay === null) {
          throw new trpc.TRPCError({ code: "BAD_REQUEST" });
        }
        const indexOfFriend = userToDisplay.myFriends.findIndex(
          (user) => user.id === ctx.session.user.id,
        );
        const indexOfFriend2 = userToDisplay.acceptedMyRequest.findIndex(
          (user) => user.id === ctx.session.user.id,
        );
        if (indexOfFriend >= 0 || indexOfFriend2 >= 0) {
          return {
            posts: await ctx.prisma.post.findMany({
              where: {
                author: {
                  is: {
                    id: input.userId,
                  },
                },
              },
              orderBy: [
                {
                  createdAt: "desc",
                },
              ],
              include: {
                author: {
                  include: {
                    friendRequests: true,
                  },
                },
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
        } else {
          throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
        }
      } else {
        return {
          posts: await ctx.prisma.post.findMany({
            where: {
              author: {
                is: {
                  id: ctx.session.user.id,
                },
              },
            },
            orderBy: [
              {
                createdAt: "desc",
              },
            ],
            include: {
              author: {
                include: {
                  friendRequests: true,
                },
              },
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
          friendRequests: await ctx.prisma.user.findMany({
            where: {
              id: ctx.session.user.id,
            },

            select: {
              friendRequests: true,
            },
          }),
        };
      }
    },
  });
