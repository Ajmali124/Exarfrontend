import { chromium as playwrightChromium } from "playwright-core";
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

  // @sparticuz/chromium is built for Linux (Vercel/Lambda). On macOS it fails with "spawn Unknown system error -8".
  // Use it only when we're actually on Linux (Vercel); locally use Playwright's Chromium.
  const isVercelLinux = process.env.VERCEL === "1" && process.platform === "linux";

  let browser;
  if (isVercelLinux) {
    const chromium = (await import("@sparticuz/chromium")).default;
    browser = await playwrightChromium.launch({
      executablePath: await chromium.executablePath(),
      args: chromium.args,
      headless: true,
    });
  } else {
    // Local (macOS/Windows) or any non-Linux: use Playwright's bundled Chromium
    browser = await playwrightChromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 600, height: 1067 });
    await page.setContent(html, { waitUntil: "networkidle" });

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
