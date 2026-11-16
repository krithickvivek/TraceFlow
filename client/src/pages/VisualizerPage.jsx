/**
 * @file VisualizerPage.jsx
 * @description Main DSA workspace. Single viewport layout that adapts based on
 *              algorithm type. Bar-chart algorithms use the original 20/40/40 split.
 *              Backtracking algorithms use a compact layout: slim header, large
 *              visualization area, and a single-row input + controls bar at the bottom.
 * @module pages/VisualizerPage
 */

import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, Brain } from 'lucide-react';
import { useTrace, ActionTypes } from '../context/TraceContext';
import { useAuth } from '../context/AuthContext';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { algorithms } from '../algorithms';
import { savedAPI } from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Visualizer from '../components/visualizer/Visualizer';
import Controls from '../components/visualizer/Controls';
import ArrayInput from '../components/visualizer/ArrayInput';
import RightPanel, { MobileRightPanel } from '../components/visualizer/RightPanel';
import GridVisualizer from '../components/visualizer/backtracking/GridVisualizer';
import SudokuVisualizer from '../components/visualizer/backtracking/SudokuVisualizer';
import BacktrackingInput from '../components/visualizer/backtracking/BacktrackingInput';
import GraphVisualizer from '../components/visualizer/backtracking/GraphVisualizer';
import SaveModal from '../components/visualizer/SaveModal';

/**
 * Main DSA workspace page.
 * @returns {JSX.Element}
 */
export default function VisualizerPage() {
  const { algorithmSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useTrace();

  const algo = algorithms[state.selectedAlgorithm];
  const algoName = algo?.metadata?.name || 'Bubble Sort';
  const algoCat = algo?.metadata?.category || 'Sorting';
  const algoDesc = algo?.metadata?.description || '';
  const visualizerType = algo?.visualizerType || 'bar';
  const isBacktracking = visualizerType === 'grid' || visualizerType === 'sudoku' || visualizerType === 'graph';

  useEffect(() => {
    if (algorithmSlug && algorithmSlug !== state.selectedAlgorithm && algorithms[algorithmSlug]) {
      dispatch({ type: ActionTypes.SET_ALGORITHM, payload: algorithmSlug });
    }
  }, [algorithmSlug, state.selectedAlgorithm, dispatch]);

  useEffect(() => {
    if (!state.isGenerated && visualizerType === 'bar') {
      dispatch({ type: ActionTypes.GENERATE_STEPS, algorithms });
    }
  }, [state.selectedAlgorithm, state.isGenerated, dispatch, visualizerType]);

  /* ── Auto-generate when coming from History (Revisit) ── */
  const [historyHandled, setHistoryHandled] = useState(false);
  useEffect(() => {
    if (location.state?.fromHistory && !historyHandled && algorithmSlug) {
      setHistoryHandled(true);
      // For bar-chart algorithms, try to restore the saved input array
      if (visualizerType === 'bar' && location.state.inputData) {
        try {
          const arr = JSON.parse(location.state.inputData);
          if (Array.isArray(arr) && arr.length > 0) {
            dispatch({ type: ActionTypes.SET_INPUT_ARRAY, payload: arr });
          }
        } catch { /* ignore parse errors */ }
        dispatch({ type: ActionTypes.GENERATE_STEPS, algorithms });
      }
      // For backtracking, auto-generate with default config
      if (isBacktracking) {
        const config = { type: 'backtracking', slug: algorithmSlug };
        dispatch({ type: ActionTypes.SET_INPUT_CONFIG, payload: config });
        dispatch({ type: ActionTypes.GENERATE_STEPS, algorithms });
      }
    }
  }, [location.state, historyHandled, algorithmSlug, visualizerType, isBacktracking, dispatch]);

  const { isAuthenticated } = useAuth();
  const { markCompleted } = useLocalProgress();

  /* ── Auto-mark algorithm as completed when visualization finishes ── */
  useEffect(() => {
    if (state.status === 'done' && state.selectedAlgorithm && state.steps.length > 0) {
      markCompleted(state.selectedAlgorithm, state.steps.length);
    }
  }, [state.status, state.selectedAlgorithm, state.steps.length, markCompleted]);

  /* ── Save visualization state ── */
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const hasStarted = state.steps.length > 0;
  const isAtEnd = state.currentStep >= state.steps.length - 1 && state.steps.length > 0;
  const [everCompleted, setEverCompleted] = useState(false);

  /* Track if the user ever completed this visualization (persists across play/pause) */
  useEffect(() => {
    if (state.status === 'done' || isAtEnd) {
      setEverCompleted(true);
    }
  }, [state.status, isAtEnd]);

  /* Reset when algorithm changes */
  useEffect(() => {
    setEverCompleted(false);
    setSaveSuccess(false);
  }, [state.selectedAlgorithm]);

  const canSave = hasStarted && everCompleted;

  const handleSave = async ({ notes }) => {
    setSaving(true);
    try {
      await savedAPI.save({
        algorithm_slug: state.selectedAlgorithm,
        algorithm_name: algoName,
        category: algoCat,
        input_data: JSON.stringify(state.inputArray || []),
        total_steps: state.steps.length,
        notes,
        speed_ms: state.speed || 0,
        difficulty: algo?.metadata?.difficulty || '',
      });
      setSaveSuccess(true);
      setShowSaveModal(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {isAuthenticated && <Navbar />}

      {/* Save modal */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
        algorithmName={algoName}
        totalSteps={state.steps.length}
        saving={saving}
      />
      <div className={`${isAuthenticated ? 'h-[calc(100vh-64px)]' : 'h-screen'} flex overflow-hidden bg-tf-bg`}>
        {/* Sidebar */}
        <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-w-0">
        {/* Left column: header + chart + controls/input */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">

          {isBacktracking ? (
            /* ═══ BACKTRACKING LAYOUT: compact header + large viz + inline controls ═══ */
            <>
              {/* Slim header — algorithm name inline with badge + save */}
              <div className="shrink-0 flex items-center gap-3 px-6 py-3 border-b border-[var(--border-subtle)]">
                <h1 className="font-display text-xl md:text-2xl font-bold text-tf-text tracking-tight">
                  {algoName}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[var(--bg-hover)] text-tf-primary text-[10px] font-semibold border border-[var(--border-subtle)] tracking-wide">
                  {algoCat}
                </span>
                <div className="flex-1" />
                {isAuthenticated && (
                  <div className="flex items-center gap-2">
                    {/* Quiz button */}
                    <button
                      onClick={() => everCompleted && navigate(`/quiz/${state.selectedAlgorithm}`, { state: { algorithmName: algoName } })}
                      disabled={!everCompleted}
                      title={!everCompleted ? 'Complete the visualization first' : 'Test your knowledge with a quiz'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                        ${everCompleted
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 cursor-pointer'
                          : 'bg-[var(--bg-surface)] text-tf-muted border border-[var(--border-subtle)] opacity-50 cursor-not-allowed'
                        }`}
                    >
                      <Brain size={13} />
                      Quiz
                    </button>
                    {/* Save button */}
                    <button
                      onClick={() => canSave && setShowSaveModal(true)}
                      disabled={!canSave}
                      title={!hasStarted ? 'Run the visualization first' : !canSave ? 'Complete the visualization to save' : 'Save this visualization'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                        ${saveSuccess
                          ? 'bg-green-500/15 text-green-500 border border-green-500/30'
                          : canSave
                            ? 'bg-tf-blue/10 text-tf-blue border border-tf-blue/30 hover:bg-tf-blue/20 cursor-pointer'
                            : 'bg-[var(--bg-surface)] text-tf-muted border border-[var(--border-subtle)] opacity-50 cursor-not-allowed'
                        }`}
                    >
                      <Bookmark size={13} />
                      {saveSuccess ? 'Saved!' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {/* Large visualization area — distinct background */}
              <div className="flex-1 min-h-0 overflow-hidden px-4 py-2 flex items-center justify-center"
                   style={{ background: 'var(--bg-primary)' }}>
                <div className="w-full h-full">
                  {visualizerType === 'grid' && (
                    <GridVisualizer key={state.selectedAlgorithm} algorithmSlug={state.selectedAlgorithm} />
                  )}
                  {visualizerType === 'sudoku' && (
                    <SudokuVisualizer key={state.selectedAlgorithm} />
                  )}
                  {visualizerType === 'graph' && (
                    <GraphVisualizer key={state.selectedAlgorithm} />
                  )}
                </div>
              </div>

              {/* Bottom bar — elevated surface with clear separation */}
              <div className="shrink-0 px-4 py-2"
                   style={{ background: 'var(--bg-card)', borderTop: '2px solid var(--border-subtle)' }}>
                {visualizerType === 'graph' ? (
                  /* Graph layout: input row + controls, stacked compactly */
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-center overflow-x-auto scrollbar-hide">
                      <BacktrackingInput key={state.selectedAlgorithm} />
                    </div>
                    <div className="border-t border-[var(--border-subtle)] pt-1">
                      <Controls compact />
                    </div>
                  </div>
                ) : (
                  /* Original side-by-side for grid/sudoku */
                  <div className="flex items-center gap-4">
                    <BacktrackingInput key={state.selectedAlgorithm} />
                    <div className="hidden md:block w-px h-14 bg-[var(--border-subtle)]" />
                    <div className="flex-1 min-w-0">
                      <Controls />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ═══ BAR-CHART LAYOUT: flex header + viz (flex-1) + controls ═══ */
            <>
              {/* TOP: Algorithm name + description — shrink to content */}
              <div className="shrink-0 flex flex-col justify-center px-6 py-2 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="font-display text-xl md:text-2xl font-bold text-tf-text tracking-tight">
                    {algoName}
                  </h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[var(--bg-hover)] text-tf-primary text-[10px] font-semibold border border-[var(--border-subtle)] tracking-wide">
                    {algoCat}
                  </span>
                  <div className="flex-1" />
                  {isAuthenticated && (
                    <div className="flex items-center gap-2">
                      {/* Quiz button */}
                      <button
                        onClick={() => everCompleted && navigate(`/quiz/${state.selectedAlgorithm}`, { state: { algorithmName: algoName } })}
                        disabled={!everCompleted}
                        title={!everCompleted ? 'Complete the visualization first' : 'Test your knowledge with a quiz'}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                          ${everCompleted
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 cursor-pointer'
                            : 'bg-[var(--bg-surface)] text-tf-muted border border-[var(--border-subtle)] opacity-50 cursor-not-allowed'
                          }`}
                      >
                        <Brain size={13} />
                        Quiz
                      </button>
                      {/* Save button */}
                      <button
                        onClick={() => canSave && setShowSaveModal(true)}
                        disabled={!canSave}
                        title={!hasStarted ? 'Run the visualization first' : !canSave ? 'Complete the visualization to save' : 'Save this visualization'}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                          ${saveSuccess
                            ? 'bg-green-500/15 text-green-500 border border-green-500/30'
                            : canSave
                              ? 'bg-tf-blue/10 text-tf-blue border border-tf-blue/30 hover:bg-tf-blue/20 cursor-pointer'
                              : 'bg-[var(--bg-surface)] text-tf-muted border border-[var(--border-subtle)] opacity-50 cursor-not-allowed'
                          }`}
                      >
                        <Bookmark size={13} />
                        {saveSuccess ? 'Saved!' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-tf-text2 line-clamp-1 max-w-2xl">
                  {algoDesc}
                </p>
              </div>

              {/* MIDDLE: Visualization — takes all remaining space */}
              <div className="flex-1 min-h-0 overflow-hidden px-4 py-2 flex items-center justify-center"
                   style={{ background: 'var(--bg-primary)' }}>
                <div className="w-full h-full">
                  <Visualizer />
                </div>
              </div>

              {/* BOTTOM: Controls + Input — shrink to content, elevated surface */}
              <div className="shrink-0 flex flex-col justify-center gap-1 px-4 py-2"
                   style={{ background: 'var(--bg-card)', borderTop: '2px solid var(--border-subtle)' }}>
                <ArrayInput />
                <Controls />
              </div>
            </>
          )}

        </main>

        {/* Right tabbed panel — desktop */}
        <RightPanel />

        {/* Right panel — mobile bottom tabs */}
        <MobileRightPanel />
      </div>
    </div>
    </>
  );
}
