/**
 * SUPPORT CHATBOT DASHBOARD
 * User-friendly, production-ready SaaS interface
 */

import React from 'react';
import type { ChatbotSection } from './ChatbotSidebar';
import { useSearch } from '@tanstack/react-router';
import { ChatbotCommandBar } from './ChatbotCommandBar';
import { CBOverview } from './screens/CBOverview';
import { CBChatbotManagement } from './screens/CBChatbotManagement';
import { CBLiveChatInbox } from './screens/CBLiveChatInbox';
import { CBBotTraining } from './screens/CBBotTraining';
import { CBAutomationRules } from './screens/CBAutomationRules';
import { CBMultiLanguage } from './screens/CBMultiLanguage';
import { CBAndroidIntegration } from './screens/CBAndroidIntegration';
import { CBAnalyticsLogs } from './screens/CBAnalyticsLogs';

export const SupportChatbotDashboard: React.FC = () => {
  const { section } = useSearch({ from: '/support-chatbot' });
  const activeSection = (section ?? 'overview') as ChatbotSection;

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <CBOverview />;
      case 'chatbots':
        return <CBChatbotManagement />;
      case 'live-chat':
        return <CBLiveChatInbox />;
      case 'training':
        return <CBBotTraining />;
      case 'automation':
        return <CBAutomationRules />;
      case 'languages':
        return <CBMultiLanguage />;
      case 'android':
        return <CBAndroidIntegration />;
      case 'analytics':
        return <CBAnalyticsLogs />;
      default:
        return <CBOverview />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatbotCommandBar />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
