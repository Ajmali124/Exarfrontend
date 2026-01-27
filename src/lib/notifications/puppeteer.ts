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
  const logoPath = path.join(process.cwd(), "public/logodark.svg");
  const logoSvg = fs.readFileSync(logoPath, "utf8");
  const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;

  // On Vercel, Chromium needs system libs (libnss3 etc.) that aren't available.
  // Use @vercel/og instead — no browser, works in serverless.
  if (process.env.VERCEL === "1") {
    const { generatePayoutImageBuffer } = await import("./payout-og");
    const buffer = await generatePayoutImageBuffer({
      ...data,
      logoUrl: logoDataUri,
    });
    const filePath = `/tmp/payout-${data.withdrawalId}-${Date.now()}.png`;
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  // Local: use Playwright
  const templatePath = path.join(
    process.cwd(),
    "src/lib/notifications/payout-template.html"
  );
  let html = fs.readFileSync(templatePath, "utf8");
  const PKR_RATE = 294;
  const pkr = data.amount * PKR_RATE;

  html = html
    .replace("{{NAME}}", data.name)
    .replace("{{AMOUNT}}", data.amount.toString())
    .replace("{{CURRENCY}}", data.currency)
    .replace("{{PKR}}", pkr.toFixed(0))
    .replace("{{WITHDRAWAL_ID}}", data.withdrawalId)
    .replace("{{PROFILE_IMAGE}}", data.profileImage)
    .replace("{{LOGO_URL}}", logoDataUri);

  const browser = await playwrightChromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

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
