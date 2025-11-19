import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  customerName: string;
  waldoData?: {
    matchedName?: string;
    correlationScore?: number;
  };
  onComplete: () => void;
}

/**
 * WALDO Identity Verification Stage
 *
 * Shows name normalization and bank record matching
 * - Clean, data-focused design
 * - Animated correlation score arc
 * - Professional typography
 */
export const WaldoStage: React.FC<Props> = ({ customerName, waldoData, onComplete }) => {
  const [displayName, setDisplayName] = useState(customerName);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'normalize' | 'match' | 'complete'>('normalize');

  const targetScore = waldoData?.correlationScore || 98;
  const matchedName = waldoData?.matchedName || customerName;

  useEffect(() => {
    const sequence = async (): Promise<void> => {
      // Phase 1: Name normalization (glitch effect)
      await new Promise((resolve) => setTimeout(resolve, 300));
      for (let i = 0; i < 8; i++) {
        setDisplayName(
          customerName
            .split('')
            .map((c) =>
              Math.random() > 0.6 ? String.fromCharCode(65 + Math.floor(Math.random() * 26)) : c
            )
            .join('')
        );
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
      setDisplayName(customerName);
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Phase 2: Bank record matching
      setPhase('match');
      setDisplayName(matchedName);
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Phase 3: Score animation
      const duration = 1500;
      const steps = 60;
      const increment = targetScore / steps;
      for (let i = 0; i <= steps; i++) {
        setScore(Math.min(targetScore, Math.floor(i * increment)));
        await new Promise((resolve) => setTimeout(resolve, duration / steps));
      }
      setScore(targetScore);

      await new Promise((resolve) => setTimeout(resolve, 800));
      setPhase('complete');
      await new Promise((resolve) => setTimeout(resolve, 600));
      onComplete();
    };

    void sequence();
  }, [customerName, matchedName, targetScore, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="w-full max-w-2xl mx-auto px-8"
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-lg font-medium text-slate-400 mb-2">Identity Verification</h2>
        <p className="text-sm text-slate-500">WALDO Bank Record Matching</p>
      </motion.div>

      {/* Name display */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 mb-8 backdrop-blur-sm">
        <div className="text-sm font-medium text-slate-500 mb-3">Customer Identity</div>
        <motion.div
          key={displayName}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-semibold text-white tracking-tight"
        >
          {displayName}
        </motion.div>

        {phase !== 'normalize' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-sm"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Matched with bank records</span>
          </motion.div>
        )}
      </div>

      {/* Score visualization */}
      {phase !== 'normalize' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm font-medium text-slate-500 mb-1">Correlation Score</div>
                <div className="text-xs text-slate-600">Bank account ownership confidence</div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-white">{score}%</div>
                <div className="text-xs text-slate-500 mt-1">
                  {score >= 95
                    ? 'High Confidence'
                    : score >= 80
                      ? 'Medium Confidence'
                      : 'Verification Needed'}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  score >= 95
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : score >= 80
                      ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400'
                }`}
              />
            </div>

            {/* Verification markers */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <VerificationItem label="Name Match" status={score > 0 ? 'verified' : 'pending'} />
              <VerificationItem
                label="Account Validation"
                status={score > 50 ? 'verified' : 'pending'}
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

interface VerificationItemProps {
  label: string;
  status: 'verified' | 'pending';
}

const VerificationItem: React.FC<VerificationItemProps> = ({ label, status }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2"
    >
      {status === 'verified' ? (
        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <div className="w-4 h-4 border-2 border-slate-600 rounded-full" />
      )}
      <span className={`text-sm ${status === 'verified' ? 'text-slate-300' : 'text-slate-600'}`}>
        {label}
      </span>
    </motion.div>
  );
};
