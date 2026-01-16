import { protectedProcedure } from "../../init";
import prisma from "@/lib/prismadb";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const submitBasicSchema = z.object({
  fullName: z.string().trim().min(3).max(120),
  address: z.string().trim().min(10).max(400),
  selfieImageUrl: z.string().url(),
});

const submitAdvancedSchema = z.object({
  documentType: z.enum(["passport", "id_card"]),
  documentFrontUrl: z.string().url(),
  documentBackUrl: z.string().url().optional(),
});

type KycStatus = {
  basicStatus: string;
  advancedStatus: string;
  fullName: string | null;
  address: string | null;
  selfieImageUrl: string | null;
  documentType: string | null;
  documentFrontUrl: string | null;
  documentBackUrl: string | null;
  basicSubmittedAt: Date | null;
  advancedSubmittedAt: Date | null;
  advancedReviewedAt: Date | null;
};

export const kycRouter = {
  getKycStatus: protectedProcedure.query(async ({ ctx }): Promise<KycStatus> => {
    try {
      const row = await (prisma as any).kycSubmission?.findUnique?.({
        where: { userId: ctx.auth.user.id },
        select: {
          basicStatus: true,
          advancedStatus: true,
          fullName: true,
          address: true,
          selfieImageUrl: true,
          documentType: true,
          documentFrontUrl: true,
          documentBackUrl: true,
          basicSubmittedAt: true,
          advancedSubmittedAt: true,
          advancedReviewedAt: true,
        },
      });

      if (!row) {
        return {
          basicStatus: "not_submitted",
          advancedStatus: "not_submitted",
          fullName: null,
          address: null,
          selfieImageUrl: null,
          documentType: null,
          documentFrontUrl: null,
          documentBackUrl: null,
          basicSubmittedAt: null,
          advancedSubmittedAt: null,
          advancedReviewedAt: null,
        };
      }

      return row as KycStatus;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch KYC status",
      });
    }
  }),

  submitBasicKyc: protectedProcedure
    .input(submitBasicSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const existing = await (prisma as any).kycSubmission?.findUnique?.({
          where: { userId: ctx.auth.user.id },
          select: { id: true, basicStatus: true, advancedStatus: true },
        });

        const now = new Date();
        const data = {
          userId: ctx.auth.user.id,
          // Auto-approve basic for now as requested.
          basicStatus: "approved",
          fullName: input.fullName,
          address: input.address,
          selfieImageUrl: input.selfieImageUrl,
          basicSubmittedAt: now,
          basicReviewedAt: now,
          basicReviewNote: "Auto-approved",
          updatedAt: now,
        };

        if (!existing) {
          await (prisma as any).kycSubmission?.create?.({
            data: {
              ...data,
              advancedStatus: "not_submitted",
            },
          });
        } else {
          await (prisma as any).kycSubmission?.update?.({
            where: { id: existing.id },
            data,
          });
        }

        // Sync Basic KYC details into user profile so user doesn't need to enter twice.
        // - Name: update to legal name
        // - Location: store full address string (used in profile UI)
        await prisma.user.update({
          where: { id: ctx.auth.user.id },
          data: {
            name: input.fullName,
            location: input.address,
            updatedAt: now,
          } as any,
        });

        // After Basic KYC, set user's avatar to the selfie (only if not already set).
        await prisma.user.updateMany({
          where: { id: ctx.auth.user.id, image: null },
          data: { image: input.selfieImageUrl, updatedAt: now },
        });

        return { success: true, status: "approved" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit basic KYC",
        });
      }
    }),

  submitAdvancedKyc: protectedProcedure
    .input(submitAdvancedSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const existing = await (prisma as any).kycSubmission?.findUnique?.({
          where: { userId: ctx.auth.user.id },
          select: { id: true },
        });

        if (!existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Please complete Basic KYC first.",
          });
        }

        const now = new Date();
        // Auto-approve advanced for now as requested.
        await (prisma as any).kycSubmission?.update?.({
          where: { id: existing.id },
          data: {
            documentType: input.documentType,
            documentFrontUrl: input.documentFrontUrl,
            documentBackUrl: input.documentBackUrl ?? null,
            advancedStatus: "approved",
            advancedSubmittedAt: now,
            advancedReviewedAt: now,
            updatedAt: now,
          },
        });

        return { success: true, status: "approved" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit advanced KYC",
        });
      }
    }),
};

