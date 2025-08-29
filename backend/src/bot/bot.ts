import { Bot } from "grammy";
import { getGuide, getStatusSummary, getTodayPower, getReviewSummary } from "../libs/helper/bot-logic.ts"

export const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN as string);

await bot.api.setMyCommands([
  { command: "status", description: "📟 Show current device status" },
  { command: "power_today", description: "⚡ Show today's energy consumption" },
  { command: "review", description: "📊 Show last 7 days usage" },
  { command: "help", description: "📖 List all available commands" },
])

bot.command("start", (ctx) => ctx.reply("hi there"));

bot.command("help", async (ctx) => {
  const msg = await getGuide()
  ctx.reply(msg)
});


bot.command("status", async (ctx) => {
  const msg = await getStatusSummary()
  ctx.reply(msg)
})

bot.command("power_today", async (ctx) => {
  try {
    const msg = await getTodayPower()
    ctx.reply(msg)
  } catch {
    ctx.reply("⚠️ Failed to get today's data.")
  }
})

bot.command("review", async (ctx) => {
  try {
    const msg = await getReviewSummary()
    ctx.reply(msg)
  } catch {
    ctx.reply("⚠️ Failed to generate review.")
  }
})
