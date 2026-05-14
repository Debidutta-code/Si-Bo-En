import { prisma } from '../config/db.config';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function checkPayment() {
    // console.log("\n--- Payment Details Lookup ---");

    rl.question('Enter Payment ID or Order Reference: ', async input => {
        const id = input.trim();

        if (!id) {
            // console.log("❌ Error: Please provide an ID or reference.");
            rl.close();
            return;
        }

        try {
            // console.log(`🔍 Searching for: ${id}...`);

            const payment = await prisma.payment.findFirst({
                where: {
                    OR: [{ id: id }, { paymentIntentId: id }],
                },
                include: {
                    Property: {
                        select: {
                            propertyName: true,
                            propertyCode: true,
                        },
                    },
                    Reservation: {
                        select: {
                            bookingCode: true,
                            bookingStatus: true,
                        },
                    },
                },
            });

            if (payment) {
                // console.log("\n✅ Payment Found:");
                // console.log("-----------------------------------------");
                // console.log(JSON.stringify(payment, null, 2));
                // console.log("-----------------------------------------");
            } else {
                // console.log("\n❌ No payment record found for the given ID or Reference.");
            }
        } catch (error) {
            console.error('\n❌ Database error:', error);
        } finally {
            await prisma.$disconnect();
            rl.close();
        }
    });
}

checkPayment();
