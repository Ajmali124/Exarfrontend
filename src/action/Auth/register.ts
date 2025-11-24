"use server";

import prisma from "@/lib/prismadb";

/**
 * Generate a unique invite code for a user
 */
async function generateInviteCode(): Promise<string> {
  let inviteCode: string;
  let isUnique = false;

  while (!isUnique) {
    // Generate a random 8-character alphanumeric code
    inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Check if it already exists
    const existing = await prisma.user.findUnique({
      where: { inviteCode },
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return inviteCode!;
}

/**
 * Generate a crypto-themed username
 * Format: cryptoPrefix + word + number (5-7 characters total)
 */
async function generateCryptoUsername(): Promise<string> {
  const cryptoPrefixes = [
    "eth", "sol", "btc", "ada", "matic", "avax", "dot", "link",
    "uni", "aave", "atom", "near", "ftm", "algo", "xrp", "ltc"
  ];
  
  const cryptoWords = [
    "king", "queen", "star", "moon", "rock", "wave", "fire", "storm",
    "fairy", "dragon", "wolf", "eagle", "tiger", "lion", "shark", "phoenix",
    "nova", "cosmic", "crypto", "block", "chain", "node", "miner", "trader",
    "gem", "coin", "token", "dex", "nft", "dao", "web3", "meta"
  ];
  
  let username: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 50; // Prevent infinite loops

  while (!isUnique && attempts < maxAttempts) {
    attempts++;
    
    // Randomly choose: prefix + word + number OR word + number
    const usePrefix = Math.random() > 0.3; // 70% chance of using prefix
    
    if (usePrefix) {
      const prefix = cryptoPrefixes[Math.floor(Math.random() * cryptoPrefixes.length)];
      const word = cryptoWords[Math.floor(Math.random() * cryptoWords.length)];
      const number = Math.floor(Math.random() * 99) + 1; // 1-99
      
      // Combine and limit to 5-7 characters
      const combined = `${prefix}${word}${number}`;
      username = combined.length <= 7 ? combined : combined.substring(0, 7);
    } else {
      // Just word + number (shorter)
      const word = cryptoWords[Math.floor(Math.random() * cryptoWords.length)];
      const number = Math.floor(Math.random() * 999) + 1; // 1-999
      username = `${word}${number}`;
    }
    
    // Ensure username is 5-7 characters
    if (username.length < 5) {
      // Add more numbers if too short
      username = username + Math.floor(Math.random() * 9) + 1;
    }
    if (username.length > 7) {
      username = username.substring(0, 7);
    }
    
    // Convert to lowercase
    username = username.toLowerCase();
    
    // Check if it already exists
    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (!existing) {
      isUnique = true;
    }
  }

  // Fallback to random alphanumeric if all attempts failed
  if (!isUnique) {
    let fallbackUsername: string;
    let fallbackUnique = false;
    while (!fallbackUnique) {
      fallbackUsername = Math.random().toString(36).substring(2, 9).toLowerCase();
      const existing = await prisma.user.findUnique({
        where: { username: fallbackUsername },
      });
      if (!existing) {
        fallbackUnique = true;
        username = fallbackUsername;
      }
    }
  }

  return username!;
}

/**
 * Find sponsor user by invite code
 */
async function findSponsorByInviteCode(inviteCode: string) {
  const sponsor = await prisma.user.findUnique({
    where: { inviteCode },
    select: { id: true, email: true, name: true },
  });

  return sponsor;
}

/**
 * Handle post-registration logic:
 * This is now only used for processing invite codes (non-blocking)
 * The hook handles invite code generation and user balance creation (FAST!)
 */
export async function handlePostRegistration({
  userId,
  userEmail,
  userName,
  inviteCode,
}: {
  userId?: string;
  userEmail: string;
  userName: string;
  inviteCode?: string;
}) {
  // If userId not provided, get it by email
  if (!userId) {
    const user = await getUserByEmail(userEmail);
    userId = user?.id;
    if (!userId) {
      throw new Error("User not found");
    }
  }
  try {
    // First, get the user to check if they exist
    // Fetch all fields to avoid issues with missing columns
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if inviteCode and username fields exist (they might be null)
    const hasInviteCode = user.inviteCode !== null && user.inviteCode !== undefined;
    const hasUsername = user.username !== null && user.username !== undefined;

    // Find sponsor if invite code provided
    const sponsor = inviteCode ? await findSponsorByInviteCode(inviteCode) : null;

    // Generate invite code and username in parallel (if needed)
    const needsInviteCode = !hasInviteCode;
    const needsUsername = !hasUsername;
    
    const [newInviteCode, newUsername] = await Promise.all([
      needsInviteCode ? generateInviteCode() : Promise.resolve(user.inviteCode),
      needsUsername ? generateCryptoUsername() : Promise.resolve(user.username),
    ]);

    // Use transaction only for writes to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update user with invite code and username if needed
      const updateData: { inviteCode?: string; username?: string } = {};
      
      if (needsInviteCode && newInviteCode) {
        updateData.inviteCode = newInviteCode;
      }
      
      if (needsUsername && newUsername) {
        updateData.username = newUsername;
      }
      
      if (Object.keys(updateData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: updateData,
        });
      }

      // 2. Create user balance if not exists (upsert is faster)
      await tx.userBalance.upsert({
        where: { userId },
        create: {
          userId,
          balance: 0,
          onStaking: 0,
          maxEarn: 0,
          dailyEarning: 0,
          teamEarning: 0,
          earningWithdraw: 0,
          latestEarning: 0,
          teamEarningWithdraw: 0,
          missedEarnings: 0,
        },
        update: {}, // Don't update if exists
      });

      // 3. Process invite code if provided (optional - no error if invalid)
      let invitedMember = null;
      if (inviteCode && sponsor) {
        // Check if already exists
        const existingInvite = await tx.invitedMember.findFirst({
          where: { userId },
        });

        if (!existingInvite) {
          // Prevent self-invitation
          if (sponsor.id === userId) {
            // Don't throw error, just skip creating invite record
            console.warn("User attempted to use their own invite code, skipping...");
          } else {
            // Extract first and last name
            const nameParts = userName.trim().split(/\s+/);
            const firstName = nameParts[0] || userName;
            const lastName = nameParts.slice(1).join(" ") || "";

            invitedMember = await tx.invitedMember.create({
              data: {
                sponsorId: sponsor.id,
                userId,
                firstName,
                lastName,
                email: userEmail,
              },
            });
          }
        } else {
          invitedMember = existingInvite;
        }
      }
      // If invite code is provided but no sponsor found, just skip silently
      // (invite code is optional, so we don't throw an error)

      return {
        inviteCode: newInviteCode || user.inviteCode || null,
        username: newUsername || user.username || null,
        invitedMember,
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Post-registration error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    });
    return {
      success: false,
      error: error.message || "Failed to complete registration setup",
    };
  }
}

/**
 * Get user ID by email (helper function for registration flow)
 */
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, username: true, inviteCode: true },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

/**
 * Validate invite code (server action for client-side validation)
 */
export async function validateInviteCode(inviteCode: string) {
  try {
    const sponsor = await findSponsorByInviteCode(inviteCode);
    return {
      valid: !!sponsor,
      message: sponsor ? "Valid invite code" : "Invalid invite code",
    };
  } catch (error) {
    return {
      valid: false,
      message: "Error validating invite code",
    };
  }
}

