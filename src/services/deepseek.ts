import { AIResponse, UserInfo, SchoolData } from "../types";

const API_KEY = "sk-f2335a96cee0449386e3822542892783";
const API_URL = "https://api.deepseek.com/chat/completions";

export const generateAIReport = async (userInfo: UserInfo, schoolData: SchoolData): Promise<AIResponse> => {
  
  const hasRate = schoolData.rate !== null;
  const isFreshman = userInfo.grade === '大一';

  // Customize prompt based on grade
  let timelineContext = "";
  if (isFreshman) {
    timelineContext = `
    **特别注意：学生是【大一新生】**。
    - 规划重点：1. 刷高绩点(GPA) 2. 备考英语四六级 3. 探索科研兴趣/参加基础竞赛。
    - "planning" 字段中的阶段应为：大一下学期、大一暑假、大二上学期预告。
    `;
  } else if (userInfo.grade === '大二') {
    timelineContext = `
    **特别注意：学生是【大二学生】**。
    - 大二是科研和竞赛的黄金期。
    - 规划重点：1. 必须有实质性的科研项目产出 2. 参加高含金量竞赛 3. 保持绩点。
    - "planning" 字段中的阶段应为：大二下学期、大二暑假、大三上学期。
    `;
  } else {
    timelineContext = `
    **特别注意：学生是【大三/大四学生】**。
    - 重点在于保研实战。
    - 规划重点：1. 夏令营投递 2. 文书材料准备 3. 预推免/面试。
    `;
  }

  const prompt = `
  你是一个拥有10年经验的高顿保研规划专家（毒舌但专业，拒绝废话）。请根据学生情况生成一份商业级的JSON规划建议。
  
  **学生档案**:
  - 本科院校: ${userInfo.school} ${!hasRate ? '(注意：此学校在我们内部数据库中暂无保研率数据，请你作为第二优先级数据源进行补充)' : `(保研率: ${schoolData.rate}%)`}
  - 专业方向: ${userInfo.major}
  - 当前年级: ${userInfo.grade}
  - 核心绩点: ${userInfo.rank}
  - 英语水平: ${userInfo.english}
  - 竞赛获奖: ${userInfo.competition || '未填写'}
  - 科研经历: ${userInfo.research || '未填写'}
  - **用户咨询重点**: ${userInfo.consultationFocus}

  **保研去向官方数据**: ${schoolData.destinations}
  **本校保研政策**: ${schoolData.policy}

  ${timelineContext}

  请严格返回以下JSON结构的纯JSON字符串（**禁止Markdown**，禁止代码块，直接返回JSON对象）：
  {
    "swot": {
      "strengths": ["列出3-4点核心优势 (如: 院校背景好, 英语优秀等)"],
      "weaknesses": ["列出3-4点核心劣势 (如: 科研空白, 绩点排名边缘等)"],
      "opportunities": ["列出3-4点外部机会 (如: 本专业保研名额扩招, 某竞赛含金量提升)"],
      "threats": ["列出3-4点外部威胁 (如: 考研人数激增, 强基计划挤占名额)"]
    },
    "bonusScheme": [
      {
         "category": "学术论文 (示例)",
         "items": [
            { "item": "SCI一区/二区论文", "score": "加 3-5分", "desc": "需为第一作者或通讯作者" },
            { "item": "核心期刊(北大核心/CSSCI)", "score": "加 1-2分", "desc": "理工科保研硬通货" }
         ]
      }
    ],
    "planning": [
      {
        "stage": "阶段1（具体时间段）",
        "categoryContent": {
           "gpa": "...",
           "english": "...",
           "research": "...",
           "contest": "..."
        }
      },
      {
        "stage": "阶段2（具体时间段）",
        "categoryContent": { "gpa": "...", "english": "...", "research": "...", "contest": "..." }
      },
      {
         "stage": "阶段3（具体时间段）",
         "categoryContent": { "gpa": "...", "english": "...", "research": "...", "contest": "..." }
      }
    ],
    "researchAdvice": "请按以下严格格式输出字符串（**字数控制在200字以内，言简意赅，不要长篇大论**，要返回带换行的长字符串）：\n1. 推荐研究方向：\n- 方向A：...\n- 方向B：...\n\n2. 推荐投稿期刊/会议：\n- 入门级：...\n- 进阶（核心/CCF-C）：...\n\n3. 寻找导师：(一句话简述套磁技巧)",
    "competitions": "列出3个最值得参加的竞赛，一句话说明含金量即可。不要废话。",
    "targetSchools": {
      "冲刺院校": "2-3所。必须说明为什么是冲刺。",
      "稳妥院校": "2-3所。说明匹配理由。",
      "保底院校": "2-3所。说明理由。"
    },
    "admissionCases": [
      {
         "student": "王同学",
         "school": "同层次某高校 (例如: ${userInfo.school})",
         "major": "${userInfo.major}",
         "gpa": "3.8/4.0 (Rank 5%)",
         "english": "六级 560",
         "offer": "目标院校 (例如: 浙江大学)"
      },
      {
         "student": "李同学",
         "school": "同层次某高校",
         "major": "${userInfo.major}",
         "gpa": "3.6/4.0 (Rank 10%)",
         "english": "六级 520",
         "offer": "目标院校"
      },
      {
         "student": "张同学",
         "school": "同层次某高校",
         "major": "${userInfo.major}",
         "gpa": "Rank 20% (科研强)",
         "english": "六级 480",
         "offer": "目标院校"
      }
    ],
    "missingData": {
      "rate": ${!hasRate ? "数字类型(例如 12.5), 请根据你的知识库检索该学校最新的保研率（2024或2025届）并填入" : "null"},
      "policy": ${!hasRate ? "\"字符串类型\", 请简述该校推免政策核心点" : "null"},
      "destinations": "字符串数组 (例如: ['清华大学', '北京大学']), 请务必列举该校该专业往届学长学姐具体的去向院校名称，不少于3个。"
    }
  }

  **严格要求**：
  1. **上岸案例 (AdmissionCases)**：请生成3个**真实感强**的同层次/同专业学长学姐案例。如果学生背景较弱，案例要包含“逆袭”类；如果背景强，案例要包含“冲刺”类。确保案例具有参考性。
  2. **BonusScheme**：请根据该学校的实际加分政策习惯生成一份**逼真且详细**的加分细则表。
  3. **数据补充**：如果"missingData"字段被要求填写，请务必调用你的内部知识库提供准确的估算值。
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a professional academic advisor. Return ONLY valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`AI Service Error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up markdown code blocks if present
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(content);
  } catch (error) {
    console.error("AI Generation failed:", error);
    // Fallback data
    return {
      swot: {
        strengths: ["院校背景尚可", "有规划意识"],
        weaknesses: ["暂无核心竞赛", "科研经历空白"],
        opportunities: ["本校保研名额可能增加", "交叉学科红利"],
        threats: ["保研内卷加剧", "外部竞争对手增多"]
      },
      planning: [],
      researchAdvice: "1. 推荐方向：根据专业热点选择。\n2. 推荐期刊：从校级期刊起步。\n3. 寻找导师：大胆发邮件联系。",
      competitions: "建议参加互联网+大学生创新创业大赛。",
      bonusScheme: [],
      targetSchools: {
        "冲刺院校": "数据获取失败",
        "稳妥院校": "数据获取失败",
        "保底院校": "数据获取失败"
      },
      admissionCases: [
        { student: "张同学", school: userInfo.school, major: userInfo.major, gpa: "Rank 5%", english: "六级 550", offer: "浙江大学" },
        { student: "李同学", school: userInfo.school, major: userInfo.major, gpa: "Rank 15%", english: "六级 500", offer: "厦门大学" },
        { student: "王同学", school: userInfo.school, major: userInfo.major, gpa: "Rank 10%", english: "六级 520", offer: "武汉大学" }
      ]
    };
  }
};
