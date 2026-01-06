import React, { useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import Layout from './components/Layout';
import InputForm from './components/InputForm';
import ReportView from './components/ReportView';
import { sendToFeishu } from './services/feishuService';
import { generateReport } from './services/deepseekService';
import { UserFormData, ReportData } from './types';

const App: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [userData, setUserData] = useState<UserFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    setError(null);
    setUserData(data);

    try {
      sendToFeishu(data);
      const report = await generateReport(data);
      setReportData(report);
    } catch (err) {
      setError("系统繁忙或网络异常，请稍后重试。或直接联系客服人工咨询。");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Router>
      <Layout>
        <div className="container mx-auto px-4">
          {!reportData ? (
            <>
              {error && (
                <div className="max-w-3xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 shadow-sm" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
              
              {/* Marketing Grid - Redesigned */}
              <div className="max-w-5xl mx-auto pb-20">
                <div className="text-center mb-10">
                   <h3 className="text-xl font-bold text-gray-800">为什么选择高顿去保研？</h3>
                   <div className="w-12 h-1 bg-gd-primary mx-auto mt-2 rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Card 1 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100 text-center group">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gd-primary group-hover:text-white transition-colors duration-300">
                      <i className="fas fa-database text-2xl text-gd-primary group-hover:text-white"></i>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">百万级真实案例库</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      独家收录全国 180+ 所高校历年保研数据，覆盖 985/211 及双一流核心专业，让定位更精准。
                    </p>
                  </div>
                  
                  {/* Card 2 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100 text-center group">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gd-primary group-hover:text-white transition-colors duration-300">
                      <i className="fas fa-brain text-2xl text-gd-primary group-hover:text-white"></i>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">DeepSeek 双引擎算法</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      基于大语言模型与教育垂直领域算法，深度解析院校偏好，挖掘申请者的隐性竞争力。
                    </p>
                  </div>
                  
                  {/* Card 3 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100 text-center group">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gd-primary group-hover:text-white transition-colors duration-300">
                      <i className="fas fa-user-graduate text-2xl text-gd-primary group-hover:text-white"></i>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">全明星导师团队</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      来自清北复交等顶尖名校的硕博导师团队，提供从文书润色到模拟面试的全程陪伴。
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <ReportView data={reportData} userData={userData!} />
          )}
        </div>
      </Layout>
    </Router>
  );
};

export default App;