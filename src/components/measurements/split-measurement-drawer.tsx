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
 * The first split pre-fills with the remainder (report − other splits) until the
 * user edits it for that token. After that it's a manual value like any other.
 * Splits never have to add up to the report — the Δ column surfaces the difference.
 */
function getCellValue(
	splits: SplitDef[],
	values: SplitValues,
	tokenKey: string,
	parentVal: number,
	splitId: string,
): { value: number; isAuto: boolean } {
	const manual = values[splitId]?.[tokenKey];
	if (splitId === splits[0]?.id && manual === undefined) {
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
): number {
	const sum = splits.reduce(
		(acc, s) => acc + getCellValue(splits, values, tokenKey, parentVal, s.id).value,
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

/* ── Variance chip (Δ vs report) ── */
function VarianceChip({ variance, rowSum, parentVal }: { variance: number; rowSum: number; parentVal: number }) {
	if (Math.abs(variance) < 0.005) return null;
	return (
		<span
			role="status"
			aria-label={`Splits total ${fmtNum(rowSum)}, report says ${fmtNum(parentVal)} — ${variance > 0 ? 'over' : 'under'} by ${fmtNum(Math.abs(variance))}`}
			title={`Splits total ${fmtNum(rowSum)} — report says ${fmtNum(parentVal)}. Site values are kept as entered.`}
			className="inline-flex items-center rounded border border-[#fde68a] bg-[#fffbeb] px-1 py-0.5 text-[10px] font-semibold tabular-nums text-[#b45309] cursor-default select-none">
			{variance > 0 ? `+${fmtNum(variance)}` : fmtNum(variance)}
		</span>
	);
}

/* ── Category group ── */
function CategoryGroup({
	category, splits, values, searchQuery, hideZero, skippedTokens, onManualChange, onResetRow, onToggleSkip,
}: {
	category: TokenCategory;
	splits: SplitDef[];
	values: SplitValues;
	searchQuery: string;
	hideZero: boolean;
	skippedTokens: Set<string>;
	onManualChange: (splitId: string, tokenKey: string, val: number) => void;
	onResetRow: (tokenKey: string) => void;
	onToggleSkip: (tokenKey: string) => void;
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
	const colTemplate = `minmax(120px, 1.4fr) 60px ${splitCols} 64px`;

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
								title={idx === 0 ? 'Pre-fills the remainder until you edit it' : undefined}>
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
						const isSkipped = skippedTokens.has(token.key);
						const variance = isSkipped ? 0 : getRowVariance(splits, values, token.key, parentVal);
						const rowSum = round2(parentVal + variance);
						const isRowDirty = splits.some((s) => values[s.id]?.[token.key] !== undefined);

						return (
							<div key={token.key}
								className={`group/row grid items-center gap-x-3 px-5 py-[6px] border-b border-[#f1f5f9] last:border-b-0 transition-colors duration-100 ${isSkipped ? 'bg-[#fafbfc]' : 'hover:bg-[#fafbfc]'}`}
								style={{ gridTemplateColumns: colTemplate }}>
								<span className="flex items-center gap-1.5 min-w-0">
									<span className={`text-[12px] leading-snug truncate ${isSkipped ? 'text-[#94a3b8]' : 'text-[#334155]'}`} title={token.label}>
										{token.label}
									</span>
									{isSkipped ? (
										<button type="button" onClick={() => onToggleSkip(token.key)}
											className="shrink-0 flex items-center justify-center size-[18px] rounded text-[#94a3b8] opacity-0 group-hover/row:opacity-100 transition-opacity duration-150 cursor-pointer hover:text-[#3b82f6] hover:bg-[#eff6ff]"
											title="Undo skip">
											<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
												<polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
											</svg>
										</button>
									) : (
										<button type="button" onClick={() => onToggleSkip(token.key)}
											className="shrink-0 text-[10px] font-medium text-[#94a3b8] opacity-0 group-hover/row:opacity-100 transition-opacity duration-150 cursor-pointer hover:text-[#64748b] hover:underline">
											Skip
										</button>
									)}
								</span>
								<span className={`text-[12px] text-right tabular-nums font-medium ${isSkipped ? 'text-[#cbd5e1]' : 'text-[#94a3b8]'}`}>
									{parentVal.toLocaleString()}
								</span>

								{isSkipped ? (
									splits.map((s) => (
										<span key={s.id}
											className="h-[30px] w-full rounded-md px-2 flex items-center justify-end text-[12px] font-medium select-none text-[#cbd5e1]">
											—
										</span>
									))
								) : (
									splits.map((s) => {
										const cell = getCellValue(splits, values, token.key, parentVal, s.id);
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
									})
								)}

								<span className="flex items-center justify-end gap-1">
									{!isSkipped && isRowDirty && (
										<button type="button" onClick={() => onResetRow(token.key)}
											className="flex items-center justify-center size-[18px] rounded text-[#94a3b8] opacity-0 group-hover/row:opacity-100 transition-opacity duration-150 cursor-pointer hover:text-[#3b82f6] hover:bg-[#eff6ff]"
											title="Reset row to report values">
											<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
												<polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
											</svg>
										</button>
									)}
									{!isSkipped && <VarianceChip variance={variance} rowSum={rowSum} parentVal={parentVal} />}
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
	const colTemplate = `minmax(120px, 1.4fr) 60px ${splitCols} 64px`;

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

const SPLIT_COLORS = ['#4F46E5', '#E18026', '#0891B2', '#28A138'];

/* ── Main drawer ── */
export function SplitMeasurementDrawer({ isOpen, onClose, onGenerate }: SplitMeasurementDrawerProps) {
	const [splits, setSplits] = useState<SplitDef[]>([
		{ id: 'split-1', name: 'Split 1', color: SPLIT_COLORS[0] },
		{ id: 'split-2', name: 'Split 2', color: SPLIT_COLORS[1] },
	]);
	const [values, setValues] = useState<SplitValues>({});
	const [independentValues, setIndependentValues] = useState<SplitValues>({});
	const [skippedTokens, setSkippedTokens] = useState<Set<string>>(new Set());
	const [searchQuery, setSearchQuery] = useState('');
	const [hideZeroValues, setHideZeroValues] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!isOpen) {
			setSplits([
				{ id: 'split-1', name: 'Split 1', color: SPLIT_COLORS[0] },
				{ id: 'split-2', name: 'Split 2', color: SPLIT_COLORS[1] },
			]);
			setValues({});
			setIndependentValues({});
			setSkippedTokens(new Set());
			setSearchQuery('');
			setHideZeroValues(true);
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

	const toggleSkip = useCallback((tokenKey: string) => {
		setSkippedTokens((prev) => {
			const next = new Set(prev);
			if (next.has(tokenKey)) next.delete(tokenKey);
			else next.add(tokenKey);
			return next;
		});
	}, []);

	const splittableTokens = useMemo(() => TOKEN_DEFINITIONS.filter(t => t.classification === 'splittable'), []);

	const handleManualChange = useCallback((splitId: string, tokenKey: string, val: number) => {
		setValues((prev) => ({
			...prev,
			[splitId]: { ...(prev[splitId] ?? {}), [tokenKey]: val },
		}));
	}, []);

	const handleResetRow = useCallback((tokenKey: string) => {
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
			if (skippedTokens.has(token.key)) return;
			const parentVal = parentVals[token.key] ?? 0;
			const variance = getRowVariance(splits, values, token.key, parentVal);
			if (Math.abs(variance) >= 0.005) count++;
		});
		return { count };
	}, [splits, values, splittableTokens, skippedTokens]);

	const handleIndependentChange = useCallback((splitId: string, tokenKey: string, val: number) => {
		setIndependentValues((prev) => ({
			...prev,
			[splitId]: { ...(prev[splitId] ?? {}), [tokenKey]: val },
		}));
	}, []);

	const hasAnyValues = useMemo(() =>
		Object.values(values).some((sv) => Object.values(sv).some((v) => v > 0))
		|| Object.values(independentValues).some((sv) => Object.values(sv).some((v) => v > 0)),
	[values, independentValues]);

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
				if (skippedTokens.has(token.key)) {
					allocations[token.key] = parentVal;
					return;
				}
				allocations[token.key] = getCellValue(splits, values, token.key, parentVal, split.id).value;
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
	}, [hasDuplicateNames, splits, values, independentValues, skippedTokens, splittableTokens, independentTokens, fixedTokens, onGenerate, onClose]);

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
								<span className="font-medium text-[#475569]">Split 1 pre-fills the remainder</span> — every value stays editable, and totals can differ from the report.
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

				{/* Split chips */}
				<div className="shrink-0 border-b border-[#e5e7eb] px-6 py-3.5 bg-[#fafbfc]">
					<div className="flex items-center gap-2.5 flex-wrap">
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
							skippedTokens={skippedTokens}
							onManualChange={handleManualChange}
							onResetRow={handleResetRow}
							onToggleSkip={toggleSkip}
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
									Enter site values — Split 1 pre-fills the remainder until you edit it
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
									All splits match the report
								</span>
							)}
						</div>
						<div className="flex items-center gap-2.5">
							{hasAnyValues && (
								<button type="button" onClick={() => { setValues({}); setIndependentValues({}); setSkippedTokens(new Set()); }}
									className="h-[36px] rounded-md px-3.5 text-[12px] font-medium text-[#94a3b8] transition-all duration-150 hover:text-[#ef4444] hover:bg-[#fef2f2] active:scale-[0.98]"
									title="Reset all values">
									Reset
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
