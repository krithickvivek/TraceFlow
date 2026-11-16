/**
 * @file RightPanel.jsx
 * @description Tabbed right panel for the visualizer workspace. Contains three
 *              tabs — Info, Code, and Steps — each rendering their respective
 *              content in a compact, scrollable area. Only one tab is visible
 *              at a time. Designed to fit within a single viewport without
 *              scrolling on desktop.
 * @module components/visualizer/RightPanel
 * @exports RightPanel (default)
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Info, Code2, ListOrdered } from 'lucide-react';
import InfoPanel from './InfoPanel';
import PseudoCode from './PseudoCode';
import StepLog from './StepLog';

/**
 * Tab configuration.
 * @type {Array<{id: string, label: string, icon: import('lucide-react').LucideIcon}>}
 */
const TABS = [
  { id: 'info', label: 'Info', icon: Info },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'steps', label: 'Steps', icon: ListOrdered }
];

/**
 * Tabbed right panel that houses InfoPanel, PseudoCode, and StepLog in a
 * compact, single-viewport-friendly layout.
 *
 * @returns {JSX.Element}
 */
export default function RightPanel() {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <aside className="hidden lg:flex flex-col w-96 border-l border-[var(--border-subtle)] bg-[var(--bg-secondary)] h-full overflow-hidden shrink-0">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[var(--border-subtle)] shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 border-none cursor-pointer',
                isActive
                  ? 'bg-tf-blue/15 text-tf-blue'
                  : 'bg-transparent text-tf-text3 hover:text-tf-text1 hover:bg-white/[0.04]'
              ].join(' ')}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content — scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeTab === 'info' && <InfoPanel />}
        {activeTab === 'code' && <PseudoCode />}
        {activeTab === 'steps' && <StepLog />}
      </div>
    </aside>
  );
}

/**
 * Mobile bottom tabs variant — renders as a horizontal tab bar at the bottom
 * of the mobile layout with collapsible content.
 *
 * @returns {JSX.Element}
 */
export function MobileRightPanel() {
  const [activeTab, setActiveTab] = useState(null);

  return (
    <div className="lg:hidden flex flex-col border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      {/* Tab bar */}
      <div className="flex items-center justify-center gap-1 px-2 py-1.5 shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(isActive ? null : tab.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 border-none cursor-pointer',
                isActive
                  ? 'bg-tf-blue/15 text-tf-blue'
                  : 'bg-transparent text-tf-text3 hover:text-tf-text1 hover:bg-white/[0.04]'
              ].join(' ')}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Collapsible content */}
      {activeTab && (
        <div className="max-h-[40vh] overflow-y-auto border-t border-[var(--border-subtle)]">
          {activeTab === 'info' && <InfoPanel />}
          {activeTab === 'code' && <PseudoCode />}
          {activeTab === 'steps' && <StepLog />}
        </div>
      )}
    </div>
  );
}

RightPanel.propTypes = {};
