'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	TOKEN_DEFINITIONS,
	CATEGORIES,
	parentMeasurement,
	generateChildCards,
} from '@/lib/mock-data';
import type { MeasurementCard, SplitScope, TokenCategory } from '@/lib/types';

interface SplitMeasurementDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	onGenerate: (childCards: MeasurementCard[]) => void;
}

interface SplitDef {
	id: string;
	name: string;
	color: string;
}

type SplitValues = Record<string, Record<string, number>>;

const round2 = (n: number) => Math.round(n * 100) / 100;
const fmtNum = (n: number) =>
	round2(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

/*
 * Cell model — "pre-fill, don't lock":
 * With pre-fill on, the first split shows the remainder (report − other splits)
 * until the user edits it for that token. After that it's a manual value like any
 * other. With pre-fill off, every cell starts empty and only ever shows what was
 * typed — no column moves when you type in another.
 * Splits never have to add up to the report — the Diff column surfaces the gap.
 */
function getCellValue(
	splits: SplitDef[],
	values: SplitValues,
	tokenKey: string,
	parentVal: number,
	splitId: string,
	prefillEnabled: boolean,
): { value: number; isAuto: boolean } {
	const manual = values[splitId]?.[tokenKey];
	if (prefillEnabled && splitId === splits[0]?.id && manual === undefined) {
		const othersSum = splits
			.slice(1)
			.reduce((sum, s) => sum + (values[s.id]?.[tokenKey] ?? 0), 0);
		return { value: Math.max(0, round2(parentVal - othersSum)), isAuto: true };
	}
	return { value: manual ?? 0, isAuto: false };
}

function getRowVariance(
	splits: SplitDef[],
	values: SplitValues,
	tokenKey: string,
	parentVal: number,
	prefillEnabled: boolean,
): number {
	const sum = splits.reduce(
		(acc, s) => acc + getCellValue(splits, values, tokenKey, parentVal, s.id, prefillEnabled).value,
		0,
	);
	return round2(sum - parentVal);
}

/* ── Inline split name input ── */
function SplitNameInput({
	value, color, onChange,
}: {
	value: string;
	color: string;
	onChange: (name: string) => void;
}) {
	const [draft, setDraft] = useState(value);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => { setDraft(value); }, [value]);

	const commit = () => {
		const trimmed = draft.trim();
		if (trimmed && trimmed !== value) onChange(trimmed);
		else setDraft(value);
	};

	return (
		<div className="flex items-center gap-2">
			<span className="size-[8px] rounded-full shrink-0" style={{ backgroundColor: color }} />
			<input
				ref={inputRef}
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				onBlur={commit}
				onKeyDown={(e) => { if (e.key === 'Enter') { commit(); inputRef.current?.blur(); } if (e.key === 'Escape') { setDraft(value); inputRef.current?.blur(); } }}
				maxLength={30}
				className="h-[28px] w-[120px] bg-transparent px-1 text-[13px] font-medium text-[#334155] outline-none placeholder:text-[#cbd5e1]"
				placeholder="Split name..."
			/>
		</div>
	);
}

/* ── Variance chip (diff vs report, in words) ── */
function VarianceChip({ variance, rowSum, parentVal }: { variance: number; rowSum: number; parentVal: number }) {
	if (Math.abs(variance) < 0.005) return null;
	const direction = variance > 0 ? 'Over' : 'Under';
	const magnitude = fmtNum(Math.abs(variance));
	return (
		<span
			role="status"
			aria-label={`Splits total ${fmtNum(rowSum)}, report says ${fmtNum(parentVal)} — ${direction.toLowerCase()} by ${magnitude}`}
			title={`Splits total ${fmtNum(rowSum)} — report says ${fmtNum(parentVal)}. Site values are kept as entered.`}
			className="inline-flex items-center gap-1 whitespace-nowrap rounded border border-[#fde68a] bg-[#fffbeb] px-1.5 py-0.5 text-[10px] font-semibold text-[#b45309] cursor-default select-none">
			{direction} by
			<span className="tabular-nums">{magnitude}</span>
		</span>
	);
}

/* ── Category group ── */
function CategoryGroup({
	category, splits, values, searchQuery, hideZero, prefillEnabled, onManualChange, onClearRow,
}: {
	category: TokenCategory;
	splits: SplitDef[];
	values: SplitValues;
	searchQuery: string;
	hideZero: boolean;
	prefillEnabled: boolean;
	onManualChange: (splitId: string, tokenKey: string, val: number) => void;
	onClearRow: (tokenKey: string) => void;
}) {
	const [isOpen, setIsOpen] = useState(true);
	const parentValues = parentMeasurement.token_values;
	const tokens = useMemo(() => TOKEN_DEFINITIONS.filter((t) => t.category === category && t.classification === 'splittable'), [category]);
	const filtered = useMemo(() => {
		let result = tokens;
		if (hideZero) {
			result = result.filter((t) => (parentValues[t.key] ?? 0) > 0);
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = result.filter((t) => t.label.toLowerCase().includes(q));
		}
		return result;
	}, [tokens, searchQuery, hideZero, parentValues]);

	if (filtered.length === 0) return null;

	const splitCols = splits.map(() => 'minmax(80px, 1fr)').join(' ');
	const colTemplate = `minmax(120px, 1.4fr) 60px ${splitCols} 100px`;

	return (
		<div className="border-b border-[#e5e7eb] last:border-b-0">
			<button type="button" onClick={() => setIsOpen((p) => !p)}
				className="flex w-full items-center gap-2 px-5 py-2.5 text-left transition-colors duration-150 hover:bg-[#f8fafc] cursor-pointer">
				<span className="text-[12px] font-semibold text-[#334155] tracking-wide">{category}</span>
				<span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#eff6ff] px-1.5 text-[10px] font-bold text-[#3b82f6]">
					{filtered.length}
				</span>
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none"
					className={`ml-auto shrink-0 transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : ''}`}>
					<path d="M4 6L8 10L12 6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</button>

			{isOpen && (
				<div className="overflow-x-auto">
					<div className="grid items-center gap-x-3 px-5 py-1.5 bg-[#f8fafc] border-y border-[#e5e7eb]"
						style={{ gridTemplateColumns: colTemplate }}>
						<span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Measurement</span>
						<span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest text-right">Report</span>
						{splits.map((s, idx) => (
							<span key={s.id} className="flex items-center justify-end gap-1.5 pr-0.5"
								title={idx === 0 && prefillEnabled ? 'Pre-fills the remainder until you edit it' : undefined}>
								<span className="size-[6px] rounded-full shrink-0" style={{ backgroundColor: s.color }} />
								<span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider truncate">{s.name}</span>
							</span>
						))}
						<span
							className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest text-right cursor-default"
							title="Difference between split totals and the report — informational, never blocking">
							Diff
						</span>
					</div>

					{filtered.map((token) => {
						const parentVal = parentValues[token.key] ?? 0;
						const variance = getRowVariance(splits, values, token.key, parentVal, prefillEnabled);
						const rowSum = round2(parentVal + variance);
						const isRowDirty = splits.some((s) => values[s.id]?.[token.key] !== undefined);

						return (
							<div key={token.key}
								className="group/row grid items-center gap-x-3 px-5 py-[6px] border-b border-[#f1f5f9] last:border-b-0 transition-colors duration-100 hover:bg-[#fafbfc]"
								style={{ gridTemplateColumns: colTemplate }}>
								<span className="flex items-center gap-1.5 min-w-0">
									<span className="text-[12px] leading-snug truncate text-[#334155]" title={token.label}>
										{token.label}
									</span>
									{/* Only offer Clear on rows that actually hold an entered value */}
									{isRowDirty && (
										<button type="button" onClick={() => onClearRow(token.key)}
											className="shrink-0 text-[10px] font-medium text-[#94a3b8] opacity-0 group-hover/row:opacity-100 transition-opacity duration-150 cursor-pointer hover:text-[#64748b] hover:underline"
											title="Clear the values entered on this row">
											Clear
										</button>
									)}
								</span>
								<span className="text-[12px] text-right tabular-nums font-medium text-[#94a3b8]">
									{parentVal.toLocaleString()}
								</span>

								{splits.map((s) => {
									const cell = getCellValue(splits, values, token.key, parentVal, s.id, prefillEnabled);
									return (
										<input
											key={s.id}
											type="number" step="any" min={0}
											value={cell.isAuto ? cell.value : (cell.value || '')}
											onChange={(e) => {
												const raw = e.target.value;
												onManualChange(s.id, token.key, raw === '' ? 0 : (parseFloat(raw) || 0));
											}}
											placeholder="0"
											aria-label={`${s.name} — ${token.label}${cell.isAuto ? ' (pre-filled with the remainder)' : ''}`}
											title={cell.isAuto ? 'Pre-filled with the remainder — type to override' : undefined}
											className={`h-[30px] w-full rounded-md border px-2 text-[12px] text-right tabular-nums outline-none transition-all duration-150 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15 ${
												cell.isAuto
													? 'border-transparent bg-[#f8fafc] font-medium text-[#64748b] hover:border-[#cbd5e1] focus:bg-white focus:text-[#334155]'
													: 'border-[#e2e8f0] bg-white text-[#334155] hover:border-[#cbd5e1]'
											}`}
										/>
									);
								})}

								{/* Untouched rows have nothing to reconcile — with pre-fill off they'd all
								    read "Under by <full report>", which is noise, not a signal. */}
								<span className="flex items-center justify-end">
									{isRowDirty && <VarianceChip variance={variance} rowSum={rowSum} parentVal={parentVal} />}
								</span>

							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

/* ── Split-specific section (independent tokens like waste factor) ── */
function SplitSpecificSection({
	splits, independentValues, onIndependentChange, searchQuery, hideZero,
}: {
	splits: SplitDef[];
	independentValues: SplitValues;
	onIndependentChange: (splitId: string, tokenKey: string, val: number) => void;
	searchQuery: string;
	hideZero: boolean;
}) {
	const [isOpen, setIsOpen] = useState(true);
	const parentValues = parentMeasurement.token_values;
	const independentTokens = useMemo(() => TOKEN_DEFINITIONS.filter(t => t.classification === 'independent'), []);
	const filtered = useMemo(() => {
		let result = independentTokens;
		if (hideZero) {
			result = result.filter(t => (parentValues[t.key] ?? 0) > 0);
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = result.filter(t => t.label.toLowerCase().includes(q));
		}
		return result;
	}, [independentTokens, searchQuery, hideZero, parentValues]);

	if (filtered.length === 0) return null;

	const splitCols = splits.map(() => 'minmax(80px, 1fr)').join(' ');
	const colTemplate = `minmax(120px, 1.4fr) 60px ${splitCols} 100px`;

	return (
		<div className="border-b border-[#e5e7eb] last:border-b-0">
			<button type="button" onClick={() => setIsOpen((p) => !p)}
				className="flex w-full items-center gap-2 px-5 py-2.5 text-left transition-colors duration-150 hover:bg-[#f8fafc] cursor-pointer">
				<span className="text-[12px] font-semibold text-[#334155] tracking-wide">Split-Specific</span>
				<span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#eff6ff] px-1.5 text-[10px] font-bold text-[#3b82f6]">
					{filtered.length}
				</span>
				<span className="text-[10px] text-[#94a3b8] italic ml-1">Set per split, not divided from total</span>
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none"
					className={`ml-auto shrink-0 transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : ''}`}>
					<path d="M4 6L8 10L12 6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</button>

			{isOpen && (
				<div className="overflow-x-auto">
					<div className="grid items-center gap-x-3 px-5 py-1.5 bg-[#f8fafc] border-y border-[#e5e7eb]"
						style={{ gridTemplateColumns: colTemplate }}>
						<span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Setting</span>
						<span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest text-right">Unit</span>
						{splits.map((s) => (
							<span key={s.id} className="flex items-center justify-end gap-1.5 pr-0.5">
								<span className="size-[6px] rounded-full shrink-0" style={{ backgroundColor: s.color }} />
								<span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider truncate">{s.name}</span>
							</span>
						))}
						<span aria-hidden />
					</div>

					{filtered.map((token) => (
						<div key={token.key}
							className="grid items-center gap-x-3 px-5 py-[6px] border-b border-[#f1f5f9] last:border-b-0 transition-colors duration-100 hover:bg-[#fafbfc]"
							style={{ gridTemplateColumns: colTemplate }}>
							<span className="text-[12px] text-[#334155] leading-snug truncate pr-1" title={token.label}>
								{token.label}
							</span>
							<span className="text-[12px] text-[#94a3b8] text-right tabular-nums font-medium">
								{token.unit}
							</span>
							{splits.map((s) => {
								const val = independentValues[s.id]?.[token.key] ?? 0;
								return (
									<input
										key={s.id}
										type="number" step="any" min={0}
										value={val || ''}
										onChange={(e) => {
											const raw = e.target.value;
											onIndependentChange(s.id, token.key, raw === '' ? 0 : (parseFloat(raw) || 0));
										}}
										placeholder="0"
										aria-label={`${s.name} — ${token.label}`}
										className="h-[30px] w-full rounded-md border border-[#e2e8f0] bg-white px-2 text-[12px] text-right tabular-nums outline-none transition-all duration-150 text-[#334155] hover:border-[#cbd5e1] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15"
									/>
								);
							})}
							<span aria-hidden />
						</div>
					))}
				</div>
			)}
		</div>
	);
}

/* ── Pre-fill remainder toggle ──
 * Locks once splittable values are entered. Flipping mid-entry would silently
 * rewrite what gets saved for the first split on every row not yet typed into —
 * so this is a setup decision, made before entry starts. Reset unlocks it.
 * Uses aria-disabled (not disabled) so the control stays focusable and can
 * still announce why it's locked.
 */
function PrefillToggle({
	enabled, isLocked, splitOneName, onToggle,
}: {
	enabled: boolean;
	isLocked: boolean;
	splitOneName: string;
	onToggle: () => void;
}) {
	const [showTip, setShowTip] = useState(false);

	/* Tooltips describe the action, not the current state — the switch already
	   shows the state. Kept to one or two lines; a tooltip that needs a paragraph
	   is a sign the control is wrong. */
	const lockedReason = `Locked — switching now would rewrite ${splitOneName}. Clear all to unlock.`;
	const tip = isLocked
		? lockedReason
		: enabled
			? 'Turn off to enter every value by hand.'
			: `Turn on to pre-fill ${splitOneName} with the remainder.`;

	return (
		<span
			className="relative mt-[3px] shrink-0"
			onMouseEnter={() => setShowTip(true)}
			onMouseLeave={() => setShowTip(false)}>
			<button
				type="button" role="switch" aria-checked={enabled}
				aria-disabled={isLocked}
				aria-label={isLocked ? `Pre-fill remainder — ${lockedReason}` : 'Pre-fill remainder'}
				onClick={() => { if (!isLocked) onToggle(); }}
				onFocus={() => setShowTip(true)}
				onBlur={() => setShowTip(false)}
				className={`flex h-[32px] items-center gap-2 rounded-md px-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/30 ${
					isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-white'
				}`}>
				<span
					className={`relative flex h-[15px] w-[26px] shrink-0 items-center rounded-full transition-colors duration-200 ease-out ${enabled ? 'bg-[#3b82f6]' : 'bg-[#cbd5e1]'}`}
					aria-hidden>
					<span className={`absolute size-[11px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${enabled ? 'translate-x-[13px]' : 'translate-x-[2px]'}`} />
				</span>
				{isLocked && (
					<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"
						strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
						<rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
					</svg>
				)}
				<span className={`text-[11px] font-medium whitespace-nowrap transition-colors duration-150 ${enabled ? 'text-[#334155]' : 'text-[#94a3b8]'}`}>
					Pre-fill remainder
				</span>
			</button>

			{showTip && (
				<span role="tooltip"
					className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-max max-w-[268px] rounded-lg bg-[#0f172a] px-2.5 py-1.5 text-[11px] leading-[1.5] text-white shadow-lg">
					{tip}
					<span className="absolute bottom-full right-4 -mb-[1px] border-4 border-transparent border-b-[#0f172a]" />
				</span>
			)}
		</span>
	);
}

const SPLIT_COLORS = ['#4F46E5', '#E18026', '#0891B2', '#28A138'];

/* ── Main drawer ── */
export function SplitMeasurementDrawer({ isOpen, onClose, onGenerate }: SplitMeasurementDrawerProps) {
	const [splits, setSplits] = useState<SplitDef[]>([
		{ id: 'split-1', name: 'Split 1', color: SPLIT_COLORS[0] },
		{ id: 'split-2', name: 'Split 2', color: SPLIT_COLORS[1] },
	]);
	const [values, setValues] = useState<SplitValues>({});
	const [independentValues, setIndependentValues] = useState<SplitValues>({});
	const [searchQuery, setSearchQuery] = useState('');
	const [hideZeroValues, setHideZeroValues] = useState(true);
	const [prefillEnabled, setPrefillEnabled] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!isOpen) {
			setSplits([
				{ id: 'split-1', name: 'Split 1', color: SPLIT_COLORS[0] },
				{ id: 'split-2', name: 'Split 2', color: SPLIT_COLORS[1] },
			]);
			setValues({});
			setIndependentValues({});
			setSearchQuery('');
			setHideZeroValues(true);
			setPrefillEnabled(true);
			setError('');
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
		document.addEventListener('keydown', handleEsc);
		return () => document.removeEventListener('keydown', handleEsc);
	}, [isOpen, onClose]);

	const addSplit = useCallback(() => {
		if (splits.length >= 4) return;
		const idx = splits.length + 1;
		setSplits((prev) => [...prev, {
			id: `split-${Date.now()}`,
			name: `Split ${idx}`,
			color: SPLIT_COLORS[prev.length % SPLIT_COLORS.length],
		}]);
	}, [splits.length]);

	const removeSplit = useCallback((id: string) => {
		if (splits.length <= 2) return;
		setSplits((prev) => prev.filter((s) => s.id !== id));
		setValues((v) => { const nv = { ...v }; delete nv[id]; return nv; });
		setIndependentValues((v) => { const nv = { ...v }; delete nv[id]; return nv; });
	}, [splits.length]);

	const setSplitName = useCallback((id: string, newName: string) => {
		setSplits((prev) => prev.map((s) => (
			s.id === id ? { ...s, name: newName } : s
		)));
	}, []);

	const splittableTokens = useMemo(() => TOKEN_DEFINITIONS.filter(t => t.classification === 'splittable'), []);

	const handleManualChange = useCallback((splitId: string, tokenKey: string, val: number) => {
		setValues((prev) => ({
			...prev,
			[splitId]: { ...(prev[splitId] ?? {}), [tokenKey]: val },
		}));
	}, []);

	const handleClearRow = useCallback((tokenKey: string) => {
		setValues((prev) => {
			const next: SplitValues = {};
			Object.entries(prev).forEach(([splitId, tokens]) => {
				const rest = { ...tokens };
				delete rest[tokenKey];
				next[splitId] = rest;
			});
			return next;
		});
	}, []);

	const hasDuplicateNames = useMemo(() => {
		const names = splits.map((s) => s.name);
		return new Set(names).size !== names.length;
	}, [splits]);

	const varianceSummary = useMemo(() => {
		const parentVals = parentMeasurement.token_values;
		let count = 0;
		splittableTokens.forEach((token) => {
			// Mirror the row chip: only rows with an entered value can differ.
			const isRowDirty = splits.some((s) => values[s.id]?.[token.key] !== undefined);
			if (!isRowDirty) return;
			const parentVal = parentVals[token.key] ?? 0;
			const variance = getRowVariance(splits, values, token.key, parentVal, prefillEnabled);
			if (Math.abs(variance) >= 0.005) count++;
		});
		return { count };
	}, [splits, values, splittableTokens, prefillEnabled]);

	const handleIndependentChange = useCallback((splitId: string, tokenKey: string, val: number) => {
		setIndependentValues((prev) => ({
			...prev,
			[splitId]: { ...(prev[splitId] ?? {}), [tokenKey]: val },
		}));
	}, []);

	/* Only splittable entries lock the pre-fill mode — a split-specific value like
	   waste factor is never derived from the remainder, so it has no bearing on it.
	   Clearing a value back to empty unlocks the toggle again. */
	const hasSplitValues = useMemo(() =>
		Object.values(values).some((sv) => Object.values(sv).some((v) => v > 0)),
	[values]);

	const hasAnyValues = useMemo(() =>
		hasSplitValues
		|| Object.values(independentValues).some((sv) => Object.values(sv).some((v) => v > 0)),
	[hasSplitValues, independentValues]);

	const canGenerate = splits.length >= 2 && !hasDuplicateNames;

	const independentTokens = useMemo(() => TOKEN_DEFINITIONS.filter(t => t.classification === 'independent'), []);
	const fixedTokens = useMemo(() => TOKEN_DEFINITIONS.filter(t => t.classification === 'fixed'), []);

	const handleGenerate = useCallback(() => {
		if (hasDuplicateNames) { setError('Each split must have a unique name'); return; }
		setError('');
		const parentValues = parentMeasurement.token_values;
		const finalScopes: SplitScope[] = splits.map((split) => {
			const allocations: Record<string, number> = {};
			splittableTokens.forEach((token) => {
				const parentVal = parentValues[token.key] ?? 0;
				allocations[token.key] = getCellValue(splits, values, token.key, parentVal, split.id, prefillEnabled).value;
			});
			independentTokens.forEach((token) => {
				allocations[token.key] = independentValues[split.id]?.[token.key] ?? 0;
			});
			fixedTokens.forEach((token) => {
				allocations[token.key] = parentValues[token.key] ?? 0;
			});
			return {
				id: split.id,
				name: split.name,
				trade_type: split.name,
				color: split.color,
				allocations,
			};
		});
		onGenerate(generateChildCards(parentMeasurement, finalScopes));
		onClose();
	}, [hasDuplicateNames, splits, values, independentValues, prefillEnabled, splittableTokens, independentTokens, fixedTokens, onGenerate, onClose]);

	if (!isOpen) return null;

	return (
		<>
			<div className="fixed inset-0 z-[100] bg-black/25 backdrop-blur-[2px] transition-opacity duration-200"
				onClick={onClose} aria-hidden />

			<div className="fixed right-0 top-0 z-[101] flex h-full w-full max-w-[780px] flex-col bg-white shadow-[0_0_80px_rgba(0,0,0,0.10)]"
				role="dialog" aria-modal="true" aria-label="Split Measurement">

				{/* Header */}
				<div className="shrink-0 border-b border-[#e5e7eb] px-6 py-5">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-[17px] font-semibold text-[#0f172a] tracking-tight">Split Measurement</h2>
							<p className="text-[12px] text-[#64748b] mt-0.5 leading-relaxed">
								{prefillEnabled ? (
									<>
										<span className="font-medium text-[#475569]">{splits[0]?.name ?? 'Split 1'} pre-fills the remainder</span> — every value stays editable, and totals can differ from the report.
									</>
								) : (
									<>
										<span className="font-medium text-[#475569]">Every value is entered by hand</span> — nothing is pre-filled, and totals can differ from the report.
									</>
								)}
							</p>
						</div>
						<button type="button" onClick={onClose}
							className="flex size-[34px] items-center justify-center rounded-lg text-[#94a3b8] transition-all duration-150 hover:bg-[#f1f5f9] hover:text-[#475569]"
							aria-label="Close">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M18 6L6 18" /><path d="M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				{/* Split chips — chips wrap in their own column so the toggle keeps a fixed slot */}
				<div className="shrink-0 border-b border-[#e5e7eb] px-6 py-3.5 bg-[#fafbfc]">
					<div className="flex items-start justify-between gap-4">
						<div className="flex min-w-0 flex-wrap items-center gap-2.5">
							{splits.map((s) => (
								<div key={s.id}
									className="flex items-center gap-0.5 rounded-lg border border-[#e2e8f0] bg-white pl-2.5 pr-1 py-1 transition-all duration-150 hover:border-[#cbd5e1] hover:shadow-sm focus-within:border-[#3b82f6] focus-within:ring-2 focus-within:ring-[#3b82f6]/15">
									<SplitNameInput
										value={s.name} color={s.color}
										onChange={(n) => setSplitName(s.id, n)}
									/>
									{splits.length > 2 && (
										<button type="button" onClick={() => removeSplit(s.id)}
											className="flex items-center justify-center size-[28px] rounded-md text-[#d4d4d8] transition-all duration-150 hover:bg-[#fef2f2] hover:text-[#ef4444]"
											aria-label={`Remove ${s.name}`}>
											<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
												<path d="M18 6L6 18" /><path d="M6 6l12 12" />
											</svg>
										</button>
									)}
								</div>
							))}
							{splits.length < 4 && (
								<button type="button" onClick={addSplit}
									className="flex items-center gap-1.5 rounded-lg border border-dashed border-[#cbd5e1] px-3 py-[7px] text-[12px] font-medium text-[#94a3b8] transition-all duration-150 hover:border-[#3b82f6] hover:text-[#3b82f6] hover:bg-[#eff6ff]">
									<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
										<path d="M12 5v14" /><path d="M5 12h14" />
									</svg>
									Add split
								</button>
							)}
						</div>

						{/* Pre-fill behaviour lives with split setup, not with the row filters below.
						    Pinned top-right on its own so adding splits never moves it, and so it
						    never lines up beside a chip and reads as a per-split setting. */}
						<PrefillToggle
							enabled={prefillEnabled}
							isLocked={hasSplitValues}
							splitOneName={splits[0]?.name ?? 'Split 1'}
							onToggle={() => setPrefillEnabled((p) => !p)}
						/>
					</div>
					{hasDuplicateNames && (
						<p className="text-[11px] text-[#ef4444] mt-2 flex items-center gap-1">
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
							</svg>
							Each split must have a unique name.
						</p>
					)}
				</div>

				{/* Search + filter toolbar */}
				<div className="shrink-0 border-b border-[#e5e7eb] px-6 py-2.5">
					<div className="flex items-center gap-3">
						<div className="relative flex-1">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
								<circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
							</svg>
							<input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search measurements..."
								className="h-[32px] w-full rounded-md border border-[#e2e8f0] bg-white pl-9 pr-3 text-[12px] text-[#334155] placeholder-[#c4cdd5] outline-none transition-all duration-150 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15"
							/>
						</div>
						<button type="button" onClick={() => setHideZeroValues((p) => !p)}
							className={`flex items-center gap-1.5 h-[32px] rounded-md border px-3 text-[11px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
								hideZeroValues
									? 'border-[#3b82f6]/30 bg-[#eff6ff] text-[#3b82f6]'
									: 'border-[#e2e8f0] bg-white text-[#94a3b8] hover:border-[#cbd5e1] hover:text-[#64748b]'
							}`}>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								{hideZeroValues ? (
									<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
								) : (
									<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M1 1l22 22" /></>
								)}
							</svg>
							{hideZeroValues ? 'With values only' : 'Show all'}
						</button>
					</div>
				</div>

				{/* Table */}
				<div className="flex-1 overflow-y-auto">
					{CATEGORIES.map((cat) => (
						<CategoryGroup
							key={cat} category={cat}
							splits={splits} values={values}
							searchQuery={searchQuery} hideZero={hideZeroValues}
							prefillEnabled={prefillEnabled}
							onManualChange={handleManualChange}
							onClearRow={handleClearRow}
						/>
					))}

					{/* Split-Specific Tokens (independent — not divided from parent total) */}
					{TOKEN_DEFINITIONS.filter(t => t.classification === 'independent').length > 0 && (
						<SplitSpecificSection
							splits={splits}
							independentValues={independentValues}
							onIndependentChange={handleIndependentChange}
							searchQuery={searchQuery} hideZero={hideZeroValues}
						/>
					)}
				</div>

				{/* Footer */}
				<div className="shrink-0 border-t border-[#e5e7eb] px-6 py-3.5 bg-white">
					{error && (
						<p className="text-[12px] text-[#ef4444] font-medium mb-2.5 flex items-center gap-1.5">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
							</svg>
							{error}
						</p>
					)}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							{!hasAnyValues ? (
								<span className="text-[11px] text-[#94a3b8]">
									{prefillEnabled
										? `Enter site values — ${splits[0]?.name ?? 'Split 1'} pre-fills the remainder until you edit it`
										: 'Enter site values for each split — nothing is pre-filled'}
								</span>
							) : varianceSummary.count > 0 ? (
								<span className="text-[11px] text-[#b45309] font-medium flex items-center gap-1.5"
									title="Splits don't have to add up to the report — site values are kept as entered.">
									<span className="size-[6px] rounded-full bg-[#f59e0b] shrink-0" aria-hidden />
									{varianceSummary.count} differ{varianceSummary.count === 1 ? 's' : ''} from report
									<span className="text-[#94a3b8] font-normal">— saved as entered</span>
								</span>
							) : (
								<span className="text-[11px] text-[#16a34a] font-medium flex items-center gap-1">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
										<path d="M20 6L9 17l-5-5" />
									</svg>
									{prefillEnabled ? 'All splits match the report' : 'Every value entered matches the report'}
								</span>
							)}
						</div>
						<div className="flex items-center gap-2.5">
							{hasAnyValues && (
								<button type="button" onClick={() => { setValues({}); setIndependentValues({}); }}
									className="h-[36px] rounded-md px-3.5 text-[12px] font-medium text-[#94a3b8] transition-all duration-150 hover:text-[#ef4444] hover:bg-[#fef2f2] active:scale-[0.98]"
									title="Clear every value entered across all splits">
									Clear all
								</button>
							)}
							<button type="button" onClick={onClose}
								className="h-[36px] rounded-md border border-[#e2e8f0] bg-white px-5 text-[13px] font-medium text-[#475569] transition-all duration-150 hover:bg-[#f8fafc] hover:border-[#cbd5e1] active:scale-[0.98]">
								Cancel
							</button>
							<button type="button" onClick={handleGenerate} disabled={!canGenerate}
								className="h-[36px] rounded-md bg-[#e44a19] px-6 text-[13px] font-semibold text-white transition-all duration-150 hover:bg-[#cc3f14] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm shadow-[#e44a19]/20">
								Create Split
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
