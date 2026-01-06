import React, { useState } from 'react';
import { UserFormData } from '../types';

interface InputFormProps {
  onSubmit: (data: UserFormData) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '', contact: '', university: '', major: '', grade: '',
    gpaRanking: '', englishScore: '', competitions: '', research: '', targetFocus: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 mb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          AI 智能保研定位系统
        </h2>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          基于高顿教育 15 年数据沉淀，结合 DeepSeek 大模型算法，为您生成<span className="text-gd-primary font-bold">商业级</span>保研规划报告。
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-4 border-b border-gray-100 flex items-center gap-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <span className="text-xs text-gray-400 ml-2 font-bold tracking-wide">信息录入</span>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-8 md:p-12 space-y-10">
          
          {/* Section 1 */}
          <section>
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-gd-primary flex items-center justify-center font-bold mr-3">1</div>
              <h3 className="text-lg font-bold text-gray-800">个人基本信息</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">姓名</label>
                <input required name="name" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-gd-primary outline-none transition duration-200" 
                  placeholder="请输入您的姓名" value={formData.name} onChange={handleChange} />
              </div>
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
                  联系方式 <span className="text-gd-primary font-medium ml-1">(便于顾问详细解读)</span>
                </label>
                <input required name="contact" className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-gd-primary outline-none transition duration-200" 
                  placeholder="请输入手机号或微信号 (报告生成后将同步发送)" value={formData.contact} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-gd-primary flex items-center justify-center font-bold mr-3">2</div>
              <h3 className="text-lg font-bold text-gray-800">院校与学术背景</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">本科院校</label>
                 <input required name="university" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-gd-primary outline-none transition" 
                   placeholder="请输入本科院校全称" value={formData.university} onChange={handleChange} />
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">就读专业</label>
                 <input required name="major" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-gd-primary outline-none transition" 
                   placeholder="请输入专业全称" value={formData.major} onChange={handleChange} />
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">当前年级</label>
                 <select required name="grade" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-gd-primary outline-none transition text-gray-700"
                  value={formData.grade} onChange={handleChange}>
                  <option value="">请选择年级</option>
                  <option value="大一">大一</option>
                  <option value="大二">大二</option>
                  <option value="大三">大三</option>
                  <option value="大四">大四</option>
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">核心绩点</label>
                 <input name="gpaRanking" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-gd-primary outline-none transition" 
                   placeholder="大一可填「未知」" value={formData.gpaRanking} onChange={handleChange} />
              </div>
            </div>
            <div className="mt-6">
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">英语水平</label>
                 <input name="englishScore" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-gd-primary outline-none transition" 
                   placeholder="大一可填「高考英语成绩」或「暂无」" value={formData.englishScore} onChange={handleChange} />
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-gd-primary flex items-center justify-center font-bold mr-3">3</div>
              <h3 className="text-lg font-bold text-gray-800">软背景与目标</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">竞赛与科研 (大一/大二可不填)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <textarea name="competitions" rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-gd-primary outline-none transition resize-none" 
                    placeholder="请输入您的核心获奖经历..." value={formData.competitions} onChange={handleChange} />
                  <textarea name="research" rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-gd-primary outline-none transition resize-none" 
                    placeholder="请输入您的科研或论文发表情况..." value={formData.research} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">咨询重点</label>
                <textarea required name="targetFocus" rows={3} className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/30 focus:border-gd-primary outline-none transition text-gray-800 font-medium resize-none" 
                  placeholder="💡 请告诉我们您最想了解的保研问题（如：能否冲刺复旦？跨保金融难度？）..." value={formData.targetFocus} onChange={handleChange} />
              </div>
            </div>
          </section>

          <button type="submit" disabled={isLoading}
            className={`w-full py-5 rounded-xl font-bold text-lg text-white shadow-xl shadow-emerald-600/20 transition-all transform hover:-translate-y-1 active:scale-95 ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-premium-gradient hover:shadow-2xl'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在调用大模型生成定制报告（约需10s）...
              </span>
            ) : (
              '立即生成规划报告'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputForm;