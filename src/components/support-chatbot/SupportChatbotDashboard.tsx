/**
 * SUPPORT CHATBOT DASHBOARD
 * User-friendly, production-ready SaaS interface
 */

import React from 'react';
import type { ChatbotSection } from './types';
import { useSearch } from '@tanstack/react-router';
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
    <div className="flex min-h-full w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="mx-auto w-full max-w-[1600px] flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
