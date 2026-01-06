import { UserFormData, ReportData, CONSTANTS } from '../types';

export const generateReport = async (userData: UserFormData): Promise<ReportData> => {
  // Determine Grade Context for the Prompt with specific instructions
  const grade = userData.grade || "大三"; // Default fallback
  let gradeInstruction = "";

  if (grade.includes("大一")) {
    gradeInstruction = `
    **当前学生为大一新生（奠基期）**：
    - **核心战略**：信息差打破与高绩点养成。
    - **Timeline重点**：识别培养方案中的高学分课程，大一寒暑假提前了解“夏令营”概念，避免盲目参加水社团。
    `;
  } else if (grade.includes("大二")) {
    gradeInstruction = `
    **当前学生为大二学生（分水岭期）**：
    - **核心战略**：科研/竞赛背景的实质性填充。
    - **Timeline重点**：必须规划并在大二结束前完成至少一项校级以上科研或“大创”项目，六级必须刷分。
    `;
  } else {
    gradeInstruction = `
    **当前学生为大三/大四学生（冲刺/收割期）**：
    - **核心战略**：精准投递与面试攻坚。
    - **Timeline重点**：梳理文书材料（PS/CV），针对目标院校的夏令营/预推免时间表进行精准狙击。
    `;
  }

  const prompt = `
你是一位“高顿去保研”的资深规划师。请基于以下学生信息，生成一份**真实、分年级定制、逻辑严密**的保研规划报告。

**学生信息**：
- 院校：${userData.university}
- 专业：${userData.major}
- 年级：${userData.grade}
- 绩点：${userData.gpaRanking}
- 英语：${userData.englishScore}
- 竞赛：${userData.competitions || "暂无"}
- 科研：${userData.research || "暂无"}
- 重点咨询：${userData.targetFocus}

**核心指令（严格执行）：**

1.  **真实性与具体性**：
    *   **目标院校必须带专业**：推荐“冲刺/稳妥/保底”院校时，**严禁**只写校名。必须格式化为 **“校名（专业/方向）”**，例如“复旦大学（软件工程）”或“厦门大学（统计学）”。确保专业与学生当前专业（${userData.major}）有逻辑关联（本专业或常见的跨保方向）。
    *   **本校政策解析**：简要分析${userData.university}或同档次院校的推免名额分配逻辑（绩点占比vs综测占比）。
    *   **前期具体情况分析**：在 \`summary\` 字段中，先一针见血地分析学生目前的短板（如：双非背景、英语弱项、科研空白等），再给出整体定位。

2.  **${gradeInstruction}**

3.  **时间轴排版要求（非常重要）**：
    *   在 \`timeline\` 的 \`content\` 字段中，**严禁**使用大段文字。
    *   **必须**严格按照以下四个维度分行罗列建议（请使用 Markdown 加粗标签）：
        1. **成绩**：[具体的绩点目标或选课建议]
        2. **英语**：[具体的考级或分数目标]
        3. **科研**：[具体的论文或大创建议]
        4. **竞赛**：[具体的赛事推荐]

4.  **案例匹配（Similar Cases）**：
    *   匹配 3 个**最接近该学生背景**（同层次院校、同专业）的成功保研案例。
    *   **去向必须真实**：双非一本主要去向为末流985/211；211主要去向为中上游985；985主要去向为C9/清北复交。

**返回格式（严格JSON）：**
{
  "summary": "针对学生的深度诊断（100字左右）：先指出硬伤（如六级没过/无科研），再给出整体定位（如：主攻中游985）。",
  "metrics": {
    "gpaScore": 85, 
    "researchScore": 60,
    "englishScore": 75,
    "competitionScore": 70,
    "admissionRate": 15
  },
  "gradeGuidance": "一句话概括该年级的核心战略（如：大二关键期，科研是弯道超车的唯一机会）。",
  "timeline": [
    { "period": "阶段一（具体月份）", "title": "核心任务", "content": "**成绩**：保持专业前10%...\n**英语**：六级突破550分...\n**科研**：联系导师进组...\n**竞赛**：参加数学建模...", "tag": "阶段标签" },
    { "period": "阶段二", "title": "核心任务", "content": "**成绩**：...", "tag": "阶段标签" }
  ],
  "admissionTrend": [
    { "label": "2022届", "value": 14.5 },
    { "label": "2023届", "value": 15.2 },
    { "label": "2024届", "value": 15.8 }
  ],
  "graduateDestinations": [
    { "label": "本校深造", "value": 45 },
    { "label": "外校推免", "value": 45 },
    { "label": "出国/就业", "value": 10 }
  ],
  "destinationSchools": ["同济大学(土木)", "东南大学(交通)", "本校(硕博连读)"],
  "similarCases": [
    {
       "admissionSchool": "目标院校（如：复旦大学）",
       "admissionMajor": "录取专业",
       "year": "2023年录取",
       "originBackground": "生源背景简述（如：211工程 | 3.92 (1/150)）",
       "highlights": "核心亮点（如：挑战杯金奖，英语流利）"
    }
  ],
  "policyAnalysis": "政策解析（侧重保研资格获取方式、绩点计算规则等）...",
  "bonusPolicy": [
    { "category": "学科竞赛", "item": "挑战杯/互联网+ 国家级金奖", "score": "加 0.5-2.0 分" }
  ],
  "competitionsRecommended": [
    { "title": "推荐竞赛名称", "level": "级别", "description": "为何推荐..." }
  ],
  "researchRecommended": [
    { "title": "推荐科研方向", "level": "级别", "description": "如何切入..." }
  ],
  "recommendations": [
    { "type": "冲刺", "schools": ["院校A(专业)", "院校B(专业)"], "successRate": 30, "note": "冲击策略..." },
    { "type": "稳妥", "schools": ["院校C(专业)"], "successRate": 70, "note": "稳扎稳打..." }
  ],
  "career": {
    "direction": "方向",
    "salaryRange": "薪资"
  },
  "pengpaiPlanRecommended": true
}
`;

  try {
    const response = await fetch(CONSTANTS.DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONSTANTS.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个极其严谨的保研规划专家。在推荐院校时，你总是会明确指出具体的专业方向。在制定时间轴规划时，你必须严格按照【成绩、英语、科研、竞赛】四个维度进行分行罗列。" },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    let contentString = data.choices[0].message.content;

    // Robust JSON cleaning logic
    // 1. Remove Markdown code blocks
    contentString = contentString.replace(/```json/g, '').replace(/```/g, '');
    
    // 2. Remove potential "Thinking" blocks (<think>...</think>) from DeepSeek R1
    contentString = contentString.replace(/<think>[\s\S]*?<\/think>/g, '');

    // 3. Extract purely the JSON object (Find first '{' and last '}')
    const firstBrace = contentString.indexOf('{');
    const lastBrace = contentString.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      contentString = contentString.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(contentString);
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    // Return mock data for fail-safety
    return {
      summary: "系统连接繁忙，正在为您切换备用线路...",
      metrics: { gpaScore: 80, researchScore: 60, englishScore: 70, competitionScore: 60, admissionRate: 15 },
      gradeGuidance: "建议直接联系高顿顾问获取人工分析。",
      timeline: [],
      admissionTrend: [],
      graduateDestinations: [],
      destinationSchools: [],
      similarCases: [],
      policyAnalysis: "暂无数据",
      bonusPolicy: [],
      competitionsRecommended: [],
      researchRecommended: [],
      recommendations: [],
      career: { direction: "-", salaryRange: "-" },
      pengpaiPlanRecommended: true
    };
  }
};