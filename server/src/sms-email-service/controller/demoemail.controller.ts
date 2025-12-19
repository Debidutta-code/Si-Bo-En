// import { Request, Response } from "express";
// import EmailService from "../service/email.service";
// import DemoRequest from "../model/DemoRequest";

// export const sendDemoEmail = async (req: Request, res: Response): Promise<Response> => {
//   try {
//     const { name, email, phone } = req.body;

//     if (!name || !email || !phone) {
//       return res.status(400).json({ error: "All fields are required." });
//     }

//     // Save request to DB
//     await DemoRequest.create({ name, email, phone });

//     // Email to the user
//     const userSubject = "Thanks for Requesting a Demo";
//     const userHtml = `
//       <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background-color: #f4f6f8; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
//         <div style="background-color: #4f46e5; color: white; text-align: center; padding: 16px; border-radius: 8px 8px 0 0;">
//           <h2 style="margin: 0; font-size: 20px;">Thank You for Requesting a Demo</h2>
//         </div>

//         <div style="padding: 24px; background-color: white; border-radius: 0 0 8px 8px;">
//           <p style="font-size: 16px; margin-bottom: 16px;">
//             Hi <strong>${name}</strong>,<br />
//             Thank you for your interest in SwiftRooms. Our team will connect with you soon.
//           </p>

//           <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
//             — SwiftRooms Team
//           </p>
//         </div>
//       </div>
//     `;

//     // Email to internal team (admin)
//     const adminEmail = process.env.SENDER_EMAIL; // or hardcode like: "admin@swiftrooms.com"
//     const adminSubject = `New Demo Request from ${name}`;
//     const adminHtml = `
//   <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; padding: 30px;">
//     <table style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); padding: 24px; border-collapse: separate;">
//       <tr>
//         <td style="text-align: center; background-color: #1e3a8a; color: white; padding: 20px 0; border-radius: 10px 10px 0 0;">
//           <h2 style="margin: 0; font-size: 22px;">🚨 New Demo Request</h2>
//         </td>
//       </tr>
//       <tr>
//         <td style="padding: 24px; font-size: 16px; color: #111827;">
//           <p><strong>👤 Name:</strong> ${name}</p>
//           <p><strong>📧 Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
//           <p><strong>📞 Phone:</strong> ${phone}</p>
//           <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
//           <p style="color: #6b7280; font-size: 14px;">📩 This user submitted a demo request on SwiftRooms. Kindly follow up at your earliest convenience.</p>
//         </td>
//       </tr>
//       <tr>
//         <td style="text-align: center; padding-top: 10px;">
//           <p style="font-size: 12px; color: #9ca3af;">SwiftRooms Admin Notification</p>
//         </td>
//       </tr>
//     </table>
//   </div>
// `;

//     // Send to user
//     await EmailService.sendEmail({ to: email, subject: userSubject, html: userHtml });

//     // Send to admin
//     await EmailService.sendEmail({ to: adminEmail!, subject: adminSubject, html: adminHtml });

//     return res.status(200).json({ message: "Demo request submitted successfully!" });

//   } catch (error: any) {
//     console.error("❌ Error sending demo email:", error.message);
//     return res.status(500).json({ error: "Failed to send demo email." });
//   }
// };
