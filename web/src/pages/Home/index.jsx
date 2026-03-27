/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Input,
  ScrollList,
  ScrollItem,
} from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconPlay,
  IconFile,
  IconCopy,
  IconHistory,
  IconKanban,
  IconCloudStroked,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';

const { Text } = Typography;

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const isChinese = i18n.language.startsWith('zh');

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  return (
    <div className='w-full overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='w-full min-h-[calc(100vh-64px)] bg-[#0B0F19] text-white flex items-center justify-center p-6 lg:p-12 overflow-x-hidden relative'>
          {/* 背景模糊晕染球 */}
          <div className='blur-ball blur-ball-indigo opacity-20' style={{top: '10%', left: '20%'}} />
          <div className='blur-ball blur-ball-teal opacity-10' style={{bottom: '10%', right: '20%'}} />
          
          <div className='max-w-7xl w-full flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-12 lg:gap-20 z-10'>
            {/* 左侧内容区 */}
            <div className='flex-1 flex flex-col items-start'>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-900/30 text-blue-400 text-sm mb-6 border border-blue-800/50 font-medium">
                {t('面向企业的 AI 生产力基座')}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.2] mb-6 tracking-tight">
                {t('统一的大模型接口网关')}
                <br />
                {t('链接全球')} <span className="text-yellow-500">{t('AI 能力')}</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
                {t('以一套域名、密钥与风控策略连接全球大模型资源，保障可观测、可拓展、可控。')}
              </p>

              {/* URL 模拟框 */}
              <div className="bg-[#1A1E27] border border-[#2A2E37] rounded-2xl p-5 mb-10 w-full max-w-xl shadow-2xl">
                <div className="text-gray-400 text-sm mb-3 ml-1 font-medium">
                  {t('替换基础 URL 即可接入')}
                </div>
                <div className="flex items-center bg-[#13161C] rounded-xl p-3 border border-gray-800/50">
                  <div className="flex-1 text-gray-300 overflow-hidden text-ellipsis whitespace-nowrap pl-2 font-mono text-sm">
                    {serverAddress}
                  </div>
                  <div className="text-blue-400 px-3 font-mono text-sm flex items-center">
                    <ScrollList
                      bodyHeight={20}
                      style={{ border: 'unset', boxShadow: 'unset', background: 'transparent' }}
                    >
                      <ScrollItem
                        mode='wheel'
                        cycled={true}
                        list={endpointItems}
                        selectedIndex={endpointIndex}
                        onSelect={({ index }) => setEndpointIndex(index)}
                      />
                    </ScrollList>
                  </div>
                  <Button icon={<IconCopy />} theme="borderless" style={{color: '#6B7280'}} onClick={handleCopyBaseURL} />
                </div>
              </div>

              {/* 操作按钮组 */}
              <div className="flex flex-row gap-4 mb-16 w-full sm:w-auto">
                <Link to='/console' className="w-full sm:w-auto">
                  <Button
                    theme='solid'
                    type='primary'
                    size="large"
                    className='!rounded-xl px-8 w-full sm:w-auto !h-12 text-base font-medium shadow-lg shadow-blue-500/20'
                    icon={<IconPlay />}
                  >
                    {t('获取密钥')}
                  </Button>
                </Link>
                {docsLink && (
                  <Button
                    size="large"
                    className='!rounded-xl px-8 w-full sm:w-auto !h-12 text-base font-medium !bg-[#1A1E27] hover:!bg-[#2A2E37] !text-white !border-[#2A2E37]'
                    icon={<IconFile />}
                    onClick={() => window.open(docsLink, '_blank')}
                  >
                    {t('文档')}
                  </Button>
                )}
              </div>

              {/* 底部数据状态 */}
              <div className="flex flex-row flex-wrap gap-4 md:gap-6 w-full">
                <div className="flex flex-col bg-[#1A1E27]/80 rounded-2xl p-5 border border-[#2A2E37]/50 flex-1 min-w-[140px]">
                  <div className="text-3xl font-bold text-white mb-2 tracking-tight">30+</div>
                  <div className="text-gray-400 text-xs md:text-sm font-medium">{t('可覆盖模型')}</div>
                </div>
                <div className="flex flex-col bg-[#1A1E27]/80 rounded-2xl p-5 border border-[#2A2E37]/50 flex-1 min-w-[140px]">
                  <div className="text-3xl font-bold text-white mb-2 tracking-tight">99.9%</div>
                  <div className="text-gray-400 text-xs md:text-sm font-medium">SLA {t('可用性')}</div>
                </div>
                <div className="flex flex-col bg-[#1A1E27]/80 rounded-2xl p-5 border border-[#2A2E37]/50 flex-1 min-w-[140px]">
                  <div className="text-3xl font-bold text-white mb-2 tracking-tight">7</div>
                  <div className="text-gray-400 text-xs md:text-sm font-medium">{t('多区域节点')}</div>
                </div>
              </div>
            </div>

            {/* 右侧卡片区 */}
            <div className="w-full lg:w-[460px] flex-shrink-0 flex flex-col gap-4 bg-[#12161F]/50 p-6 lg:p-8 rounded-[2rem] border border-[#2A2E37]/50 shadow-2xl backdrop-blur-sm">
              <div className="bg-[#1A1E27] border border-[#2A2E37] p-6 rounded-2xl hover:border-blue-500/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                    <IconHistory size="large" />
                  </div>
                  <div className="text-lg font-semibold text-white">{t('实时调度')}</div>
                </div>
                <div className="text-gray-400 text-sm leading-relaxed ml-14">
                  {t('健康度与延迟权重动态切换，保证最优响应。')}
                </div>
              </div>

              <div className="bg-[#1A1E27] border border-[#2A2E37] p-6 rounded-2xl hover:border-indigo-500/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                    <IconKanban size="large" />
                  </div>
                  <div className="text-lg font-semibold text-white">{t('统一监控')}</div>
                </div>
                <div className="text-gray-400 text-sm leading-relaxed ml-14">
                  {t('调用、费用、异常一站式可视化，随时掌握运行状态。')}
                </div>
              </div>

              <div className="bg-[#1A1E27] border border-[#2A2E37] p-6 rounded-2xl hover:border-purple-500/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                    <IconCloudStroked size="large" />
                  </div>
                  <div className="text-lg font-semibold text-white">{t('智能限流')}</div>
                </div>
                <div className="text-gray-400 text-sm leading-relaxed ml-14">
                  {t('多维策略保障核心业务优先级，避免突发拥堵。')}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
