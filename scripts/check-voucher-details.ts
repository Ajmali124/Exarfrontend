/**
 * Check detailed voucher information including packageId
 */

import prisma from "../src/lib/prismadb";

const USER_ID = "IzZ3SLa2aRTQKBnddT1zTHQn1JxuRzxZ";

async function checkVoucherDetails() {
  const vouchers = await prisma.voucher.findMany({
    where: {
      userId: USER_ID,
      type: "package",
      status: "active",
    },
    select: {
      id: true,
      code: true,
      title: true,
      value: true,
      packageId: true,
      packageName: true,
      roiValidityDays: true,
      affectsMaxCap: true,
      status: true,
    },
  });

  console.log("🎫 Package Voucher Details:\n");
  console.log("=" .repeat(80));
  
  vouchers.forEach((v, i) => {
    console.log(`\n${i + 1}. ${v.code} - ${v.title}`);
    console.log(`   Value: $${v.value}`);
    console.log(`   Package ID: ${v.packageId ?? "NOT SET"}`);
    console.log(`   Package Name: ${v.packageName ?? "NOT SET"}`);
    console.log(`   ROI Validity: ${v.roiValidityDays} days`);
    console.log(`   Max Cap: ${v.affectsMaxCap ? "Yes" : "No"}`);
  });
}

checkVoucherDetails()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

