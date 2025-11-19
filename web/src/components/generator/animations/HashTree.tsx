/**
 * Hash Tree Component
 *
 * Visualizes BLAKE3's tree-based parallel hashing with 4 levels.
 * Shows 16 leaf nodes at bottom, hex streams flowing up the tree.
 * Duration: ~2.5 seconds
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/components/ui/utils';
import { randomHexChar } from '@/lib/hash-utils';

interface HashTreeProps {
  onComplete: () => void;
}

/**
 * HashTree Component
 *
 * Tree structure (4 levels, custom visualization tree):
 *              ROOT (Level 0 - 1 node)
 *            /      \
 *          N1        N2 (Level 1 - 2 nodes)
 *         /  \      /  \
 *       N3   N4   N5   N6 (Level 2 - 4 nodes)
 *      /  \ /  \ /  \ /  \
 *    L0 L1 ...       L15 (Level 3 - 16 leaf nodes)
 *
 * Note: This is not a standard binary tree. Level 3 has 16 nodes
 * instead of 8 to better visualize BLAKE3's parallel processing.
 *
 * Animation:
 * - Leaves activate first (bottom up)
 * - Hex characters flow up branches
 * - Multiple branches process in parallel
 * - Root completes last
 */
export const HashTree: React.FC<HashTreeProps> = ({ onComplete }) => {
  const [activeLevel, setActiveLevel] = useState<number>(3); // Start from leaves (level 3)
  const [hexStreams, setHexStreams] = useState<Record<string, string>>({});
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Animate hex streams on active nodes
    const hexInterval = setInterval(() => {
      setHexStreams((prev) => {
        const newStreams = { ...prev };
        // Add hex characters to active level nodes
        // Node counts per level: [1, 2, 4, 16] (custom visualization tree)
        const nodesPerLevel = [1, 2, 4, 16];
        for (let i = 0; i <= 3; i++) {
          if (i >= activeLevel) {
            const nodeCount = nodesPerLevel[i];
            for (let j = 0; j < nodeCount; j++) {
              const nodeId = `L${i}-N${j}`;
              const current = newStreams[nodeId] || '';
              if (current.length < 8) {
                // Max 8 chars per stream
                newStreams[nodeId] = current + randomHexChar();
              }
            }
          }
        }
        return newStreams;
      });
    }, 100);

    // Progress through levels (bottom to top)
    const levelTimers = [
      setTimeout(() => {
        setCompletedLevels((prev) => new Set([...prev, 3]));
        setActiveLevel(2);
      }, 600),
      setTimeout(() => {
        setCompletedLevels((prev) => new Set([...prev, 2]));
        setActiveLevel(1);
      }, 1200),
      setTimeout(() => {
        setCompletedLevels((prev) => new Set([...prev, 1]));
        setActiveLevel(0);
      }, 1800),
      setTimeout(() => {
        setCompletedLevels((prev) => new Set([...prev, 0]));
        onComplete();
      }, 2500),
    ];

    return () => {
      clearInterval(hexInterval);
      levelTimers.forEach(clearTimeout);
    };
  }, [activeLevel, onComplete]);

  // Render tree node
  const renderNode = (level: number, index: number, label: string): React.ReactElement => {
    const nodeId = `L${level}-N${index}`;
    const isActive = level >= activeLevel && !completedLevels.has(level);
    const isComplete = completedLevels.has(level);
    const hexStream = hexStreams[nodeId] || '';

    return (
      <div
        key={nodeId}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded font-mono text-xs transition-all',
          isActive && 'bg-accent/20 border border-accent text-accent animate-pulse',
          isComplete && 'bg-green-500/20 border border-green-400 text-green-400',
          !isActive && !isComplete && 'bg-neutral-800/50 border border-neutral-700 text-neutral-600'
        )}
      >
        <span className="font-pixel">{label}</span>
        {hexStream && <span className="text-[10px] opacity-70">{hexStream}</span>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="font-pixel text-xs text-accent uppercase">BLAKE3 Tree Hashing</span>
      </div>

      {/* Tree visualization */}
      <div className="bg-background-dark rounded-pixel border border-accent/30 p-6 min-h-[400px] overflow-x-auto">
        <div className="font-mono text-xs leading-relaxed space-y-2">
          {/* Level 0: Root */}
          <div className="flex justify-center mb-4">{renderNode(0, 0, 'ROOT')}</div>

          {/* Tree connectors to Level 1 */}
          <div className="flex justify-center text-neutral-600 text-xs mb-2">
            <pre className="text-center">{'         ┌─────────┴─────────┐         '}</pre>
          </div>

          {/* Level 1: 2 nodes */}
          <div className="flex justify-center gap-32 mb-4">
            {renderNode(1, 0, 'N1')}
            {renderNode(1, 1, 'N2')}
          </div>

          {/* Tree connectors to Level 2 */}
          <div className="flex justify-center text-neutral-600 text-xs mb-2">
            <pre className="text-center whitespace-pre">
              {'     ┌────┴────┐                 ┌────┴────┐     '}
            </pre>
          </div>

          {/* Level 2: 4 nodes */}
          <div className="flex justify-center gap-8 mb-4">
            {renderNode(2, 0, 'N3')}
            {renderNode(2, 1, 'N4')}
            {renderNode(2, 2, 'N5')}
            {renderNode(2, 3, 'N6')}
          </div>

          {/* Tree connectors to Level 3 */}
          <div className="flex justify-center text-neutral-600 text-xs mb-2">
            <pre className="text-center whitespace-pre">{'  ┌─┴─┐   ┌─┴─┐   ┌─┴─┐   ┌─┴─┐  '}</pre>
          </div>

          {/* Level 3: 16 leaf nodes (shown in 4 groups of 4) */}
          <div className="flex flex-col gap-2">
            {/* First row of leaves (L0-L7) */}
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="inline-block">
                  {renderNode(3, i, `L${i}`)}
                </div>
              ))}
            </div>
            {/* Second row of leaves (L8-L15) */}
            <div className="flex justify-center gap-2">
              {[8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
                <div key={i} className="inline-block">
                  {renderNode(3, i, `L${i}`)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6 flex items-center justify-between text-xs font-pixel">
          <div className="text-neutral-500">
            Processing Level:{' '}
            {activeLevel === 3 ? 'Leaves' : activeLevel === 0 ? 'Root' : `L${activeLevel}`}
          </div>
          <div className="text-accent">{completedLevels.size}/4 Levels Complete</div>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-neutral-500 font-body">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span>BLAKE3 processes nodes in parallel for maximum throughput</span>
        </div>
      </div>
    </div>
  );
};
