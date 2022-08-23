import * as trpc from "@trpc/server";
import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

export const queryUsers = createProtectedRouter().query("searchUsers", {
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
});
