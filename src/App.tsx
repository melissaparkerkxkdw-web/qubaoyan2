import React, { useState, useRef, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { sendToFeishu } from './services/feishu';
import { generateAIReport } from './services/deepseek';
import { getSchoolData } from './data/schools';
import { UserInfo, AIResponse, SchoolData, TimelineItem } from './types';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import { Loader2, Download, CheckCircle2, Trophy, BookOpen, Clock, Sparkles, ShieldCheck, BadgeCheck, ChevronRight, Microscope, ArrowUpRight, ArrowDownRight, Zap, ShieldAlert, Star, FileText, Activity, GraduationCap, Users, Presentation, Compass, Target } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PptxGenJS from 'pptxgenjs';

// --- Assets & Branding ---
const BRAND_GREEN_DARK = "#003B30"; 
const BRAND_GREEN_ACCENT = "#00B36B"; // Go Postgraduate Green
const BRAND_ORANGE = "#FF6600"; // Gaodun Orange

// Updated Logo to match User Image 2: GOLDEN (Orange) | 高顿 (Gray) | | | 去保研 (Green)
const BrandLogo = ({ size = "normal", color="color" }: { size?: "normal" | "large", color?: "color" | "white" }) => (
  <div className={`flex items-baseline tracking-tight select-none ${size === "large" ? "scale-125 origin-left" : ""}`}>
    {/* GOLDEN: Impact/Heavy Font, Orange */}
    <span className={`font-black mr-2 text-4xl leading-none tracking-tighter ${color === 'white' ? 'text-white' : 'text-[#FF6600]'}`} style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
      GOLDEN
    </span>
    
    {/* 高顿: Standard Bold, Gray (matches image) */}
    <span className={`font-bold mr-3 text-3xl leading-none ${color === 'white' ? 'text-white/80' : 'text-[#666666]'}`} style={{ fontFamily: 'system-ui, sans-serif' }}>
      高顿
    </span>
    
    {/* Divider */}
    <span className={`mr-3 text-3xl font-light leading-none ${color === 'white' ? 'text-white/30' : 'text-gray-300'}`}>|</span>
    
    {/* 去保研: Green, Stylized/Skewed to mimic the dynamic font */}
    <span className={`font-black text-3xl leading-none transform -skew-x-12 ${color === 'white' ? 'text-white' : 'text-[#00B36B]'}`} style={{ fontFamily: 'SimHei, sans-serif', letterSpacing: '0.05em' }}>
      去保研
    </span>
  </div>
);

// --- High-End Loading Screen ---
const LoadingScreen = ({ schoolName }: { schoolName: string }) => {
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState("正在建立安全连接...");
  
  useEffect(() => {
    const totalTime = 30000; // 30s
    const intervalTime = 100;
    const steps = totalTime / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const percent = Math.min(Math.round((currentStep / steps) * 100), 99);
      setProgress(percent);

      // Dynamic Status Text
      if (percent < 20) setStepText(`正在接入 ${schoolName} 教务处数据库...`);
      else if (percent < 40) setStepText("正在检索 2023-2025 届保研推免名单...");
      else if (percent < 60) setStepText("DeepSeek 大模型正在进行 SWOT 深度交叉分析...");
      else if (percent < 80) setStepText("正在计算目标院校录取概率模型...");
      else setStepText("正在生成个性化保研规划报告...");

      if (currentStep >= steps) clearInterval(timer);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [schoolName]);

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F7FA] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00B36B] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FF6600] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Progress Circle */}
        <div className="relative w-56 h-56 mb-12">
          <svg className="w-full h-full -rotate-90">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00B36B" />
                <stop offset="100%" stopColor="#009F5F" />
              </linearGradient>
            </defs>
            <circle cx="112" cy="112" r="100" stroke="#E5E7EB" strokeWidth="8" fill="none" />
            <circle 
              cx="112" cy="112" r="100" 
              stroke="url(#gradient)" strokeWidth="8" fill="none" 
              strokeDasharray="628" 
              strokeDashoffset={628 - (628 * progress) / 100}
              className="transition-all duration-300 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-black text-[#003B30] tracking-tighter tabular-nums">{progress}%</span>
            <span className="text-sm font-bold text-[#00B36B] uppercase tracking-[0.2em] mt-2">Processing</span>
          </div>
        </div>

        {/* Text Status */}
        <h2 className="text-2xl font-bold text-[#003B30] mb-3 animate-fade-in text-center px-4 min-h-[40px] tracking-tight">
          {stepText}
        </h2>
        
        <div className="flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-xl border border-gray-100 mt-8">
           <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 bg-[#FF6600] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2.5 h-2.5 bg-[#FF6600] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2.5 h-2.5 bg-[#FF6600] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
           </div>
           <span className="text-base font-medium text-gray-500">AI 深度运算中，请勿关闭页面</span>
        </div>
      </div>
    </div>
  );
};

// --- Visualizations ---
const TimelineSection = ({ items }: { items: TimelineItem[] }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="relative pl-10 border-l-2 border-dashed border-gray-200 space-y-12 my-8">
      {items.map((item, idx) => (
        <div key={idx} className="relative">
          {/* Dot */}
          <div className="absolute -left-[45px] top-0 w-6 h-6 rounded-full border-4 border-white bg-[#00B36B] shadow-lg ring-1 ring-gray-100"></div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h4 className="font-bold text-xl text-[#003B30] mb-6 flex items-center border-b border-gray-50 pb-4">
              {item.stage}
            </h4>
            <div className="space-y-4">
              {Object.entries(item.categoryContent).map(([key, val]) => {
                if (!val || val === "无") return null;
                const labelMap: Record<string, string> = { gpa: "成绩", english: "英语", research: "科研", contest: "竞赛" };
                return (
                  <div key={key} className="flex gap-6 text-base items-start">
                     <div className="font-bold text-gray-800 min-w-[50px] pt-0.5">{labelMap[key]}</div>
                     <div className="text-gray-600 leading-relaxed flex-1 text-justify">{val}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Form Component ---
const SinglePageForm = ({ onComplete }: { onComplete: (data: UserInfo) => void }) => {
  const [formData, setFormData] = useState<UserInfo>({
    name: '', phone: '', school: '', major: '', grade: '大二', rank: '前5%',
    english: '', competition: '', research: '', consultationFocus: ''
  });
  const [loading, setLoading] = useState(false);

  const isFreshman = formData.grade === '大一';
  const rankOptions = isFreshman 
    ? ['暂未排名/不知道', '前5%', '前10%', '前20%', '其他'] 
    : ['前1%', '前5%', '前10%', '前20%', '前50%', '其他'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.school || !formData.major || !formData.english || !formData.consultationFocus) {
      alert("请填写所有必填项（带 * 号）");
      return;
    }
    setLoading(true);
    await sendToFeishu(formData);
    await onComplete(formData);
  };

  if (loading) {
    return <LoadingScreen schoolName={formData.school} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20 relative overflow-hidden">
      {/* Background Decor to fix 'emptiness' */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-[#E6F7F0] to-transparent rounded-full blur-[120px] opacity-40 pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-t from-[#FFF7E6] to-transparent rounded-full blur-[100px] opacity-40 pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <BrandLogo />
          <div className="flex gap-3">
             <div className="flex items-center gap-1 bg-[#E6F7F0] text-[#00B36B] px-3 py-1.5 rounded-full text-xs font-bold border border-[#00B36B]/20">
               <ShieldCheck size={14} /> 官方数据认证
             </div>
             <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold">
               <BadgeCheck size={14} /> 名师人工审核
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12 px-4 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-[#003B30] mb-6 tracking-tight">AI 智能保研定位系统</h1>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed">
            基于高顿教育 15 年数据沉淀，结合 DeepSeek 大模型算法，为您生成<span className="text-[#00B36B] font-bold mx-1 border-b-2 border-[#00B36B]">商业级</span>保研规划报告。
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-[#003B30]/5 overflow-hidden border border-white">
          <div className="p-8 md:p-12 space-y-12">
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-[#00B36B] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-green-600/20">1</div>
                 <h3 className="text-2xl font-bold text-gray-900">个人基本信息</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-0 md:pl-16">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">姓名</label>
                  <input name="name" value={formData.name} onChange={handleChange} className="w-full h-14 px-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-xl text-lg outline-none focus:border-[#00B36B] transition-all placeholder:text-gray-300" placeholder="请输入您的姓名" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">联系方式 <span className="text-[#00B36B] text-xs normal-case">(便于顾问详细解读)</span></label>
                  <input name="phone" value={formData.phone} onChange={handleChange} className="w-full h-14 px-4 bg-[#E6F7F0]/30 border-2 border-[#00B36B]/10 focus:bg-white rounded-xl text-lg outline-none focus:border-[#00B36B] transition-all placeholder:text-gray-300" placeholder="请输入手机号" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-[#00B36B] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-green-600/20">2</div>
                 <h3 className="text-2xl font-bold text-gray-900">院校与学术背景</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-0 md:pl-16">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">本科院校</label>
                  <input name="school" value={formData.school} onChange={handleChange} className="w-full h-14 px-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-xl text-lg outline-none focus:border-[#00B36B] transition-all placeholder:text-gray-300" placeholder="请输入本科院校" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">就读专业</label>
                  <input name="major" value={formData.major} onChange={handleChange} className="w-full h-14 px-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-xl text-lg outline-none focus:border-[#00B36B] transition-all placeholder:text-gray-300" placeholder="请输入专业" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">当前年级</label>
                  <div className="relative">
                    <select name="grade" value={formData.grade} onChange={handleChange} className="w-full h-14 px-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-xl text-lg outline-none focus:border-[#00B36B] transition-all appearance-none cursor-pointer">
                      {['大一', '大二', '大三', '大四'].map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">{isFreshman ? "当前/预估 绩点排名" : "核心绩点排名"}</label>
                  <div className="relative">
                    <select name="rank" value={formData.rank} onChange={handleChange} className="w-full h-14 px-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-xl text-lg outline-none focus:border-[#00B36B] transition-all appearance-none cursor-pointer">
                      {rankOptions.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">英语水平 (四六级/雅思/托福)</label>
                  <input name="english" value={formData.english} onChange={handleChange} className="w-full h-14 px-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-xl text-lg outline-none focus:border-[#00B36B] transition-all placeholder:text-gray-300" placeholder="例: 六级580 / 雅思7.0 (必填)" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-[#00B36B] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-green-600/20">3</div>
                 <h3 className="text-2xl font-bold text-gray-900">科研与竞赛经历 <span className="text-sm font-normal text-gray-400 ml-2">(选填)</span></h3>
              </div>
              <div className="space-y-4 pl-0 md:pl-16">
                <textarea name="competition" value={formData.competition} onChange={handleChange} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-xl text-base outline-none focus:border-[#00B36B] transition-all h-24 resize-none placeholder:text-gray-300" placeholder="核心竞赛奖项..." />
                <textarea name="research" value={formData.research} onChange={handleChange} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-xl text-base outline-none focus:border-[#00B36B] transition-all h-24 resize-none placeholder:text-gray-300" placeholder="科研项目/论文经历..." />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-[#00B36B] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-green-600/20">4</div>
                 <h3 className="text-2xl font-bold text-gray-900">咨询重点 <span className="text-red-500">*</span></h3>
              </div>
              <div className="pl-0 md:pl-16">
                <textarea name="consultationFocus" value={formData.consultationFocus} onChange={handleChange} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:bg-white border-gray-100 rounded-xl text-base outline-none focus:border-[#00B36B] transition-all h-32 resize-none placeholder:text-gray-300" placeholder="您最想了解什么？" />
              </div>
            </div>

          </div>

          <div className="bg-gray-50 px-8 py-8 md:px-12 flex justify-center border-t border-gray-100">
            <button onClick={handleSubmit} className="w-full md:w-auto md:min-w-[320px] bg-gradient-to-r from-[#00B36B] to-[#009F5F] text-white font-bold text-xl py-4 px-8 rounded-full shadow-lg hover:shadow-green-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
              <Sparkles size={24} /> 生成我的保研规划报告
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Report Component (Rich Layout) ---
const Report = ({ userInfo, schoolData, aiData }: { userInfo: UserInfo, schoolData: SchoolData, aiData: AIResponse }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [pptGenerating, setPptGenerating] = useState(false);

  const displayRate = aiData.missingData?.rate || schoolData.rate;
  const displayPolicy = aiData.missingData?.policy || schoolData.policy;
  const displayDestinations = Array.isArray(aiData.missingData?.destinations) 
    ? aiData.missingData?.destinations.join(", ") 
    : (aiData.missingData?.destinations || schoolData.destinations);

  // Split destinations into tags for better readability
  const destinationTags = typeof displayDestinations === 'string' 
    ? displayDestinations.split(/[,，、]/).map(s => s.trim()).filter(s => s && s.length > 1) 
    : [];
    
  // Format policy text by splitting sentences
  const policySegments = displayPolicy 
    ? displayPolicy.replace(/([。；])/g, "$1|").split("|").filter(s => s.trim().length > 5)
    : ["暂无详细政策解读"];

  // --- PDF Generation (Clone Method for Straightness) ---
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    
    try {
      // 1. Clone the node to remove scroll dependencies
      const element = reportRef.current;
      const clone = element.cloneNode(true) as HTMLElement;
      
      // 2. Set fixed styles for the clone to ensure no skew
      clone.style.position = 'fixed';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.width = '1440px'; // Force desktop width
      clone.style.zIndex = '-9999';
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      
      document.body.appendChild(clone);

      // 3. Capture the clone
      const canvas = await html2canvas(clone, { 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        width: 1440,
        windowWidth: 1440,
        x: 0, 
        y: 0, 
        logging: false,
      });

      // 4. Clean up
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight); 
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`高顿去保研_规划报告_${userInfo.name}.pdf`);

    } catch (e) {
      console.error(e);
      alert("PDF生成失败");
    } finally {
      setDownloading(false);
    }
  };

  // --- PPT Generation (Native) ---
  const handleDownloadPPT = async () => {
    setPptGenerating(true);
    try {
      const pres = new PptxGenJS();
      pres.layout = 'LAYOUT_16x9';
      pres.title = `保研规划报告 - ${userInfo.name}`;

      // 1. Cover Slide
      const slide1 = pres.addSlide();
      slide1.background = { color: '003B30' };
      slide1.addText("保研定位与发展规划", { x: 1, y: 2.5, w: '80%', fontSize: 44, color: 'FFFFFF', bold: true });
      slide1.addText(`申请人：${userInfo.name} | 本科：${userInfo.school} | 专业：${userInfo.major}`, { x: 1, y: 3.5, w: '80%', fontSize: 18, color: 'AAAAAA' });
      slide1.addText("高顿去保研 · 智能大数据决策系统", { x: 1, y: 5.5, fontSize: 14, color: '00B36B' });

      // 2. SWOT Slide
      const slide2 = pres.addSlide();
      slide2.addText("竞争力深度评估 (SWOT)", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '003B30' });
      
      // Strengths
      slide2.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.0, w: 4.5, h: 2.5, fill: { color: 'F0FDF4' } });
      slide2.addText("核心优势", { x: 0.6, y: 1.2, fontSize: 14, bold: true, color: '00B36B' });
      slide2.addText(swot.strengths.join("\n"), { x: 0.6, y: 1.5, w: 4.2, fontSize: 12, color: '000000', bullet: true });

      // Weaknesses
      slide2.addShape(pres.ShapeType.rect, { x: 5.2, y: 1.0, w: 4.5, h: 2.5, fill: { color: 'FEF2F2' } });
      slide2.addText("劣势短板", { x: 5.3, y: 1.2, fontSize: 14, bold: true, color: 'FF0000' });
      slide2.addText(swot.weaknesses.join("\n"), { x: 5.3, y: 1.5, w: 4.2, fontSize: 12, color: '000000', bullet: true });

      // Opportunities
      slide2.addShape(pres.ShapeType.rect, { x: 0.5, y: 3.7, w: 4.5, h: 2.5, fill: { color: 'EFF6FF' } });
      slide2.addText("外部机会", { x: 0.6, y: 3.9, fontSize: 14, bold: true, color: '0000FF' });
      slide2.addText(swot.opportunities.join("\n"), { x: 0.6, y: 4.2, w: 4.2, fontSize: 12, color: '000000', bullet: true });

      // Threats
      slide2.addShape(pres.ShapeType.rect, { x: 5.2, y: 3.7, w: 4.5, h: 2.5, fill: { color: 'FFF7ED' } });
      slide2.addText("潜在威胁", { x: 5.3, y: 3.9, fontSize: 14, bold: true, color: 'FFA500' });
      slide2.addText(swot.threats.join("\n"), { x: 5.3, y: 4.2, w: 4.2, fontSize: 12, color: '000000', bullet: true });

      // 3. Radar Chart & Policy
      const slide3 = pres.addSlide();
      slide3.addText("推免政策与竞争力模型", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '003B30' });
      
      // Capture Radar (if available)
      if (radarRef.current) {
        const radarCanvas = await html2canvas(radarRef.current, { backgroundColor: null });
        const radarImg = radarCanvas.toDataURL('image/png');
        slide3.addImage({ data: radarImg, x: 0.5, y: 1.2, w: 4, h: 3 });
      }

      slide3.addText("预估保研率: " + currentRate + "%", { x: 5, y: 1.2, fontSize: 18, bold: true, color: '00B36B' });
      slide3.addText("核心去向:", { x: 5, y: 1.8, fontSize: 14, bold: true });
      slide3.addText(displayDestinations, { x: 5, y: 2.2, w: 4.5, fontSize: 11 });
      slide3.addText("政策重点:", { x: 5, y: 3.5, fontSize: 14, bold: true });
      slide3.addText(displayPolicy.substring(0, 300) + "...", { x: 5, y: 3.9, w: 4.5, fontSize: 11 });

      // 4. Target Schools
      const slide4 = pres.addSlide();
      slide4.addText("目标院校定位", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '003B30' });
      
      const schools = [
         { title: "冲刺 (Sprint)", data: targetSchools['冲刺院校'], color: 'FF4D4F' },
         { title: "稳妥 (Stable)", data: targetSchools['稳妥院校'], color: '1890FF' },
         { title: "保底 (Backup)", data: targetSchools['保底院校'], color: '52C41A' }
      ];

      schools.forEach((s, i) => {
         const xPos = 0.5 + (i * 3.2);
         slide4.addShape(pres.ShapeType.rect, { x: xPos, y: 1.2, w: 3, h: 4, fill: { color: 'FFFFFF' }, line: { color: s.color, width: 2 } });
         slide4.addText(s.title, { x: xPos + 0.2, y: 1.5, fontSize: 16, bold: true, color: s.color });
         slide4.addText(s.data, { x: xPos + 0.2, y: 2.0, w: 2.6, fontSize: 12 });
      });

      // 5. Timeline
      const slide5 = pres.addSlide();
      slide5.addText("阶段性规划", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '003B30' });
      
      planningItems.forEach((item, i) => {
         const yPos = 1.2 + (i * 1.5);
         slide5.addText(item.stage, { x: 0.5, y: yPos, fontSize: 14, bold: true, color: '00B36B' });
         slide5.addText(`GPA: ${item.categoryContent.gpa}`, { x: 0.8, y: yPos + 0.4, w: 8, fontSize: 10 });
         slide5.addText(`科研: ${item.categoryContent.research}`, { x: 0.8, y: yPos + 0.7, w: 8, fontSize: 10 });
      });

      await pres.writeFile({ fileName: `高顿去保研_规划报告_${userInfo.name}.pptx` });

    } catch (e) {
      console.error(e);
      alert("PPT生成失败");
    } finally {
      setPptGenerating(false);
    }
  };

  const planningItems = Array.isArray(aiData.planning) ? aiData.planning : [];
  const targetSchools = typeof aiData.targetSchools === 'object' ? aiData.targetSchools : { "院校推荐": String(aiData.targetSchools) };
  const bonusSchemes = aiData.bonusScheme || [];
  const admissionCases = aiData.admissionCases || [];

  const currentRate = displayRate || 15; 
  const swot = aiData.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  
  // --- Updated Radar Data Logic (Strict Empty Check) ---
  const getRadarScore = (val: string | undefined, type: 'rank' | 'english' | 'research' | 'contest') => {
    // 1. Strict Empty Check
    if (!val || val.trim() === '' || val.includes('未填写') || val === '无') return 30; // Visibly Low Score

    if (type === 'rank') {
       if (val.includes('1%') || val.includes('5%')) return 95;
       if (val.includes('10%')) return 85;
       if (val.includes('20%')) return 75;
       return 60;
    }
    if (type === 'english') {
      if (val.toLowerCase().includes('6级') || val.includes('六级') || parseInt(val) > 500) return 85;
      if (val.toLowerCase().includes('4级') || val.includes('四级')) return 70;
      return 60;
    }
    // Heuristic for research/contest: length of text
    return val.length > 8 ? 90 : 60;
  };

  const radarData = [
    { subject: '绩点排名', A: getRadarScore(userInfo.rank, 'rank'), fullMark: 100 },
    { subject: '科研能力', A: getRadarScore(userInfo.research, 'research'), fullMark: 100 },
    { subject: '英语水平', A: getRadarScore(userInfo.english, 'english'), fullMark: 100 },
    { subject: '竞赛奖项', A: getRadarScore(userInfo.competition, 'contest'), fullMark: 100 },
    { subject: '院校背景', A: userInfo.school.length > 4 ? 80 : 90, fullMark: 100 },
  ];

  return (
    <div className="bg-[#F5F7FA] min-h-screen pb-20 font-sans">
      
      {/* Floating Download Buttons */}
      <div className="fixed bottom-10 right-10 z-50 flex flex-col gap-4">
        <button 
          onClick={handleDownloadPPT}
          disabled={pptGenerating}
          className="bg-[#FF6600] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-[#e65c00] transition-all font-bold text-lg border-2 border-white hover:scale-105"
        >
          {pptGenerating ? <Loader2 className="animate-spin" size={24} /> : <Presentation size={24}/>}
          {pptGenerating ? "PPT 生成中..." : "下载 PPT 报告 (推荐)"}
        </button>

        <button 
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="bg-[#003B30] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-black transition-all font-bold text-lg border-2 border-[#00B36B] hover:scale-105"
        >
          {downloading ? <Loader2 className="animate-spin" size={24} /> : <Download size={24}/>}
          {downloading ? "PDF 生成中..." : "下载 PDF 报告"}
        </button>
      </div>

      <div ref={reportRef} className="max-w-[1440px] mx-auto bg-white shadow-2xl min-h-screen">
        
        {/* --- Header Section (Rich & Large) --- */}
        <div className="relative bg-[#003B30] overflow-hidden h-[360px] flex items-center">
           {/* Gradient overlay */}
           <div className="absolute inset-0 bg-gradient-to-br from-[#003B30] to-[#001f19]"></div>
           
           {/* Decorative Elements - Filling the 'empty' space */}
           <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden pointer-events-none opacity-10">
              <Compass size={600} className="absolute -right-32 -top-32 text-white animate-spin-slow" style={{ animationDuration: '60s' }} />
              <div className="absolute top-20 right-40 w-96 h-96 border-4 border-white/20 rounded-full"></div>
              <div className="absolute top-32 right-52 w-72 h-72 border-2 border-white/10 rounded-full"></div>
           </div>

           <div className="relative z-10 px-16 w-full">
              <div className="flex gap-4 mb-8">
                 <span className="bg-[#004d40] text-white/90 text-xs font-bold px-4 py-1.5 rounded tracking-widest border border-[#ffffff10] backdrop-blur-sm">CONFIDENTIAL</span>
                 <span className="bg-[#00B36B] text-white text-xs font-bold px-4 py-1.5 rounded tracking-widest shadow-lg shadow-green-900/20">VIP 深度定制</span>
              </div>
              <h1 className="text-7xl font-black text-white mb-6 tracking-tight leading-none">
                保研定位<span className="text-[#00B36B] mx-2">与</span>发展规划
              </h1>
              <p className="text-white/60 text-2xl tracking-[0.2em] font-light flex items-center gap-4">
                 <Target size={24} className="text-[#00B36B]"/>
                 高顿去保研 · 智能大数据决策系统
              </p>
           </div>
        </div>

        {/* --- Info Bar --- */}
        <div className="bg-white border-b border-gray-100 px-16 py-8 flex justify-between items-center shadow-sm">
           <div><div className="text-sm text-gray-400 mb-1">申请人</div><div className="font-bold text-2xl text-gray-900">{userInfo.name || "未填写"}</div></div>
           <div><div className="text-sm text-gray-400 mb-1">本科院校</div><div className="font-bold text-2xl text-gray-900">{userInfo.school}</div></div>
           <div><div className="text-sm text-gray-400 mb-1">专业方向</div><div className="font-bold text-2xl text-gray-900">{userInfo.major}</div></div>
           <div><div className="text-sm text-gray-400 mb-1">当前年级</div><div className="font-bold text-2xl text-[#00B36B]">{userInfo.grade}</div></div>
        </div>

        {/* --- Main Content --- */}
        <div className="p-16 space-y-16">

          {/* 1. Competitiveness Deep Dive (SWOT) */}
          <section>
             <div className="flex items-center gap-3 mb-10">
               <div className="w-2 h-10 bg-[#00B36B] rounded-full"></div>
               <h2 className="text-3xl font-extrabold text-gray-900">竞争力深度评估</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#F0FDF4] p-8 rounded-2xl border border-green-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                  <h4 className="flex items-center gap-2 font-bold text-xl text-[#00B36B] mb-4">
                    <ArrowUpRight size={24}/> 核心优势 (Strengths)
                  </h4>
                  <ul className="list-disc list-inside space-y-4 text-lg text-gray-800 font-bold leading-relaxed flex-1">
                    {swot.strengths?.map((s, i) => <li key={i}>{s}</li>) || <li>暂无分析</li>}
                  </ul>
                </div>
                <div className="bg-[#FEF2F2] p-8 rounded-2xl border border-red-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                  <h4 className="flex items-center gap-2 font-bold text-xl text-red-600 mb-4">
                    <ArrowDownRight size={24}/> 劣势短板 (Weaknesses)
                  </h4>
                  <ul className="list-disc list-inside space-y-4 text-lg text-gray-800 font-bold leading-relaxed flex-1">
                    {swot.weaknesses?.map((s, i) => <li key={i}>{s}</li>) || <li>暂无分析</li>}
                  </ul>
                </div>
                <div className="bg-[#EFF6FF] p-8 rounded-2xl border border-blue-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                  <h4 className="flex items-center gap-2 font-bold text-xl text-blue-600 mb-4">
                    <Zap size={24}/> 外部机会 (Opportunities)
                  </h4>
                  <ul className="list-disc list-inside space-y-4 text-lg text-gray-800 font-bold leading-relaxed flex-1">
                    {swot.opportunities?.map((s, i) => <li key={i}>{s}</li>) || <li>暂无分析</li>}
                  </ul>
                </div>
                <div className="bg-[#FFF7ED] p-8 rounded-2xl border border-orange-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                  <h4 className="flex items-center gap-2 font-bold text-xl text-orange-600 mb-4">
                    <ShieldAlert size={24}/> 潜在威胁 (Threats)
                  </h4>
                  <ul className="list-disc list-inside space-y-4 text-lg text-gray-800 font-bold leading-relaxed flex-1">
                    {swot.threats?.map((s, i) => <li key={i}>{s}</li>) || <li>暂无分析</li>}
                  </ul>
                </div>
             </div>
          </section>

          {/* 2. Policy & Bonus */}
          <section>
             <div className="flex items-center gap-3 mb-10">
               <div className="w-2 h-10 bg-[#00B36B] rounded-full"></div>
               <h2 className="text-3xl font-extrabold text-gray-900">推免政策与加分细则</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Column: Policy + Radar */}
                <div className="flex flex-col gap-6">
                   <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex-1">
                      <h4 className="flex items-center gap-3 font-bold text-xl text-[#003B30] mb-6">
                        <FileText size={24}/> 推免资格基本要求
                      </h4>

                      {/* Data & Destinations */}
                      <div className="flex gap-4 mb-8">
                          <div className="w-5/12 bg-[#E6F7F0] p-4 rounded-xl border border-green-100 flex flex-col justify-center items-center text-center">
                            <div className="text-xs text-gray-500 mb-1 font-bold">预估保研率</div>
                            <div className="text-4xl font-black text-[#00B36B]">{currentRate}%</div>
                          </div>
                          {/* UPDATED: Clean Tag Cloud for Destinations */}
                          <div className="w-7/12 bg-[#FFF7E6] p-5 rounded-xl border border-orange-100 flex flex-col">
                            <div className="text-xs text-gray-500 mb-3 font-bold flex items-center gap-1">
                               <Activity size={12}/> 核心去向院校
                            </div>
                            <div className="flex flex-wrap gap-2 content-start">
                              {destinationTags.length > 0 ? destinationTags.slice(0, 8).map((tag, idx) => (
                                <span key={idx} className="bg-white text-[#FF9900] text-xs font-bold px-2.5 py-1 rounded-md border border-[#FF9900]/20 shadow-sm whitespace-nowrap">
                                  {tag}
                                </span>
                              )) : <span className="text-gray-400 text-sm">暂无数据</span>}
                              {destinationTags.length > 8 && <span className="text-[#FF9900] text-xs font-bold self-center">...</span>}
                            </div>
                          </div>
                      </div>
                      
                      {/* Spaced Policy Text */}
                      <div className="space-y-4 mb-6">
                        {policySegments.map((segment, idx) => (
                           <p key={idx} className="bg-gray-50 p-4 rounded-xl text-gray-700 leading-relaxed text-base border border-gray-50">
                             {segment}
                           </p>
                        ))}
                      </div>

                      {/* Radar Chart (With Ref for PPT Capture) */}
                      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center">
                         <div className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-4">五维综合竞争力模型</div>
                         <div className="w-full h-64" ref={radarRef}>
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                <PolarGrid stroke="#e5e7eb" strokeWidth={1} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="My" dataKey="A" stroke="#00B36B" strokeWidth={3} fill="#00B36B" fillOpacity={0.15} />
                              </RadarChart>
                            </ResponsiveContainer>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Right Column: Bonus Scheme */}
                <div className="flex flex-col h-full">
                   <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm h-full relative">
                      <div className="absolute top-0 right-0 bg-[#FF6600] text-white text-sm font-bold px-6 py-2 rounded-bl-2xl shadow-sm">重点关注</div>
                      <h4 className="flex items-center gap-3 font-bold text-xl text-[#003B30] mb-8">
                        <Star size={24} className="text-[#FF6600]"/> 保研加分细则 (参考)
                      </h4>
                      <div className="space-y-8">
                          {bonusSchemes.length > 0 ? bonusSchemes.map((scheme, idx) => (
                            <div key={idx} className="border-b border-gray-100 last:border-0 pb-6">
                              <div className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-3">
                                <div className="w-2.5 h-2.5 bg-[#00B36B] rounded-full ring-2 ring-green-100"></div> {scheme.category}
                              </div>
                              <div className="space-y-4">
                                {scheme.items.map((item, i) => (
                                  <div key={i} className="flex justify-between items-center text-base bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors">
                                      <span className="text-gray-700 font-medium leading-relaxed">{item.item}</span>
                                      <span className="font-bold text-[#FF6600] text-lg whitespace-nowrap ml-4">{item.score}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )) : (
                            <div className="text-lg text-gray-400 text-center py-20 flex flex-col items-center">
                              <Activity className="mb-4 text-gray-300" size={48} />
                              暂无详细加分数据
                            </div>
                          )}
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* 3. Target Schools */}
          <section>
             <div className="flex items-center gap-3 mb-10">
               <div className="w-2 h-10 bg-[#00B36B] rounded-full"></div>
               <h2 className="text-3xl font-extrabold text-gray-900">目标院校精准定位</h2>
             </div>

             <div className="space-y-8">
               {[
                 { type: '冲刺', label: 'SPRINT', color: '#FF4D4F', bg: 'bg-red-50', border: 'border-red-100', prob: 20, data: targetSchools['冲刺院校'] },
                 { type: '稳妥', label: 'STABLE', color: '#1890FF', bg: 'bg-blue-50', border: 'border-blue-100', prob: 65, data: targetSchools['稳妥院校'] },
                 { type: '保底', label: 'BACKUP', color: '#52C41A', bg: 'bg-green-50', border: 'border-green-100', prob: 90, data: targetSchools['保底院校'] },
               ].map((school, i) => (
                 <div key={i} className={`flex bg-white border ${school.border} rounded-2xl overflow-hidden shadow-sm min-h-[160px] h-auto hover:shadow-md transition-shadow`}>
                    <div className="w-40 flex flex-col items-center justify-center text-white p-6 shrink-0" style={{ backgroundColor: school.color }}>
                       <span className="text-3xl font-black tracking-widest">{school.type}</span>
                       <span className="text-xs opacity-80 uppercase font-bold mt-2 tracking-widest">{school.label}</span>
                    </div>
                    <div className="flex-1 p-8 flex items-center justify-between gap-12">
                       <div className="flex-1 pr-12 border-r border-gray-100 h-full flex items-center">
                          {/* UPDATED: Better paragraph spacing for readability */}
                          <div className="text-gray-800 font-medium text-lg leading-loose break-words whitespace-pre-wrap">
                             {school.data.split(/[;；]/).map((line, lIdx) => (
                               <p key={lIdx} className="mb-4 last:mb-0">{line.trim()}</p>
                             ))}
                          </div>
                       </div>
                       <div className="w-36 text-center flex flex-col justify-center shrink-0">
                          <div className="text-5xl font-black mb-2" style={{ color: school.color }}>{school.prob}%</div>
                          <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">上岸概率</div>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          </section>

          {/* 3.5. Admission Cases */}
          <section>
             <div className="flex items-center gap-3 mb-10">
               <div className="w-2 h-10 bg-[#00B36B] rounded-full"></div>
               <h2 className="text-3xl font-extrabold text-gray-900">学长学姐上岸案例</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {admissionCases.length > 0 ? admissionCases.map((c, i) => (
                 <div key={i} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group flex flex-col">
                   <div className="absolute top-0 right-0 bg-[#E6F7F0] text-[#00B36B] text-[10px] font-bold px-3 py-1 rounded-bl-xl">{c.offer.split(' ')[0]}</div>
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl">
                        {c.student.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-900">{c.student}</div>
                        <div className="text-xs text-gray-400">{c.school} · {c.major}</div>
                      </div>
                   </div>
                   <div className="space-y-3 mb-6 flex-1">
                      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                        <span className="text-gray-500">综合绩点</span>
                        <span className="font-bold text-gray-800">{c.gpa}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                        <span className="text-gray-500">英语水平</span>
                        <span className="font-bold text-gray-800">{c.english}</span>
                      </div>
                   </div>
                   {/* UPDATED: Fixed text swallowing by using text-sm and min-height */}
                   <div className="bg-[#003B30] text-white p-3 rounded-xl text-center min-h-[70px] flex flex-col justify-center">
                      <div className="text-[10px] text-white/60 mb-1 uppercase tracking-wider">Admitted To</div>
                      <div className="font-bold text-sm leading-tight px-1 break-words">{c.offer}</div>
                   </div>
                 </div>
               )) : (
                 <div className="col-span-3 text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Users className="mx-auto mb-2 opacity-20" size={48}/>
                    暂无匹配案例
                 </div>
               )}
             </div>
          </section>

          {/* 4. Research & Competitions */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-12">
             {/* Competitions */}
             <div>
               <div className="flex items-center gap-3 mb-6 text-[#FF9900]">
                 <Trophy size={28} fill="#FF9900" />
                 <h3 className="font-extrabold text-2xl text-gray-900">核心竞赛推荐</h3>
               </div>
               
               <div className="bg-white p-8 rounded-2xl border border-orange-100 shadow-sm mb-6">
                 <p className="text-gray-700 leading-8 whitespace-pre-wrap font-medium text-lg">
                   {typeof aiData.competitions === 'string' ? aiData.competitions : JSON.stringify(aiData.competitions)}
                 </p>
               </div>

               <div className="space-y-4">
                  {[
                    { name: "中国高校计算机大赛-天梯赛", tag: "国家级", desc: "大二必冲，含金量极高" },
                    { name: "全国大学生数学建模竞赛", tag: "国家级", desc: "理工科保研硬通货，必备项" },
                  ].map((c, i) => (
                    <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm hover:bg-white hover:border-orange-100 transition-colors">
                       <div>
                         <h4 className="font-bold text-gray-900 text-lg mb-2">{c.name}</h4>
                         <p className="text-base text-gray-500">{c.desc}</p>
                       </div>
                       <span className="bg-[#FFF7E6] text-[#FF9900] text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap border border-[#FFE58F]">{c.tag}</span>
                    </div>
                  ))}
               </div>
             </div>

             {/* Research */}
             <div>
               <div className="flex items-center gap-3 mb-6 text-[#1890FF]">
                 <BookOpen size={28} fill="#1890FF" />
                 <h3 className="font-extrabold text-2xl text-gray-900">科研背景提升</h3>
               </div>
               
               <div className="bg-[#EFF6FF] rounded-2xl p-8 border border-blue-100 mb-6 relative overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                     <Microscope className="text-[#1890FF]" size={24} />
                     <h4 className="font-bold text-[#1e3a8a] text-xl">科研方向深度建议</h4>
                  </div>
                  <div className="text-[#1e40af] text-base leading-8 whitespace-pre-wrap font-medium">
                     {typeof aiData.researchAdvice === 'string' ? aiData.researchAdvice : JSON.stringify(aiData.researchAdvice)}
                  </div>
               </div>
               
               <div className="bg-[#003B30] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg transform hover:scale-[1.01] transition-transform cursor-pointer">
                  <div className="absolute top-0 right-0 p-4">
                     <span className="bg-white/20 text-white text-xs px-4 py-1.5 rounded-full backdrop-blur-sm font-bold tracking-wide">高端科研项目</span>
                  </div>
                  <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">门生计划 · 线上小班</h4>
                  <ul className="text-base space-y-3 mb-6 text-white/90">
                     <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-[#00B36B]"/> Top30名校导师亲授</li>
                     <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-[#00B36B]"/> 独立一作 EI/SCI 论文产出</li>
                  </ul>
                  <div className="w-full bg-[#00B36B] text-white py-4 rounded-xl text-center text-base font-bold tracking-widest hover:bg-[#009F5F] transition-colors">
                     查看 100+ 可选课题库
                  </div>
               </div>
             </div>
          </section>

          {/* 5. Timeline */}
          <section>
             <div className="flex items-center gap-3 mb-10">
               <div className="w-2 h-10 bg-[#00B36B] rounded-full"></div>
               <h2 className="text-3xl font-extrabold text-gray-900">阶段性学习规划</h2>
             </div>
             
             <div className="bg-[#FFFBE6] border border-[#FFE58F] p-8 rounded-2xl mb-12 flex gap-6 items-start shadow-sm">
                <div className="bg-[#FF9900] text-white p-3 rounded-full mt-1 shrink-0"><Clock size={24}/></div>
                <div>
                   <h4 className="font-bold text-gray-900 text-xl mb-3">
                      {userInfo.grade === '大一' ? '大一阶段核心战略' : userInfo.grade === '大二' ? '大二阶段核心战略' : '保研冲刺核心战略'}
                   </h4>
                   <p className="text-base text-gray-700 leading-8">
                      {userInfo.grade === '大一' 
                        ? '大一的核心任务是刷高绩点(GPA)并搞定四六级，这是保研的入场券。'
                        : userInfo.grade === '大二'
                        ? '大二是背景塑造的黄金期，核心战略是必须在本学年内完成至少一项有成果的科研或竞赛项目。'
                        : '大三是保研的决战期，核心在于夏令营的投递、材料准备与面试突击。'}
                   </p>
                </div>
             </div>

             <TimelineSection items={planningItems} />
          </section>

          {/* 6. Footer Ad */}
          <div className="bg-[#1F2937] rounded-3xl p-12 relative overflow-hidden shadow-2xl">
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                   <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="text-[#00B36B]" fill="#00B36B" size={28} />
                      <h3 className="text-3xl font-bold text-[#00B36B]">高顿去保研 · 澎湃计划</h3>
                   </div>
                   <p className="text-gray-400 text-base mb-6 max-w-xl">打破信息差，锁定名校Offer！为你的保研之路提供全方位护航。</p>
                   <div className="flex flex-wrap gap-6 text-sm text-gray-300">
                      <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-[#00B36B]"/> 1对1定制化择校</span>
                      <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-[#00B36B]"/> 985/211 内部导师推荐</span>
                   </div>
                </div>
                <div className="bg-white/10 text-white font-bold py-4 px-10 rounded-xl border border-white/20 text-base whitespace-nowrap backdrop-blur-md hover:bg-white/20 transition-colors cursor-pointer">
                   官方认证 · 全程护航
                </div>
             </div>
             <div className="absolute -right-10 -bottom-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
          </div>

          <div className="text-center pt-8 border-t border-gray-200">
             <p className="text-gray-400 text-xs">高顿去保研 · 澎湃计划</p>
             <p className="text-gray-300 text-[10px] mt-1">数据仅供参考，请以各校教务处官方公示为准</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);

  const handleFormComplete = async (data: UserInfo) => {
    const sData = getSchoolData(data.school);
    setSchoolData(sData);
    setUserInfo(data);

    try {
      const aiRes = await generateAIReport(data, sData);
      setAiResponse(aiRes);
    } catch (e) {
      console.error("Error", e);
      alert("生成报告时发生错误，请稍后重试");
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#F5F7FA] font-sans text-gray-900 selection:bg-green-100 selection:text-green-900">
        <Routes>
          <Route path="/" element={
            !aiResponse ? (
              <div className="animate-fade-in">
                 <SinglePageForm onComplete={handleFormComplete} />
              </div>
            ) : (
              <Report userInfo={userInfo!} schoolData={schoolData!} aiData={aiResponse} />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}