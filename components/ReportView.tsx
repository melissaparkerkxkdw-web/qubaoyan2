import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReportData, UserFormData } from '../types';
import PengpaiAd from './PengpaiAd';

declare global {
  interface Window {
    Chart: any;
  }
}

interface ReportViewProps {
  data: ReportData;
  userData: UserFormData;
}

// Helper to render text with bold markdown (**text**)
const renderMarkdownText = (text: string) => {
  if (!text) return null;
  const cleanText = text.replace(/\\n/g, '\n');
  const paragraphs = cleanText.split('\n').filter(p => p.trim());
  
  return (
    <div className="space-y-3 text-gray-700 leading-relaxed text-sm md:text-base">
      {paragraphs.map((paragraph, idx) => (
        <div key={idx} className="text-justify">
          {paragraph.split(/(\*\*.*?\*\*)/g).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={index} className="text-gray-900 font-bold bg-yellow-50/50 px-0.5 rounded">{part.slice(2, -2)}</strong>;
            }
            return <span key={index}>{part}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

const ReportView: React.FC<ReportViewProps> = ({ data, userData }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const radarChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize Charts
  useEffect(() => {
    // === FIX 1: Set Font Family Globally to prevent garbled text in Canvas ===
    if (window.Chart) {
      window.Chart.defaults.font.family = '"Noto Sans SC", "Microsoft YaHei", "SimHei", sans-serif';
    }

    const charts: any[] = [];

    const drawDataLabelsPlugin = {
      id: 'drawDataLabels',
      afterDatasetsDraw(chart: any) {
        const { ctx } = chart;
        chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
          const meta = chart.getDatasetMeta(datasetIndex);
          if (meta.hidden) return;
          meta.data.forEach((element: any, index: number) => {
            const value = dataset.data[index];
            if (value === null || value === undefined) return;
            ctx.save();
            ctx.font = 'bold 11px "Noto Sans SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (chart.config.type === 'bar') {
              ctx.fillStyle = '#374151';
              const { x, y } = element.tooltipPosition();
              ctx.fillText(`${value}%`, x, y - 12); 
            } else if (chart.config.type === 'doughnut') {
              if (element.circumference > 0.2) { 
                  ctx.fillStyle = '#ffffff';
                  const { x, y } = element.tooltipPosition();
                  ctx.fillText(`${value}%`, x, y);
              }
            }
            ctx.restore();
          });
        });
      }
    };

    const initChart = (ref: React.RefObject<HTMLCanvasElement>, config: any) => {
      if (ref.current && window.Chart) {
        const ctx = ref.current.getContext('2d');
        if (ctx) {
           const existing = window.Chart.getChart(ref.current);
           if(existing) existing.destroy();
           charts.push(new window.Chart(ctx, config));
        }
      }
    };

    initChart(radarChartRef, {
      type: 'radar',
      data: {
        labels: ['绩点排名', '科研能力', '英语水平', '竞赛奖项', '院校背景'],
        datasets: [{
          label: '我的竞争力',
          data: [data.metrics.gpaScore, data.metrics.researchScore, data.metrics.englishScore, data.metrics.competitionScore, 85],
          fill: true,
          backgroundColor: 'rgba(5, 150, 105, 0.2)',
          borderColor: '#059669',
          borderWidth: 2,
          pointBackgroundColor: '#059669',
          pointRadius: 3
        }]
      },
      options: {
        maintainAspectRatio: false,
        scales: { 
          r: { 
            ticks: { display: false }, 
            suggestedMin: 0, 
            suggestedMax: 100,
            pointLabels: {
              font: {
                size: 11,
                family: '"Noto Sans SC", sans-serif' 
              }
            }
          } 
        },
        plugins: { legend: { display: false } }
      }
    });

    initChart(barChartRef, {
      type: 'bar',
      plugins: [drawDataLabelsPlugin],
      data: {
        labels: data.admissionTrend.map(d => d.label),
        datasets: [{
          label: '保研率(%)',
          data: data.admissionTrend.map(d => d.value),
          backgroundColor: '#059669',
          borderRadius: 4,
          barPercentage: 0.5
        }]
      },
      options: {
        maintainAspectRatio: false,
        layout: { padding: { top: 20 } },
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f3f4f6' }, grace: '10%' },
          x: { grid: { display: false } }
        }
      }
    });

    initChart(pieChartRef, {
      type: 'doughnut',
      plugins: [drawDataLabelsPlugin],
      data: {
        labels: data.graduateDestinations.map(d => d.label),
        datasets: [{
          data: data.graduateDestinations.map(d => d.value),
          backgroundColor: ['#059669', '#34d399', '#fbbf24', '#cbd5e1'],
          borderWidth: 0
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: { 
          legend: { position: 'right', labels: { font: { size: 10, family: '"Noto Sans SC", sans-serif' }, boxWidth: 10 } } 
        }
      }
    });

    return () => {
      charts.forEach(c => c.destroy());
    };
  }, [data]);

  const handleDownloadPDF = async () => {
    if (!printRef.current || isGenerating) return;
    setIsGenerating(true);
    const element = printRef.current;
    
    // --- STEP 1: PREPARE DOM FOR CAPTURE ---
    const originalStyle = element.getAttribute('style');
    const originalClass = element.getAttribute('class');

    // Force fixed width to ensure chart responsiveness matches print expectation
    const PRINT_WIDTH = 1080; 
    
    element.style.width = `${PRINT_WIDTH}px`;
    element.style.margin = '0';
    element.style.padding = '0';
    element.style.boxShadow = 'none';
    element.style.borderRadius = '0';
    element.className = 'bg-white text-gray-800 font-sans'; 

    // --- STEP 2: CAPTURE AND GENERATE ---
    try {
      // Small timeout to allow DOM to reflow after width change
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: PRINT_WIDTH,
        windowWidth: PRINT_WIDTH,
        scrollY: 0, 
        scrollX: 0,
        x: 0,
        y: 0
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const ratio = pdfWidth / canvas.width;
      const scaledHeight = canvas.height * ratio;
      
      let heightLeft = scaledHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;

      // Add subsequent pages
      while (heightLeft > 0) {
        position -= pdfHeight; // Move the image up
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`高顿去保研_定制规划报告_${userData.name}.pdf`);
    } catch (e) {
      console.error("PDF Gen Error", e);
      alert("生成PDF时出现错误，请刷新重试");
    } finally {
      // --- STEP 3: CLEANUP ---
      if (originalStyle) element.setAttribute('style', originalStyle);
      else {
          element.style.width = '';
          element.style.margin = '';
          element.style.padding = '';
          element.style.boxShadow = '';
          element.style.borderRadius = '';
      }
      if (originalClass) element.setAttribute('class', originalClass);
      
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-8 sticky top-24 z-30 no-print">
        <button 
          onClick={() => window.location.reload()}
          className="text-gray-500 hover:text-gd-primary transition text-sm flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm"
        >
          <i className="fas fa-arrow-left"></i> 返回修改信息
        </button>
        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className={`${isGenerating ? 'bg-gray-400' : 'bg-gd-primary hover:bg-emerald-700'} text-white px-6 py-3 rounded-full shadow-xl shadow-emerald-200 transition flex items-center gap-2 transform hover:-translate-y-1 font-bold`}
        >
          {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-download"></i>}
          {isGenerating ? '正在处理排版...' : '下载高清 PDF'}
        </button>
      </div>

      <div ref={printRef} className="print-container bg-white shadow-2xl rounded-[2rem] overflow-hidden text-gray-800 pb-12 ring-1 ring-black/5">
        
        {/* === HEADER === */}
        <div className="relative bg-[#064e3b] text-white p-12 overflow-hidden">
           <div className="absolute top-0 right-0 w-full h-full opacity-10">
             <svg width="100%" height="100%" viewBox="0 0 800 400">
                <path d="M600,0 L800,200 L600,400" fill="none" stroke="#fbbf24" strokeWidth="2" />
                <path d="M550,0 L750,200 L550,400" fill="none" stroke="#fbbf24" strokeWidth="1" />
             </svg>
           </div>
           
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
             <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-white/10 px-3 py-1 rounded text-xs font-bold tracking-widest text-emerald-200">CONFIDENTIAL</span>
                  <span className="bg-gd-gold px-3 py-1 rounded text-xs font-bold text-white shadow-lg">VIP 定制</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">保研定位与发展规划</h1>
                <p className="text-emerald-200 text-lg font-light">高顿去保研 · 智能大数据决策系统</p>
             </div>
             <div className="text-right hidden md:block">
               <div className="text-6xl text-emerald-500/30" style={{fontFamily: '"Ma Shan Zheng", cursive'}}>去保研</div>
             </div>
           </div>
        </div>

        {/* === USER PROFILE === */}
        <div className="bg-emerald-50/50 border-b border-emerald-100 px-12 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div><span className="block text-gray-400 text-xs mb-1">申请人</span><span className="font-bold text-lg">{userData.name}</span></div>
            <div><span className="block text-gray-400 text-xs mb-1">本科院校</span><span className="font-bold text-lg">{userData.university}</span></div>
            <div><span className="block text-gray-400 text-xs mb-1">专业方向</span><span className="font-bold text-lg">{userData.major}</span></div>
            <div><span className="block text-gray-400 text-xs mb-1">当前年级</span><span className="font-bold text-lg text-gd-primary">{userData.grade}</span></div>
          </div>
        </div>

        {/* === MAIN CONTENT === */}
        <div className="p-8 md:p-12 bg-white">
          
          {/* SECTION 1: VISUAL SUMMARY (Keep at Top for Impact) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
             <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-chart-pie text-gd-primary"></i> 竞争力深度评估
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-6 border-l-4 border-gd-primary shadow-sm">
                     {renderMarkdownText(data.summary)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <h4 className="text-sm font-bold text-gray-500 mb-4">近三年本校保研率趋势</h4>
                      <div className="h-40">
                        <canvas ref={barChartRef}></canvas>
                      </div>
                   </div>
                   <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col">
                      <h4 className="text-sm font-bold text-gray-500 mb-4">往届保研去向分布</h4>
                      <div className="h-32 mb-2">
                        <canvas ref={pieChartRef}></canvas>
                      </div>
                      <div className="mt-auto pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-400 mb-1">常见接收院校（参考）：</div>
                        <div className="flex flex-wrap gap-1">
                          {data.destinationSchools?.slice(0, 4).map((s,i) => (
                             <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 flex flex-col items-center justify-center">
                <h4 className="text-sm font-bold text-gray-400 mb-4 self-start">五维能力模型</h4>
                <div className="w-full h-64">
                   <canvas ref={radarChartRef}></canvas>
                </div>
             </div>
          </div>

          <hr className="border-gray-100 my-10" />

          {/* SECTION 2: POLICY ANALYSIS (Reordered) */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
               <span className="w-1.5 h-8 bg-gd-primary rounded-full mr-3"></span>
               本校推免政策深度解析
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 bg-gradient-to-r from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100">
                <h4 className="font-bold text-gray-800 mb-3 text-sm">推免资格获取核心</h4>
                {renderMarkdownText(data.policyAnalysis)}
                <div className="text-xs text-gray-400 mt-2">* 政策每年可能微调，以上解析基于往年数据与同档次院校通用规则，仅供参考。</div>
              </div>
              <div className="lg:col-span-2">
                 <h4 className="font-bold text-gray-800 mb-3 text-sm">加分细则参考</h4>
                 <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-gray-50 text-gray-500 font-medium">
                         <tr>
                           <th className="px-4 py-3">类别</th>
                           <th className="px-4 py-3">项目</th>
                           <th className="px-4 py-3">预估加分</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                         {data.bonusPolicy && data.bonusPolicy.length > 0 ? data.bonusPolicy.map((item, idx) => (
                           <tr key={idx} className="hover:bg-gray-50">
                             <td className="px-4 py-2.5 text-gray-600">{item.category}</td>
                             <td className="px-4 py-2.5 font-medium text-gray-800">{item.item}</td>
                             <td className="px-4 py-2.5 text-emerald-600 font-bold">{item.score}</td>
                           </tr>
                         )) : (
                           <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-400">暂无具体加分数据</td></tr>
                         )}
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: TARGET SCHOOLS (Reordered) */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
               <span className="w-1.5 h-8 bg-gd-primary rounded-full mr-3"></span>
               目标院校精准定位
            </h3>
            <div className="grid grid-cols-1 gap-5">
               {data.recommendations.map((rec, idx) => (
                 <div key={idx} className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
                    <div className={`w-full md:w-24 flex items-center justify-center p-3 text-white font-bold text-lg
                        ${rec.type === '冲刺' ? 'bg-rose-500' : rec.type === '稳妥' ? 'bg-blue-600' : 'bg-emerald-500'}
                      `}>
                        {rec.type}
                    </div>
                    <div className="p-5 flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {rec.schools.map(s => (
                          <span key={s} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md font-bold text-sm">{s}</span>
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm">{rec.note}</p>
                    </div>
                    <div className="p-5 bg-gray-50 flex flex-col justify-center items-center w-full md:w-32 border-l border-gray-100">
                        <span className="text-2xl font-black text-gray-800">{rec.successRate}%</span>
                        <span className="text-[10px] text-gray-400">上岸概率</span>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          {/* SECTION 4: SIMILAR CASES (Reordered) */}
          {data.similarCases && data.similarCases.length > 0 && (
            <section className="mb-12">
               <div className="flex items-center gap-3 mb-6">
                 <h3 className="text-2xl font-bold text-gray-900">历史相似录取案例</h3>
                 <span className="bg-emerald-100 text-gd-primary text-xs px-2 py-1 rounded border border-emerald-200 font-medium">
                   <i className="fas fa-database mr-1"></i> RAG 检索结果
                 </span>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {data.similarCases.map((item, idx) => (
                   <div key={idx} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition relative overflow-hidden group">
                      <div className="absolute top-0 right-0 bg-emerald-50 text-gd-primary text-xs font-bold px-3 py-1 rounded-bl-xl">
                        {item.year}
                      </div>
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-gd-primary transition">{item.admissionSchool}</h4>
                        <p className="text-sm text-gray-500 font-medium">录取专业：{item.admissionMajor}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm border border-gray-100">
                        <span className="text-gray-400 block text-xs mb-1">生源背景</span>
                        <div className="font-bold text-gray-700">{item.originBackground}</div>
                      </div>
                      <div>
                         <span className="text-xs font-bold text-gd-primary bg-emerald-50 px-2 py-1 rounded">核心亮点</span>
                         <span className="text-sm text-gray-600 ml-2">{item.highlights}</span>
                      </div>
                   </div>
                 ))}
               </div>
            </section>
          )}

          {/* SECTION 5: STUDY PLANNING (Timeline & Guidance) */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-8">
               <h3 className="text-2xl font-bold text-gray-900">阶段性学习规划</h3>
               <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">Personalized Timeline</span>
            </div>

            {/* Grade Guidance Box */}
            <div className="bg-gradient-to-r from-amber-50 to-white border border-amber-100 rounded-2xl p-6 mb-8 shadow-sm">
               <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                 <i className="fas fa-compass text-amber-500"></i> {userData.grade}阶段核心战略
               </h3>
               {renderMarkdownText(data.gradeGuidance)}
            </div>
            
            <div className="relative border-l-2 border-emerald-100 ml-4 space-y-8">
              {data.timeline && data.timeline.length > 0 ? data.timeline.map((item, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-gd-primary"></div>
                  <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-bold text-gd-primary bg-emerald-50 px-3 py-1 rounded-full">{item.period}</span>
                       <span className="text-xs text-gray-400 font-bold tracking-wider uppercase">{item.tag || 'PLANNING'}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h4>
                    {renderMarkdownText(item.content)}
                  </div>
                </div>
              )) : (
                <div className="text-gray-400 text-sm pl-8">暂无具体时间轴建议</div>
              )}
            </div>
          </section>

          {/* SECTION 6: COMPETITION & RESEARCH (With Mensheng Plan) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
             <section>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                   <i className="fas fa-trophy text-amber-500"></i> 核心竞赛推荐
                </h3>
                <div className="space-y-4">
                  {data.competitionsRecommended.length > 0 ? data.competitionsRecommended.map((comp, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:border-amber-200 transition">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800">{comp.title}</h4>
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{comp.level}</span>
                       </div>
                       {renderMarkdownText(comp.description)}
                    </div>
                  )) : <div className="text-gray-400 text-sm">暂无具体推荐，请咨询顾问。</div>}
                </div>
             </section>

             <section>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                   <i className="fas fa-flask text-blue-500"></i> 科研背景提升
                </h3>
                <div className="space-y-4">
                  {/* MENSHENG PLAN CARD (Implanted) */}
                  <div className="bg-gradient-to-br from-[#064e3b] to-[#059669] text-white p-5 rounded-xl shadow-lg relative overflow-hidden group hover:scale-[1.02] transition duration-300 cursor-pointer">
                     <div className="absolute top-0 right-0 p-2 opacity-20">
                        <i className="fas fa-atom text-6xl"></i>
                     </div>
                     <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                           <h4 className="font-bold text-lg text-amber-300">门生计划 · 线上小班</h4>
                           <span className="bg-white/20 text-xs px-2 py-1 rounded backdrop-blur-sm">高端科研</span>
                        </div>
                        <p className="text-emerald-100 text-xs mb-3 leading-relaxed">
                          科研筑梦，创新领航。6周在线小组科研 + 5周论文指导，直通 EI/CPCI/核心期刊发表。
                        </p>
                        <div className="space-y-1 mb-3">
                           <div className="flex items-center gap-2 text-xs">
                             <i className="fas fa-check-circle text-amber-400"></i> Top30海外名校导师领衔
                           </div>
                           <div className="flex items-center gap-2 text-xs">
                             <i className="fas fa-check-circle text-amber-400"></i> 独立一作论文产出
                           </div>
                        </div>
                        <div className="text-center mt-2">
                           <span className="text-xs font-bold border border-white/30 px-3 py-1 rounded-full">查看课题详情 &gt;</span>
                        </div>
                     </div>
                  </div>

                  {data.researchRecommended.length > 0 ? data.researchRecommended.map((res, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:border-blue-200 transition">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800">{res.title}</h4>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{res.level}</span>
                       </div>
                       {renderMarkdownText(res.description)}
                    </div>
                  )) : <div className="text-gray-400 text-sm">建议联系本院导师，进入实验室参与基础数据处理工作。</div>}
                </div>
             </section>
          </div>

          <div>
             <PengpaiAd />
          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 text-center p-8 border-t border-gray-200">
           <p className="text-gray-500 text-sm font-medium">高顿去保研 · 澎湃计划</p>
           <p className="text-gray-400 text-xs mt-1">数据仅供参考，具体请以各校教务处官方公示为准</p>
        </div>

      </div>
    </div>
  );
};

export default ReportView;