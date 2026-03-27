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
        <div className='w-full lg:h-[calc(100vh-64px)] min-h-[calc(100vh-64px)] bg-[#FAFAFA] dark:bg-[#0B0F19] text-gray-900 dark:text-white flex items-center justify-center p-6 lg:p-8 xl:p-12 overflow-x-hidden lg:overflow-hidden relative'>
          {/* 背景模糊晕染球 */}
          <div className='blur-ball blur-ball-indigo opacity-40 dark:opacity-20' style={{ top: '10%', left: '20%' }} />
          <div className='blur-ball blur-ball-teal opacity-20 dark:opacity-10' style={{ bottom: '10%', right: '20%' }} />

          <div className='max-w-7xl w-full flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-10 lg:gap-12 xl:gap-20 z-10'>
            {/* 左侧内容区 */}
            <div className='flex-1 flex flex-col items-start'>
              <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.2] mb-4 xl:mb-6 tracking-tight">
                <span className="shine-text">{t('统一的大模型接口网关')}</span>
                <br />
                <span className="shine-text">{t('链接全球')}</span> <span className="text-blue-600 dark:text-yellow-500 shine-text">{t('AI 能力')}</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-xl mb-6 xl:mb-10 leading-relaxed">
                {t('更好的价格，更好的稳定性。')}
              </p>

              {/* URL 模拟框 */}
              <div className="bg-white dark:bg-[#1A1E27] border-none dark:border-solid border dark:border-[#2A2E37] rounded-3xl p-4 xl:p-5 mb-6 xl:mb-10 w-full max-w-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl">
                <div className="text-gray-400 dark:text-gray-400 text-xs xl:text-sm mb-2 xl:mb-3 ml-2 font-medium">
                  {t('替换基础 URL 即可接入')}
                </div>
                <div className="flex items-center bg-gray-50 dark:bg-[#13161C] rounded-2xl p-2 xl:p-3 border border-gray-100 dark:border-gray-800/50">
                  <div className="flex-1 text-gray-600 dark:text-gray-300 overflow-hidden text-ellipsis whitespace-nowrap pl-2 font-mono text-xs xl:text-sm">
                    {serverAddress}
                  </div>
                  <div className="text-blue-500 dark:text-blue-400 px-3 font-mono text-xs xl:text-sm flex items-center">
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
                  <Button icon={<IconCopy />} theme="borderless" style={{ color: '#9CA3AF' }} onClick={handleCopyBaseURL} />
                </div>
              </div>

              {/* 操作按钮组 */}
              <div className="flex flex-row gap-4 mb-8 xl:mb-16 w-full sm:w-auto">
                <Link to='/console' className="w-full sm:w-auto">
                  <Button
                    theme='solid'
                    type='primary'
                    size="large"
                    className='!rounded-2xl px-6 xl:px-8 w-full sm:w-auto !h-10 xl:!h-12 text-sm xl:text-base font-semibold shadow-lg shadow-blue-500/30'
                    icon={<IconPlay />}
                  >
                    {t('获取密钥')}
                  </Button>
                </Link>
                {docsLink && (
                  <Button
                    size="large"
                    className='!rounded-2xl px-6 xl:px-8 w-full sm:w-auto !h-10 xl:!h-12 text-sm xl:text-base font-semibold !bg-gray-100 dark:!bg-[#1A1E27] hover:!bg-gray-200 dark:hover:!bg-[#2A2E37] !text-blue-600 dark:!text-white border-none dark:!border-solid border border-transparent dark:!border-[#2A2E37]'
                    icon={<IconFile />}
                    onClick={() => window.open(docsLink, '_blank')}
                  >
                    {t('文档')}
                  </Button>
                )}
              </div>

              {/* 底部数据状态 */}
              <div className="flex flex-row flex-wrap gap-3 xl:gap-6 w-full">
                <div className="flex flex-col bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-[#1A1E27]/80 dark:to-[#1A1E27]/80 rounded-2xl p-4 xl:p-5 border border-dashed border-indigo-200 dark:border-solid dark:border-[#2A2E37]/50 flex-1 min-w-[120px] xl:min-w-[140px]">
                  <div className="text-2xl xl:text-3xl font-extrabold text-gray-900 dark:text-white mb-1 xl:mb-2 tracking-tight">30+</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs font-medium">{t('覆盖模型')}</div>
                </div>
                <div className="flex flex-col bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-[#1A1E27]/80 dark:to-[#1A1E27]/80 rounded-2xl p-4 xl:p-5 border border-dashed border-blue-200 dark:border-solid dark:border-[#2A2E37]/50 flex-1 min-w-[120px] xl:min-w-[140px]">
                  <div className="text-2xl xl:text-3xl font-extrabold text-gray-900 dark:text-white mb-1 xl:mb-2 tracking-tight">99.9%</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs font-medium">SLA {t('可用性')}</div>
                </div>
              </div>
            </div>

            {/* 右侧卡片区 */}
            <div className="w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 flex flex-col gap-3 xl:gap-4 bg-white dark:bg-[#12161F]/50 p-5 xl:p-8 rounded-[2.5rem] border-none dark:border-solid border border-transparent dark:border-[#2A2E37]/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-2xl backdrop-blur-sm">
              <div className="bg-white dark:bg-[#1A1E27] border border-gray-100 dark:border-[#2A2E37] p-5 xl:p-6 rounded-3xl hover:border-blue-500/30 transition-all duration-300 group shadow-sm hover:shadow-md dark:shadow-none">
                <div className="flex items-center gap-3 xl:gap-4 mb-2 xl:mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                    <IconHistory size="large" />
                  </div>
                  <div className="text-base xl:text-lg font-bold text-gray-900 dark:text-white">{t('实时查询')}</div>
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs xl:text-sm leading-relaxed ml-13 xl:ml-14">
                  {t('调用记录及消耗一目了然。')}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1A1E27] border border-gray-100 dark:border-[#2A2E37] p-5 xl:p-6 rounded-3xl hover:border-purple-500/30 transition-all duration-300 group shadow-sm hover:shadow-md dark:shadow-none">
                <div className="flex items-center gap-3 xl:gap-4 mb-2 xl:mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 transition-colors">
                    <IconCloudStroked size="large" />
                  </div>
                  <div className="text-base xl:text-lg font-bold text-gray-900 dark:text-white">{t('智能限流')}</div>
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs xl:text-sm leading-relaxed ml-13 xl:ml-14">
                  {t('多维策略保障服务，避免突发拥堵。')}
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
