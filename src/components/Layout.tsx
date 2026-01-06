import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          
          <div className="flex items-center select-none">
             <div className="flex items-center h-full">
               <span className="text-3xl font-black tracking-tighter text-[#ff6b00] mr-1" style={{fontFamily: 'Arial, sans-serif'}}>
                 GOLDEN
               </span>
               <span className="text-3xl font-bold text-gray-500 mr-3 tracking-wide" style={{fontFamily: '"Noto Sans SC", sans-serif'}}>
                 高顿
               </span>
               <div className="h-6 w-px bg-gray-300 mx-2"></div>
               <div className="ml-2 relative -top-0.5">
                   <span className="text-3xl text-[#059669] font-bold">去保研</span>
               </div>
             </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <i className="fas fa-shield-alt text-gd-primary"></i>
              <span>官方数据认证</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <i className="fas fa-user-check text-gd-primary"></i>
              <span>名师人工审核</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow relative">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-50/50 to-transparent -z-10 pointer-events-none"></div>
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        {children}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="mb-4 md:mb-0">
             <div className="flex items-center gap-2 mb-2">
               <span className="text-xl font-black text-white tracking-tighter">GOLDEN</span>
               <span className="text-xl font-bold text-gray-400">高顿</span>
               <span className="text-lg text-emerald-500 font-bold ml-1">去保研</span>
             </div>
            <p className="opacity-60">专注大学生保研咨询服务，提供精准定位解决方案。</p>
          </div>
          <div className="text-center md:text-right">
            <p className="mb-1 text-white">咨询热线: 400-820-8888</p>
            <p className="text-xs opacity-50">Copyright © 2024 Gaodun Education Group.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;