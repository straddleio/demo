# CustomerCard UI Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance CustomerCard component with improved layout, alignment fixes, and dynamic info mode to display I-codes (information/insight codes) alongside R-codes (risk codes).

**Architecture:** Modify existing React component structure to support 2x3 grid layout for verification modules, add state management for info mode toggle, and refactor watchlist component for tighter inline layout. All changes isolated to web frontend components.

**Tech Stack:** React, TypeScript, Tailwind CSS, Zustand (state management)

---

## Task 1: Align Date of Birth with Email/Address Column

**Files:**
- Modify: `web/src/components/dashboard/CustomerCard.tsx:295-333`

**Step 1: Identify current DOB position**

Current structure has DOB in the compliance profile section (lines 308-315) in a 2-column grid alongside SSN. Need to move DOB to align with Email/Address in the upper section.

**Step 2: Modify the compliance profile and address layout**

Replace lines 266-333 with updated structure that places DOB in the same column as Email and Address:

```tsx
        {/* Phone and Address Row */}
        <div className="pt-2 border-t border-primary/10">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div>
                <p className="text-xs text-neutral-500 font-body mb-0.5">Phone</p>
                <p className="text-xs text-neutral-100 font-body">{customer.phone}</p>
              </div>
              {/* Live Geolocation Indicator */}
              {!geo.loading && !geo.error && geo.city && (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-xs text-neutral-400 font-body">
                    Live: {geo.city}, {geo.countryCode}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {customer.address && (
                <div>
                  <p className="text-xs text-neutral-500 font-body mb-0.5">Address</p>
                  <div className="text-xs text-neutral-100 font-body">
                    <p>{customer.address.address1}{customer.address.address2 ? `, ${customer.address.address2}` : ''}</p>
                    <p>{customer.address.city}, {customer.address.state} {customer.address.zip}</p>
                  </div>
                </div>
              )}
              {customer.compliance_profile?.dob && (
                <div>
                  <p className="text-xs text-neutral-500 font-body mb-0.5">Date of Birth</p>
                  <p className="text-xs text-neutral-100 font-body font-mono">
                    {unmaskedData?.compliance_profile?.dob || customer.compliance_profile.dob}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SSN with Unmask */}
        {customer.compliance_profile?.ssn && (
          <div className="pt-2 border-t border-primary/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs text-neutral-500 font-body mb-0.5">SSN</p>
                <p className="text-xs text-neutral-100 font-body font-mono">
                  {unmaskedData?.compliance_profile?.ssn || `***-**-${customer.compliance_profile.ssn.slice(-4)}`}
                </p>
              </div>
              <button
                onClick={handleUnmask}
                disabled={isUnmasking}
                className={cn(
                  "px-2 py-1 text-xs font-body border rounded-pixel transition-all flex-shrink-0 self-start",
                  unmaskedData
                    ? "border-primary/40 text-primary bg-primary/10 hover:bg-primary/20"
                    : "border-neutral-600 text-neutral-400 hover:border-primary hover:text-primary",
                  isUnmasking && "opacity-50 cursor-not-allowed"
                )}
                title={unmaskedData ? "Hide sensitive data" : "Show unmasked data"}
              >
                {unmaskedData ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>
        )}
```

**Step 3: Test the alignment**

Run: `npm run dev:web`
Expected: Open browser, run `/customer-KYC`, verify DOB appears below Address in right column, aligned with Email column on left

**Step 4: Commit**

```bash
git add web/src/components/dashboard/CustomerCard.tsx
git commit -m "fix: align DOB with email/address column in CustomerCard"
```

---

## Task 2: Tighten Watchlist Source Component Layout

**Files:**
- Modify: `web/src/components/dashboard/AddressWatchlistCard.tsx:54-82`

**Step 1: Refactor match fields and view source to be inline**

Replace the current two-section layout (lines 54-82) with inline layout where "Matched Fields:" label and fields are on one line, and "View Source" button stays inline:

```tsx
                  <div key={idx} className="border border-primary/20 rounded-pixel p-2 bg-background-dark/20">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-body text-neutral-200 flex-shrink-0">{match.list_name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {match.correlation && (
                          <span className="text-xs text-neutral-500 font-mono">
                            {match.correlation}
                          </span>
                        )}
                        {/* View Source links - only rendered when API returns match.urls array */}
                        {match.urls && match.urls.length > 0 && (
                          <div className="flex items-center gap-1">
                            {match.urls.map((url, urlIdx) => (
                              <a
                                key={urlIdx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-body rounded-pixel hover:bg-primary/20 hover:border-primary/50 transition-all whitespace-nowrap"
                              >
                                <span>View Source</span>
                                <span className="text-[10px]">↗</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {match.match_fields && match.match_fields.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-neutral-500 font-body flex-shrink-0">
                          Matched Fields:
                        </span>
                        <div className="flex flex-wrap gap-1 flex-1">
                          {match.match_fields.map((field, fieldIdx) => (
                            <span
                              key={fieldIdx}
                              className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-neutral-300 text-xs font-mono rounded-pixel"
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
```

**Step 2: Test watchlist layout**

Run: `npm run dev:web`
Expected: Run `/customer-KYC`, expand Identity Verification, check watchlist has "Matched Fields:" inline with field badges, "View Source" button stays on single line

**Step 3: Commit**

```bash
git add web/src/components/dashboard/AddressWatchlistCard.tsx
git commit -m "fix: tighten watchlist layout with inline matched fields and view source"
```

---

## Task 3: Update Verification Modules to 2x3 Grid Layout

**Files:**
- Modify: `web/src/components/dashboard/CustomerCard.tsx:335-432`

**Step 1: Restructure verification modules section to use 2x3 grid**

Replace the current vertical space-y-2 layout (line 351) with a grid layout that displays Email/Phone, Reputation/Fraud, Address/KYC in 2 columns, followed by Watchlist as a full-width row:

```tsx
        {/* Verification Modules */}
        <div className="pt-2 border-t border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-neutral-400 font-body">Identity Verification</p>
            <button
              onClick={toggleAllModules}
              className={cn(
                "px-2 py-1 text-xs font-body border rounded-pixel transition-all",
                allExpanded
                  ? "border-primary/40 text-primary bg-primary/10 hover:bg-primary/20"
                  : "border-neutral-600 text-neutral-400 hover:border-primary hover:text-primary"
              )}
            >
              {allExpanded ? 'HIDE' : 'SHOW'}
            </button>
          </div>

          {/* 2x3 Grid: Email/Phone, Reputation/Fraud, Address/KYC */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {modules.map((module) => (
              <div key={module.name} className="border border-primary/20 rounded-pixel bg-background-dark/50">
                {/* Module Header - Clickable */}
                <button
                  onClick={() => module.codes && toggleModule(module.name)}
                  className={cn(
                    'w-full px-3 py-2 flex items-center justify-between text-left transition-colors',
                    module.codes && 'hover:bg-primary/5 cursor-pointer'
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs font-body text-neutral-200 flex-shrink-0">{module.name}</span>
                    {module.correlation && (
                      <span className="text-xs text-primary font-body">• {module.correlation}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={cn(
                      'text-xs font-pixel',
                      module.decision === 'accept' ? 'text-green-500' :
                      module.decision === 'review' ? 'text-gold' : 'text-accent'
                    )}>
                      {getDecisionLabel(module.decision)}
                    </span>
                    {module.codes && (
                      <span className="text-xs text-neutral-500">
                        {isModuleExpanded(module.name) ? '▼' : '▶'}
                      </span>
                    )}
                  </div>
                </button>

                {/* Expanded Section - Scores and R-Codes */}
                {isModuleExpanded(module.name) && (
                  <div className="border-t border-primary/10">
                    {/* Risk Score */}
                    <div className="px-3 py-2 bg-background-dark/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500 font-body">Risk Score</span>
                        <span className={cn('text-sm font-pixel', getRiskColor(module.riskScore))}>
                          {module.riskScore.toFixed(3)}
                        </span>
                      </div>
                    </div>

                    {/* R-Codes (only show risk codes that start with R) */}
                    {module.codes && module.messages && (
                      <div className="px-3 pb-2">
                        <div className="pt-2 space-y-1.5">
                          {module.codes
                            .filter(code => code.startsWith('R')) // Only show R-codes (risk codes)
                            .map((code) => (
                              <div key={code} className="flex gap-2">
                                <span className="text-xs text-accent font-mono flex-shrink-0">{code}</span>
                                <span className="text-xs text-neutral-400 font-body">
                                  {module.messages![code] || 'Risk signal detected'}
                                </span>
                              </div>
                            ))}
                          {module.codes.filter(code => code.startsWith('R')).length === 0 && (
                            <p className="text-xs text-neutral-500 font-body">No risk signals</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* KYC Validation */}
            {customer.review?.kyc && (
              <KYCValidationCard customer={customer} isExpanded={allExpanded} />
            )}
          </div>

          {/* Address Watchlist - Full Width Row */}
          {customer.review?.watch_list && (
            <AddressWatchlistCard customer={customer} isExpanded={allExpanded} />
          )}
        </div>
```

**Step 2: Test grid layout**

Run: `npm run dev:web`
Expected: Run `/customer-KYC`, verify modules display in 2 columns (Email | Phone, Reputation | Fraud, Address | KYC), watchlist appears full-width below

**Step 3: Commit**

```bash
git add web/src/components/dashboard/CustomerCard.tsx
git commit -m "feat: update verification modules to 2x3 grid layout with full-width watchlist"
```

---

## Task 4: Add INFO Button and I-Codes Display Mode

**Files:**
- Modify: `web/src/components/dashboard/CustomerCard.tsx:33-36` (add state)
- Modify: `web/src/components/dashboard/CustomerCard.tsx:335-350` (add INFO button)
- Modify: `web/src/components/dashboard/CustomerCard.tsx:384-417` (add I-codes section)

**Step 4.1: Add state for info mode**

Add new state variable after line 36:

```tsx
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [unmaskedData, setUnmaskedData] = useState<UnmaskedCustomer | null>(null);
  const [isUnmasking, setIsUnmasking] = useState(false);
  const [allExpanded, setAllExpanded] = useState(false);
  const [infoMode, setInfoMode] = useState(false); // NEW: Toggle for I-codes display
  const customer = useDemoStore((state) => state.customer);
```

**Step 4.2: Add toggle function for info mode**

Add new function after line 216:

```tsx
  const toggleAllModules = () => {
    setAllExpanded(!allExpanded);
    setExpandedModule(null);
  };

  // NEW: Toggle info mode
  const toggleInfoMode = () => {
    setInfoMode(!infoMode);
  };

  // Determine if a module should be expanded
  const isModuleExpanded = (moduleName: string) => {
    if (allExpanded) return true;
    return expandedModule === moduleName;
  };
```

**Step 4.3: Update header section to include INFO button**

Modify the verification modules header (lines 337-350) to include INFO button when SHOW is active:

```tsx
        {/* Verification Modules */}
        <div className="pt-2 border-t border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-neutral-400 font-body">Identity Verification</p>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAllModules}
                className={cn(
                  "px-2 py-1 text-xs font-body border rounded-pixel transition-all",
                  allExpanded
                    ? "border-primary/40 text-primary bg-primary/10 hover:bg-primary/20"
                    : "border-neutral-600 text-neutral-400 hover:border-primary hover:text-primary"
                )}
              >
                {allExpanded ? 'HIDE' : 'SHOW'}
              </button>
              {allExpanded && (
                <button
                  onClick={toggleInfoMode}
                  className={cn(
                    "px-2 py-1 text-xs font-body border rounded-pixel transition-all",
                    infoMode
                      ? "border-primary/40 text-primary bg-primary/10 hover:bg-primary/20"
                      : "border-neutral-600 text-neutral-400 hover:border-primary hover:text-primary"
                  )}
                >
                  INFO
                </button>
              )}
            </div>
          </div>
```

**Step 4.4: Update expanded section to display I-codes in info mode**

Modify the expanded section within each module (lines 384-417) to show I-codes when info mode is active:

```tsx
                {/* Expanded Section - Scores and Codes */}
                {isModuleExpanded(module.name) && (
                  <div className="border-t border-primary/10">
                    {/* Risk Score / Insights Header */}
                    <div className="px-3 py-2 bg-background-dark/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500 font-body">
                          {infoMode ? 'Insights' : 'Risk Score'}
                        </span>
                        {!infoMode && (
                          <span className={cn('text-sm font-pixel', getRiskColor(module.riskScore))}>
                            {module.riskScore.toFixed(3)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Codes Display */}
                    {module.codes && module.messages && (
                      <div className="px-3 pb-2">
                        <div className="pt-2 space-y-1.5">
                          {infoMode ? (
                            // I-Codes Mode: Show codes that DON'T start with R
                            module.codes
                              .filter(code => !code.startsWith('R'))
                              .map((code) => (
                                <div key={code} className="flex gap-2">
                                  <span className="text-xs text-primary font-mono flex-shrink-0">{code}</span>
                                  <span className="text-xs text-neutral-400 font-body">
                                    {module.messages![code] || 'Information signal'}
                                  </span>
                                </div>
                              ))
                          ) : (
                            // R-Codes Mode: Show codes that start with R
                            module.codes
                              .filter(code => code.startsWith('R'))
                              .map((code) => (
                                <div key={code} className="flex gap-2">
                                  <span className="text-xs text-accent font-mono flex-shrink-0">{code}</span>
                                  <span className="text-xs text-neutral-400 font-body">
                                    {module.messages![code] || 'Risk signal detected'}
                                  </span>
                                </div>
                              ))
                          )}
                          {/* No codes message */}
                          {(infoMode
                            ? module.codes.filter(code => !code.startsWith('R')).length === 0
                            : module.codes.filter(code => code.startsWith('R')).length === 0
                          ) && (
                            <p className="text-xs text-neutral-500 font-body">
                              {infoMode ? 'No insights' : 'No risk signals'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
```

**Step 4.5: Test INFO mode toggle**

Run: `npm run dev:web`
Expected:
1. Run `/customer-KYC` to create customer with review data
2. Click SHOW button - verify INFO button appears to the right
3. Click INFO button - verify:
   - "Risk Score" header changes to "Insights"
   - Risk score number disappears
   - I-codes (non-R codes) display instead of R-codes
   - If no I-codes exist, displays "No insights"
4. Click INFO again - verify it toggles back to R-codes view

**Step 4.6: Commit**

```bash
git add web/src/components/dashboard/CustomerCard.tsx
git commit -m "feat: add INFO mode to display I-codes alongside risk score in verification modules"
```

---

## Task 5: Type Safety and Final Testing

**Files:**
- Modify: `web/src/components/dashboard/CustomerCard.tsx:16-24` (update interface if needed)

**Step 5.1: Verify TypeScript types**

Run type check to ensure no TypeScript errors:

Run: `npm run type-check`
Expected: No TypeScript errors related to CustomerCard changes

**Step 5.2: Full integration test**

Test all improvements together:

Run: `npm run dev`
Expected:
1. Browser at `localhost:5173`
2. Terminal: `/customer-KYC`
3. Verify all improvements:
   - DOB aligns with Email/Address column
   - Watchlist "Matched Fields" inline with badges
   - "View Source" button stays single line
   - Verification modules in 2x3 grid
   - Watchlist full-width below modules
   - SHOW button expands modules
   - INFO button appears when SHOW is active
   - INFO toggles between R-codes and I-codes
   - "Risk Score" ↔ "Insights" header swap
   - Risk score number persists in R-codes mode, hidden in INFO mode

**Step 5.3: Test with different customer states**

Test edge cases:

```bash
# Terminal commands to test:
/reset
/create-customer --outcome verified
# Verify layout with minimal review data

/reset
/customer-KYC
# Verify layout with full KYC data and watchlist
```

Expected: All layouts work correctly regardless of data completeness

**Step 5.4: Final commit**

```bash
git add .
git commit -m "test: verify all CustomerCard improvements with edge cases"
```

---

## Verification Checklist

- [ ] DOB appears in right column aligned with Email/Address
- [ ] SSN row has SHOW/HIDE button on the right
- [ ] Watchlist "Matched Fields:" label inline with field badges
- [ ] "View Source" button never wraps to multiple lines
- [ ] Verification modules display in 2-column grid
- [ ] Grid shows: Email/Phone, Reputation/Fraud, Address/KYC
- [ ] Watchlist appears full-width below grid
- [ ] INFO button only visible when SHOW is active
- [ ] INFO button positioned to right of SHOW button
- [ ] Clicking INFO swaps "Risk Score" ↔ "Insights" header
- [ ] Risk score number visible only in R-codes mode
- [ ] I-codes display when INFO is active (non-R codes)
- [ ] R-codes display when INFO is inactive (R-prefixed codes)
- [ ] "No insights" displays when no I-codes exist in INFO mode
- [ ] "No risk signals" displays when no R-codes exist in normal mode
- [ ] All functionality works with `/customer-KYC` command
- [ ] TypeScript compilation passes
- [ ] No console errors in browser

---

## Notes

**I-Codes vs R-Codes:**
- R-codes: Risk signals (codes starting with 'R') - displayed by default
- I-codes: Information/Insight signals (all other codes) - displayed in INFO mode

**State Management:**
- `allExpanded`: Controls module expansion (SHOW/HIDE button)
- `infoMode`: Controls I-codes vs R-codes display (INFO button)
- `expandedModule`: Individual module expansion state

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ Name              | Email           │
│ Phone             | Address         │
│                   | Date of Birth   │
│ SSN                        [SHOW]   │
├─────────────────────────────────────┤
│ Identity Verification [SHOW] [INFO] │
│ ┌─────────┬─────────┐              │
│ │ Email   │ Phone   │              │
│ │ Reputa..│ Fraud   │              │
│ │ Address │ KYC     │              │
│ └─────────┴─────────┘              │
│ ┌───────────────────────────────┐  │
│ │ Watchlist (full width)        │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Design Principles:**
- DRY: Reuse existing module rendering logic
- YAGNI: Don't add features beyond requirements
- Responsive: Maintain retro aesthetic and spacing
- Accessible: Keep button interactions clear
