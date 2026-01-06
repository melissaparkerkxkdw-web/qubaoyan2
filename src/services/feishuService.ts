import { UserFormData, CONSTANTS } from '../types';

export const sendToFeishu = async (data: UserFormData): Promise<void> => {
  const message = `
🔔 **新用户保研咨询提交**
------------------------
👤 姓名: ${data.name}
📱 联系方式: ${data.contact}
🏫 院校: ${data.university}
📚 专业: ${data.major}
🎓 年级: ${data.grade}
📊 绩点/排名: ${data.gpaRanking}
🔤 英语水平: ${data.englishScore}
🏆 竞赛情况: ${data.competitions || '无'}
📝 科研/论文: ${data.research || '无'}
🎯 咨询重点: ${data.targetFocus}
------------------------
请顾问老师尽快联系跟进报告解读。
  `.trim();

  const payload = {
    msg_type: "text",
    content: {
      text: message
    }
  };

  try {
    await fetch(CONSTANTS.FEISHU_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors' 
    });
  } catch (error) {
    console.warn("Feishu submission triggered (check network tab).", error);
  }
};