import type { Browser } from "puppeteer-core";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

export async function generatePayoutImage(data: {
  name: string;
  amount: number;
  currency: string;
  withdrawalId: string;
  profileImage: string;
}) {
  const PKR_RATE = 294;
  const pkr = data.amount * PKR_RATE;

  const templatePath = path.join(
    process.cwd(),
    "src/lib/notifications/payout-template.html"
  );

  const logoPath = path.join(process.cwd(), "public/logodark.svg");
  const logoSvg = fs.readFileSync(logoPath, "utf8");
  const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;

  let html = fs.readFileSync(templatePath, "utf8");

  html = html
    .replace("{{NAME}}", data.name)
    .replace("{{AMOUNT}}", data.amount.toString())
    .replace("{{CURRENCY}}", data.currency)
    .replace("{{PKR}}", pkr.toFixed(0))
    .replace("{{WITHDRAWAL_ID}}", data.withdrawalId)
    .replace("{{PROFILE_IMAGE}}", data.profileImage)
    .replace("{{LOGO_URL}}", logoDataUri);

  // Use @sparticuz/chromium on Vercel/serverless (no Chrome in runtime).
  // Locally, use it too so we don't depend on system Chrome when using puppeteer-core.
  const chromium = (await import("@sparticuz/chromium")).default;
  const browser: Browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 600, height: 1067 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    const filePath = `/tmp/payout-${data.withdrawalId}-${Date.now()}.png`;

    await page.screenshot({
      path: filePath,
      type: "png",
      fullPage: true,
    });

    return filePath;
  } finally {
    await browser.close();
  }
}
