const TELEGRAM_BOT_TOKEN = '8851638627:AAEj2dvBhwgnzYDQBrBOhM6WZIKSB5CAsj4';
const TELEGRAM_CHAT_ID = '8547154870';

export const sendTelegramNotification = async (senderName: string, content: string, roomId: string, suicideRisk: boolean) => {
  try {
    const emoji = suicideRisk ? '🚨🚨🚨' : '📩';
    const baseUrl = process.env.CLIENT_URL || 'https://save-a-life-q2p8.onrender.com';
    
    const message = [
      `${emoji} *New message from ${senderName}*`,
      '',
      `💬 ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`,
      '',
      `🔗 [Reply now](${baseUrl}/support/${roomId})`,
      suicideRisk ? '\n⚠️ *SUICIDE RISK DETECTED - Respond immediately!*' : ''
    ].join('\n');

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    console.log('Telegram notification sent');
  } catch (error) {
    console.error('Telegram notification failed:', error);
  }
};

export const sendNewVisitorNotification = async (displayName: string, roomId: string) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'https://save-a-life-q2p8.onrender.com';
    
    const message = [
      `🟢 *New visitor joined!*`,
      '',
      `👤 ${displayName} is waiting for support`,
      '',
      `🔗 [Open dashboard](${baseUrl}/support/${roomId})`
    ].join('\n');

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    console.log('Telegram visitor notification sent');
  } catch (error) {
    console.error('Telegram notification failed:', error);
  }
};
