import puppeteer from "puppeteer";
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
  // Convert SVG to data URI
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

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Use 9:16 aspect ratio for WhatsApp status (portrait/vertical)
  await page.setViewport({ width: 600, height: 1067 });
  await page.setContent(html, { waitUntil: "networkidle0" });
  
  const filePath = `/tmp/payout-${data.withdrawalId}-${Date.now()}.png`;

  // Use fullPage to capture entire content without cropping
  await page.screenshot({ 
    path: filePath,
    type: "png",
    fullPage: true,
  });
  await browser.close();

  return filePath;
}
