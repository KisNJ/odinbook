import { createProtectedRouter } from "./protected-router";
import { z } from "zod";
import * as trpc from "@trpc/server";

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
  })
  .mutation("removeLike", {
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
            disconnect: { id: ctx.session.user.id },
          },
        },
      });
    },
  })
  .mutation("deletePost", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const postTobeDeleted = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
        include: {
          author: true,
        },
      });
      if (postTobeDeleted?.author.id === ctx.session.user.id) {
        await ctx.prisma.post.delete({
          where: { id: input.postId },
        });
        await ctx.prisma.comment.deleteMany({
          where: {
            post: {
              is: {
                id: input.postId,
              },
            },
          },
        });
      } else {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }
    },
  })
  .mutation("updatePost", {
    input: z.object({
      title: z.string(),
      location: z.string(),
      content: z.string(),
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const postTobeUpdated = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
        include: { author: true },
      });
      if (postTobeUpdated?.author.id === ctx.session.user.id) {
        await ctx.prisma.post.update({
          where: { id: input.postId },
          data: {
            title: input.title,
            location: input.location,
            content: input.content,
          },
        });
      } else {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }
    },
  })
  .mutation("createComment", {
    input: z.object({
      postId: z.string().cuid(),
      content: z.string(),
      idNew: z.string(),
    }),
    async resolve({ ctx, input }) {
      const postWhereCommentGoes = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
        include: {
          author: {
            include: {
              myFriends: true,
              acceptedMyRequest: true,
            },
          },
        },
      });
      if (postWhereCommentGoes === null) {
        throw new trpc.TRPCError({ code: "BAD_REQUEST" });
      }
      let canComment = false;
      let i = 0;
      if (postWhereCommentGoes!.author.id === ctx.session.user.id) {
        canComment = true;
      }
      while (!canComment && i < postWhereCommentGoes!.author.myFriends.length) {
        if (
          postWhereCommentGoes?.author.myFriends[i]?.id === ctx.session.user.id
        ) {
          canComment = true;
        }
        i++;
      }
      let k = 0;
      while (
        !canComment &&
        k < postWhereCommentGoes!.author.acceptedMyRequest.length
      ) {
        if (
          postWhereCommentGoes?.author.acceptedMyRequest[k]?.id ===
          ctx.session.user.id
        ) {
          canComment = true;
        }
        k++;
      }
      if (canComment) {
        await ctx.prisma.comment.create({
          data: {
            id: input.idNew,
            post: {
              connect: {
                id: input.postId,
              },
            },
            author: {
              connect: {
                id: ctx.session.user.id,
              },
            },
            content: input.content,
          },
        });
      } else {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }
    },
  })
  .mutation("updateComment", {
    input: z.object({
      content: z.string(),
      commentId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const commentTobeUpdated = await ctx.prisma.comment.findUnique({
        where: { id: input.commentId },
        include: { author: true },
      });
      if (commentTobeUpdated?.author.id === ctx.session.user.id) {
        await ctx.prisma.comment.update({
          where: { id: input.commentId },
          data: {
            content: input.content,
          },
        });
      } else {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }
    },
  })
  .mutation("deleteComment", {
    input: z.object({
      commentId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const commentTobeDeleted = await ctx.prisma.comment.findUnique({
        where: { id: input.commentId },
        include: {
          author: true,
        },
      });
      if (commentTobeDeleted?.author.id === ctx.session.user.id) {
        await ctx.prisma.comment.delete({
          where: { id: input.commentId },
        });
      } else {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }
    },
  });
