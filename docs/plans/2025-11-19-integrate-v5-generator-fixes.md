# Integration Plan: Paykey Generator V5 Fixes

## Overview

Integrate the fixes from 3 parallel sub-agents that improved materials/lighting, animations, and data visualization in the paykey generator V5.

## Prerequisites

- ✅ Sub-agent 1 completed: Materials & lighting upgrade
- ✅ Sub-agent 2 completed: Animation improvements
- ✅ Sub-agent 3 completed: Real data integration
- ✅ All files compile successfully

## Tasks

### Task 1: Verify all dependencies are installed

**What:** Check that @react-three/postprocessing is installed for Bloom effect
**Steps:**

1. Check package.json for @react-three/postprocessing
2. If missing, run `npm install @react-three/postprocessing`
3. Verify version is compatible (^2.16.0)

**Verification:**

```bash
npm list @react-three/postprocessing
```

**Expected:** Package should be listed with version ^2.16.0

---

### Task 2: Update GeneratorModal to use fixed Scene component

**What:** Ensure GeneratorModal.tsx imports and uses the upgraded Scene with Bloom
**Steps:**

1. Read `/home/keith/nerdcon/web/src/components/generator/v5/GeneratorModal.tsx`
2. Verify it imports Scene from './Scene'
3. Check that Scene is used inside Canvas component
4. Ensure no old Scene imports exist

**Verification:** Read the file and confirm Scene import

**Expected:** Scene component should be properly imported and used

---

### Task 3: Test generator end-to-end with Playwright

**What:** Run the generator through all 3 stages and capture results
**Steps:**

1. Update inspect_generator.js to wait full 15 seconds for all stages
2. Run: `node inspect_generator.js`
3. Check for console errors
4. Verify screenshots show:
   - Waldo stage with glitch→permute→score animations
   - Blake3 stage with real customer/account data
   - Minting stage with real paykey token
5. Check for "Context Lost" errors (indicates WebGL issues)

**Verification:**

```bash
node inspect_generator.js
ls -lh /tmp/generator_*.png
```

**Expected:**

- 3 clean screenshots with no WebGL errors
- Console shows real data (not hardcoded values)
- Total animation time ~13 seconds

---

### Task 4: Verify real data flow

**What:** Confirm real customer data flows through all stages
**Steps:**

1. Inspect Blake3D.tsx to confirm it uses:
   - `data.customerName` (not hardcoded)
   - `data.accountLast4` (not hardcoded)
   - `data.waldoData.correlationScore` (when available)
2. Inspect Minting3D.tsx to confirm it displays:
   - Real paykey token (not '758c519d.02.c16f91')
3. Check that generatorData is passed correctly from state

**Verification:** Read the files and trace data flow

**Expected:** All display values come from props, no hardcoded placeholders

---

### Task 5: Check animation timing consistency

**What:** Verify total animation time is ~13 seconds across all stages
**Steps:**

1. Review animationUtils.ts phases:
   - Waldo: 4 seconds (1.0 + 1.5 + 1.0 + 0.5)
   - Blake3: 5 seconds
   - Minting: 4 seconds
2. Test with stopwatch using Playwright inspection
3. Confirm no setTimeout delays remain

**Verification:** Check AnimationSequence in all stage files

**Expected:** Clean state machine, no setTimeout, ~13s total

---

### Task 6: Verify retro aesthetic consistency

**What:** Ensure all changes maintain retro gaming design language
**Steps:**

1. Check Scene.tsx uses cyan/magenta/gold accent colors
2. Verify Bloom effect settings (intensity 0.8, threshold 0.3)
3. Confirm CyberBackground shader is toned down (not distracting)
4. Check typography remains consistent with app (no modern sans-serif)
5. Verify emissive materials create neon glow effect

**Verification:** Review visual elements in code and screenshots

**Expected:** Retro gaming aesthetic maintained throughout

---

### Task 7: Build and type-check

**What:** Ensure all changes compile without errors
**Steps:**

1. Run `npm run build` in root directory
2. Check for any TypeScript errors in generator files
3. Verify bundle size is reasonable (<2MB for web)

**Verification:**

```bash
npm run build
```

**Expected:** Build succeeds, no errors in v5 generator files

---

### Task 8: Document the changes

**What:** Create a summary document of all improvements
**Steps:**

1. Create `/home/keith/nerdcon/docs/reports/2025-11-19-paykey-generator-v5-final-report.md`
2. Document:
   - Materials/lighting improvements
   - Animation improvements
   - Real data integration
   - Before/after screenshots
   - Performance metrics
3. Include usage instructions

**Verification:** Read the created report

**Expected:** Comprehensive documentation of all changes

---

## Success Criteria

- ✅ All dependencies installed
- ✅ Generator runs through all 3 stages smoothly
- ✅ Real data displayed (no placeholders)
- ✅ Animations are smooth (~13s total)
- ✅ Retro aesthetic maintained
- ✅ No WebGL errors
- ✅ Build succeeds
- ✅ Documented

## Rollback Plan

If integration fails:

1. Revert to v5 original files from git
2. Investigate specific failing component
3. Apply fixes incrementally
