import React from 'react';

const PengpaiAd: React.FC = () => {
  return (
    <div className="my-8 bg-gradient-to-r from-gd-dark to-slate-900 rounded-xl overflow-hidden shadow-2xl text-white border border-gd-gold/30">
      <div className="p-6 md:p-8 relative">
        <div className="absolute top-0 right-0 p-2">
            <span className="bg-gd-gold text-gd-dark text-xs font-bold px-2 py-1 rounded">VIP专属</span>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gd-gold mb-2">🚀 高顿去保研·澎湃计划</h3>
            <p className="text-gray-300 mb-4">
              打破信息差，锁定名校Offer！为你的保研之路提供全方位护航。
            </p>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2">
                <i className="fas fa-check-circle text-gd-gold"></i>
                <span>1对1 定制化择校与文书辅导</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-check-circle text-gd-gold"></i>
                <span>独家 985/211 内部导师推荐资源</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-check-circle text-gd-gold"></i>
                <span>科研论文/顶级竞赛全程带队指导</span>
              </li>
            </ul>
          </div>
          <div className="shrink-0">
             <button className="bg-gd-gold hover:bg-yellow-500 text-gd-dark font-bold py-3 px-8 rounded-full transition-colors shadow-lg transform hover:scale-105">
              立即预约 1V1 诊断
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PengpaiAd;