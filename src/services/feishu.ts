import { UserInfo } from "../types";

const FEISHU_WEBHOOK_URL = "https://open.feishu.cn/open-apis/bot/v2/hook/25faa1d2-76d3-4f88-8277-a5a625b6f789";

export const sendToFeishu = async (data: UserInfo) => {
  const content = `
📋 **高顿去保研-新用户提交**
---------------------------
👤 姓名: ${data.name}
📱 联系方式: ${data.phone}
🏫 学校: ${data.school}
🎓 专业: ${data.major}
📊 年级: ${data.grade}
📈 排名: ${data.rank}
🔤 英语: ${data.english}
🏆 竞赛: ${data.competition}
🔬 科研: ${data.research}
❓ 咨询重点: ${data.consultationFocus}
---------------------------
⏰ 时间: ${new Date().toLocaleString()}
  `;

  const payload = {
    msg_type: "text",
    content: {
      text: content.trim()
    }
  };

  try {
    // Note: 'no-cors' mode is required for client-side only requests to Feishu to avoid blocking.
    // The request WILL be sent, but we cannot read the response status in the browser code.
    // This is expected behavior for simple static sites without a backend proxy.
    await fetch(FEISHU_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    console.log("Feishu notification dispatched.");
    return true;
  } catch (error) {
    console.error("Failed to send Feishu notification:", error);
    // Even if it fails (network error), we usually let the user proceed in this demo context
    return false;
  }
};
