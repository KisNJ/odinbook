import * as trpc from "@trpc/server";
import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

export const queryUsers = createProtectedRouter()
  .query("searchUsers", {
    input: z.object({
      nameFragemant: z.string(),
    }),
    async resolve({ ctx, input }) {
      return {
        possibleUsers: await ctx.prisma.user.findMany({
          where: {
            name: {
              contains: input.nameFragemant,
              mode: "insensitive",
            },
          },
        }),
      };
    },
  })
  .query("getUserData", {
    input: z.object({
      userId: z.string().cuid(),
    }),
    async resolve({ ctx, input }) {
      const userToDisplay = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          myFriends: true,
          friendRequests: true,
          acceptedMyRequest: true,
          sentFriendRequests: true,
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

      const indexOfRequest = userToDisplay.friendRequests.findIndex(
        (user) => user.id === ctx.session.user.id,
      );
      const indexOfRequestFromThem = userToDisplay.sentFriendRequests.findIndex(
        (user) => user.id === ctx.session.user.id,
      );
      if (indexOfFriend >= 0 || indexOfFriend2 >= 0) {
        return {
          userData: await ctx.prisma.user.findUnique({
            where: { id: input.userId },
          }),
          isFriend: true,
        };
      } else {
        return {
          userData: await ctx.prisma.user.findUnique({
            where: { id: input.userId },
            select: { name: true, id: true, image: true },
          }),
          sentRequest: indexOfRequest >= 0 ? true : false,
          isFriend: false,
          recievedRequestFromThem: indexOfRequestFromThem >= 0 ? true : false,
        };
      }
    },
  })
  .query("myProfile", {
    async resolve({ ctx }) {
      return {
        profile: await ctx.prisma.user.findUnique({
          where: {
            id: ctx.session.user.id,
          },
        }),
      };
    },
  })
  .mutation("sendRequest", {
    input: z.object({
      userId: z.string().cuid(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          friendRequests: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
    },
  })
  .mutation("cancelRequest", {
    input: z.object({
      userId: z.string().cuid(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          friendRequests: {
            disconnect: { id: ctx.session.user.id },
          },
        },
      });
    },
  })
  .mutation("acceptRequest", {
    input: z.object({
      userId: z.string().cuid(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          friendRequests: {
            disconnect: { id: ctx.session.user.id },
          },
          sentFriendRequests: {
            disconnect: { id: ctx.session.user.id },
          },
        },
      });
      await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          myFriends: {
            connect: { id: input.userId },
          },
        },
      });
    },
  })
  .mutation("declineRequest", {
    input: z.object({
      userId: z.string().cuid(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          friendRequests: {
            disconnect: { id: input.userId },
          },
          sentFriendRequests: {
            disconnect: { id: input.userId },
          },
        },
      });
    },
  })
  .mutation("removeFriend", {
    input: z.object({
      userId: z.string().cuid(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          myFriends: {
            disconnect: { id: input.userId },
          },
          acceptedMyRequest: {
            disconnect: { id: input.userId },
          },
        },
      });
      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          myFriends: {
            disconnect: { id: ctx.session.user.id },
          },
          acceptedMyRequest: {
            disconnect: { id: ctx.session.user.id },
          },
        },
      });
    },
  });
