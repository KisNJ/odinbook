import { createProtectedRouter } from "./protected-router";
import { z } from "zod";
import { resolve } from "path";
export const postRouter = createProtectedRouter()
  .mutation("createPost", {
    input: z.object({
      location: z.string(),
      title: z.string().min(1),
      content: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.post.create({
        data: {
          ...input,
          author: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    },
  })
  .mutation("addLike", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.post.update({
        where: {
          id: input.postId,
        },
        data: {
          likes: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
    },
  });
