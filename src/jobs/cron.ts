import cron from 'node-cron';
import { runExpiryEngine } from './expiryEngine';

/**
 * Initializes background jobs
 * Expiry Engine runs daily at 2 AM
 */
export function initializeJobs() {
    console.log("⚙️  Initializing background jobs...");

    // Run expiry engine daily at 2 AM (02:00)
    // Cron format: minute hour day month day-of-week
    const expiryJob = cron.schedule('0 2 * * *', async () => {
        console.log("📅 Scheduled expiry engine running...");
        try {
            await runExpiryEngine();
        } catch (error) {
            console.error("❌ Scheduled expiry engine failed:", error);
        }
    });

    console.log("✅ Expiry Engine scheduled to run daily at 2:00 AM");

    return { expiryJob };
}

/**
 * Optional: Run expiry engine immediately for testing/manual trigger
 */
export async function triggerExpiryEngineNow() {
    console.log("🔄 Manual trigger: Running expiry engine immediately...");
    try {
        return await runExpiryEngine();
    } catch (error) {
        console.error("❌ Manual expiry engine trigger failed:", error);
        throw error;
    }
}
