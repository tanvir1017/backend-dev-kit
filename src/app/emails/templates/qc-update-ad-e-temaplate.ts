import { currYear } from "../utils/curr-year";

export const qcUpdateAddEmailTemplate = ({
  qcId,
  typeOfGoods,
  weight,
  volume,
  qcPhotosOrVideos,
  homepageLink,
  supportLink,
  qcReportLink,
}: {
  qcId: string;
  typeOfGoods: string;
  weight: string;
  volume: string;
  qcPhotosOrVideos: string;
  homepageLink: string;
  supportLink: string;
  qcReportLink: string;
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Your QC Report Is Ready, Busy Bee!</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color:#fefbf5;">

<!-- Outer Wrapper Table -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fefbf5">
  <tr>
    <td align="center" style="padding:20px 0;">
      
      <!-- Main Email Container -->
      <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="margin:0 auto; max-width:600px;">
        
        <!-- Header -->
        <tr>
          <td align="center" bgcolor="#2a5c6e" style="padding:30px 20px;">
            <span style="font-size:28px; font-weight:bold; color:#F4B35B;">🐝 Little Bee PM Hive</span><br>
            <span style="font-size:14px; color:#ffffff; opacity:0.9;">Your Trusted Honey-Pure Quality Inspectors</span>
          </td>
        </tr>
        
        <!-- Title -->
        <tr>
          <td align="center" style="padding:30px 20px 20px 20px;">
            <h1 style="margin:0; font-size:24px; color:#2a5c6e; font-weight:bold; line-height:1.4;">
              Your QC Report Is Ready, Busy Bee! 🎉
            </h1>
          </td>
        </tr>
        
        <!-- Body Text -->
        <tr>
          <td style="padding:0 20px 20px 20px; color:#333333; font-size:16px; line-height:1.6;">
            <p style="margin:0 0 15px 0;">
              Good news! Our Queen Bee Inspectors have finished buzzing around your order and prepared a shiny QC report just for you.
            </p>
            <p style="margin:0 0 20px 0;">
              We checked every petal, pixel, and seam — ensuring your treasures meet honey-pure standards.
            </p>
          </td>
        </tr>
        
        <!-- QC Details Box -->
        <tr>
          <td style="padding:0 20px 25px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fefbf5" style="border:2px solid #F4B35B;">
              <tr>
                <td style="padding:15px;">
                  <span style="font-size:18px; font-weight:bold; color:#2a5c6e; display:block; margin-bottom:10px;">📋 Your QC Details</span>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding:5px 0; font-size:15px; font-weight:bold; color:#2a5c6e; width:40%;">QC ID:</td>
                      <td style="padding:5px 0; font-size:15px; color:#000000;">${qcId}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0; font-size:15px; font-weight:bold; color:#2a5c6e;">Type of Goods:</td>
                      <td style="padding:5px 0; font-size:15px; color:#000000;">${typeOfGoods}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0; font-size:15px; font-weight:bold; color:#2a5c6e;">Weight:</td>
                      <td style="padding:5px 0; font-size:15px; color:#000000;">${weight} kg</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0; font-size:15px; font-weight:bold; color:#2a5c6e;">Volume:</td>
                      <td style="padding:5px 0; font-size:15px; color:#000000;">${volume} m³</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0; font-size:15px; font-weight:bold; color:#2a5c6e;">QC Photos:</td>
                      <td style="padding:5px 0; font-size:15px; color:#000000;">${qcPhotosOrVideos ?? "HD photos/videos available in your dashboard"}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Motivational Text -->
        <tr>
          <td align="center" style="padding:0 20px 25px 20px; font-size:16px; line-height:1.6; color:#2a5c6e; font-weight:500;">
            Bee Calm 🐝 — everything's stored safe in our hive!
          </td>
        </tr>
        
        <!-- CTA Button -->
        <tr>
          <td align="center" style="padding:0 20px 25px 20px;">
            <a href="${qcReportLink}" style="display:inline-block; padding:15px 40px; background-color:#F4B35B; color:#ffffff; text-decoration:none; font-size:16px; font-weight:bold;">
              View My QC Report 🍯
            </a>
          </td>
        </tr>
        
        <!-- Divider -->
        <tr>
          <td style="padding:0 20px;">
            <hr style="border:none; border-top:2px solid #F4B35B; margin:20px 0;">
          </td>
        </tr>
        
        <!-- Help Section -->
        <tr>
          <td align="center" style="padding:20px 20px 30px 20px; font-size:15px; color:#555555; line-height:1.5;">
            <p style="margin:0 0 10px 0; font-weight:bold; color:#2a5c6e;">Need Help? 🤝</p>
            <p style="margin:0 0 15px 0;">Buzz over to our Support Center — our helper bees are ready to assist.</p>
            <a href="${supportLink}" style="color:#F4B35B; text-decoration:none; margin-right:10px; font-weight:bold;">Support Center</a> | 
            <a href="${homepageLink}" style="color:#F4B35B; text-decoration:none; margin-left:10px; font-weight:bold;">Homepage</a>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td align="center" bgcolor="#2a5c6e" style="padding:20px 20px; font-size:12px; color:#fff; line-height:1.5;">
            © 2025-${currYear()} Little Bee PM Hive. All rights reserved.<br>
            You're receiving this because you have an active order with us. 🐝
          </td>
        </tr>
        
      </table>
      
    </td>
  </tr>
</table>
</body>
</html>
`;
};
