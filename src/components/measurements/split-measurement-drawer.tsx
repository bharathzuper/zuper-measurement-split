'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	TOKEN_DEFINITIONS,
	CATEGORIES,
	TRADE_TYPES,
	TRADE_TYPE_COLORS,
	parentMeasurement,
	generateChildCards,
} from '@/lib/mock-data';
import type { MeasurementCard, SplitScope, TradeType, TokenCategory } from '@/lib/types';

interface SplitMeasurementDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	onGenerate: (childCards: MeasurementCard[]) => void;
}

interface SplitDef {
	id: string;
	trade_type: TradeType;
	color: string;
}

type SplitValues = Record<string, Record<string, number>>;

/* ── Custom dropdown ── */
function MaterialDropdown({
	value, usedTypes, onChange,
}: {
	value: TradeType;
	usedTypes: Set<string>;
	onChange: (t: TradeType) => void;
}) {
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const handleClick = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
		document.addEventListener('keydown', handleEsc);
		return () => document.removeEventListener('keydown', handleEsc);
	}, [open]);

	const color = TRADE_TYPE_COLORS[value] ?? '#94a3b8';

	return (
		<div ref={containerRef} className="relative">
			<button type="button" onClick={() => setOpen((p) => !p)}
				className={`flex items-center gap-2 h-[30px] rounded-md border bg-white pl-2.5 pr-2 text-[12px] font-medium text-[#334155] outline-none transition-all duration-150 cursor-pointer ${
					open ? 'border-[#3b82f6] ring-2 ring-[#3b82f6]/15 shadow-sm'
						: 'border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm'
				}`}>
				<span className="size-[8px] rounded-full shrink-0" style={{ backgroundColor: color }} />
				<span className="truncate max-w-[120px]">{value}</span>
				<svg width="12" height="12" viewBox="0 0 16 16" fill="none"
					className={`shrink-0 text-[#94a3b8] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
					<path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</button>
			{open && (
				<div className="absolute top-full left-0 z-50 mt-1 w-[200px] rounded-lg border border-[#e5e7eb] bg-white py-1 shadow-lg shadow-black/8"
					role="listbox" aria-label="Select material type">
					<div className="max-h-[240px] overflow-y-auto">
						{TRADE_TYPES.map((t) => {
							const isUsed = usedTypes.has(t) && t !== value;
							const isSelected = t === value;
							const tColor = TRADE_TYPE_COLORS[t] ?? '#94a3b8';
							return (
								<button key={t} type="button" role="option" aria-selected={isSelected} disabled={isUsed}
									onClick={() => { onChange(t as TradeType); setOpen(false); }}
									className={`flex w-full items-center gap-2.5 px-3 py-[7px] text-left text-[12px] transition-colors duration-100 ${
										isUsed ? 'text-[#cbd5e1] cursor-not-allowed'
											: isSelected ? 'bg-[#eff6ff] text-[#1e293b] font-medium'
											: 'text-[#334155] hover:bg-[#f8fafc] cursor-pointer'
									}`}>
									<span className="size-[7px] rounded-full shrink-0" style={{ backgroundColor: isUsed ? '#e2e8f0' : tColor }} />
									<span className="truncate">{t}</span>
									{isSelected && (
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto shrink-0">
											<path d="M20 6L9 17l-5-5" />
										</svg>
									)}
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

/* ── Category group ── */
function CategoryGroup({
	category, splits, primaryId, values, searchQuery, hideZero, onManualChange, onAutoFix,
}: {
	category: TokenCategory;
	splits: SplitDef[];
	primaryId: string;
	values: SplitValues;
	searchQuery: string;
	hideZero: boolean;
	onManualChange: (splitId: string, tokenKey: string, val: number) => void;
	onAutoFix: (tokenKey: string) => void;
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
						<span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest text-right">Total</span>
						{splits.map((s) => (
							<span key={s.id} className="flex items-center justify-end gap-1.5 pr-0.5">
								<span className="size-[6px] rounded-full shrink-0" style={{ backgroundColor: s.color }} />
								<span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider truncate">{s.trade_type}</span>
								{s.id === primaryId && (
									<span className="text-[7px] font-bold text-[#3b82f6] bg-[#eff6ff] rounded px-1 py-[1px] uppercase tracking-wider leading-none">Auto</span>
								)}
							</span>
						))}
						<span className="text-[9px] font-semibold text-[#94a3b8] uppercase tracking-widest text-right">Status</span>
					</div>

					{filtered.map((token) => {
						const parentVal = parentValues[token.key] ?? 0;
						const secondarySum = splits
							.filter((s) => s.id !== primaryId)
							.reduce((sum, s) => sum + (values[s.id]?.[token.key] ?? 0), 0);
						const primaryVal = Math.round((parentVal - secondarySum) * 10) / 10;
						const isOver = primaryVal < -0.01;

						return (
							<div key={token.key}
								className="grid items-center gap-x-3 px-5 py-[6px] border-b border-[#f1f5f9] last:border-b-0 transition-colors duration-100 hover:bg-[#fafbfc]"
								style={{ gridTemplateColumns: colTemplate }}>
								<span className="text-[12px] text-[#334155] leading-snug truncate pr-1" title={token.label}>
									{token.label}
								</span>
								<span className="text-[12px] text-[#94a3b8] text-right tabular-nums font-medium">
									{parentVal.toLocaleString()}
								</span>

								{splits.map((s) => {
									if (s.id === primaryId) {
										return (
											<span key={s.id}
												className={`h-[30px] w-full rounded-md px-2 flex items-center justify-end text-[12px] tabular-nums font-medium select-none transition-colors duration-150 ${
													isOver ? 'bg-[#fef2f2] text-[#ef4444]' : 'bg-[#f8fafc] text-[#475569]'
												}`}>
												{primaryVal.toLocaleString()}
											</span>
										);
									}

									const val = values[s.id]?.[token.key] ?? 0;
									return (
										<input
											key={s.id}
											type="number" step="any" min={0}
											value={val || ''}
											onChange={(e) => {
												const raw = e.target.value;
												onManualChange(s.id, token.key, raw === '' ? 0 : (parseFloat(raw) || 0));
											}}
											placeholder="0"
											className={`h-[30px] w-full rounded-md border bg-white px-2 text-[12px] text-right tabular-nums outline-none transition-all duration-150 ${
												isOver
													? 'border-[#fca5a5] text-[#ef4444] focus:border-[#ef4444] focus:ring-2 focus:ring-[#fca5a5]/30'
													: 'border-[#e2e8f0] text-[#334155] hover:border-[#cbd5e1] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15'
											}`}
										/>
									);
								})}

								<span className="flex items-center justify-end pr-0.5">
									{isOver ? (
										<button type="button" onClick={() => onAutoFix(token.key)}
											className="text-[10px] font-semibold text-[#ef4444] tabular-nums cursor-pointer rounded px-1 py-0.5 transition-all duration-150 hover:bg-[#fef2f2] hover:underline decoration-[#ef4444]/40"
											title="Click to auto-fix">
											+{Math.abs(primaryVal).toLocaleString()}
										</button>
									) : (
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 transition-opacity">
											<path d="M20 6L9 17l-5-5" />
										</svg>
									)}
								</span>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

/* ── Material-specific section (independent tokens like waste factor) ── */
function MaterialSpecificSection({
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
	const colTemplate = `minmax(120px, 1.4fr) 60px ${splitCols}`;

	return (
		<div className="border-b border-[#e5e7eb] last:border-b-0">
			<button type="button" onClick={() => setIsOpen((p) => !p)}
				className="flex w-full items-center gap-2 px-5 py-2.5 text-left transition-colors duration-150 hover:bg-[#f8fafc] cursor-pointer">
				<span className="text-[12px] font-semibold text-[#334155] tracking-wide">Material-Specific</span>
				<span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#eff6ff] px-1.5 text-[10px] font-bold text-[#3b82f6]">
					{filtered.length}
				</span>
				<span className="text-[10px] text-[#94a3b8] italic ml-1">Set per material, not split from total</span>
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
								<span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider truncate">{s.trade_type}</span>
							</span>
						))}
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
										className="h-[30px] w-full rounded-md border border-[#e2e8f0] bg-white px-2 text-[12px] text-right tabular-nums outline-none transition-all duration-150 text-[#334155] hover:border-[#cbd5e1] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15"
									/>
								);
							})}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

/* ── Main drawer ── */
export function SplitMeasurementDrawer({ isOpen, onClose, onGenerate }: SplitMeasurementDrawerProps) {
	const [splits, setSplits] = useState<SplitDef[]>([
		{ id: 'split-1', trade_type: 'Asphalt Shingle', color: TRADE_TYPE_COLORS['Asphalt Shingle'] },
		{ id: 'split-2', trade_type: 'Metal', color: TRADE_TYPE_COLORS['Metal'] },
	]);
	const [primaryId, setPrimaryId] = useState('split-1');
	const [values, setValues] = useState<SplitValues>({});
	const [independentValues, setIndependentValues] = useState<SplitValues>({});
	const [searchQuery, setSearchQuery] = useState('');
	const [hideZeroValues, setHideZeroValues] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!isOpen) {
			setSplits([
				{ id: 'split-1', trade_type: 'Asphalt Shingle', color: TRADE_TYPE_COLORS['Asphalt Shingle'] },
				{ id: 'split-2', trade_type: 'Metal', color: TRADE_TYPE_COLORS['Metal'] },
			]);
			setPrimaryId('split-1');
			setValues({});
			setIndependentValues({});
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

	const usedTradeTypes = useMemo(() => new Set(splits.map((s) => s.trade_type)), [splits]);

	const addSplit = useCallback(() => {
		if (splits.length >= 4) return;
		const nextType = (TRADE_TYPES.find((t) => !usedTradeTypes.has(t)) ?? 'Other') as TradeType;
		setSplits((prev) => [...prev, {
			id: `split-${Date.now()}`,
			trade_type: nextType,
			color: TRADE_TYPE_COLORS[nextType] ?? '#94a3b8',
		}]);
	}, [splits.length, usedTradeTypes]);

	const removeSplit = useCallback((id: string) => {
		if (splits.length <= 2) return;
		const remaining = splits.filter((s) => s.id !== id);
		setSplits(remaining);

		if (id === primaryId) {
			const newPrimary = remaining[0].id;
			setPrimaryId(newPrimary);
			setValues((v) => { const nv = { ...v }; delete nv[id]; delete nv[newPrimary]; return nv; });
		} else {
			setValues((v) => { const nv = { ...v }; delete nv[id]; return nv; });
		}
	}, [splits, primaryId]);

	const setTradeType = useCallback((id: string, tt: TradeType) => {
		setSplits((prev) => prev.map((s) => (
			s.id === id ? { ...s, trade_type: tt, color: TRADE_TYPE_COLORS[tt] ?? '#94a3b8' } : s
		)));
	}, []);

	const splittableTokens = useMemo(() => TOKEN_DEFINITIONS.filter(t => t.classification === 'splittable'), []);

	const handleManualChange = useCallback((splitId: string, tokenKey: string, val: number) => {
		setValues((prev) => ({
			...prev,
			[splitId]: { ...(prev[splitId] ?? {}), [tokenKey]: val },
		}));
	}, []);

	const swapPrimary = useCallback((newPrimaryId: string) => {
		if (newPrimaryId === primaryId) return;
		const parentVals = parentMeasurement.token_values;
		const oldPrimaryId = primaryId;
		const secondaries = splits.filter((s) => s.id !== oldPrimaryId);

		setValues((prev) => {
			const next = { ...prev };
			const oldPrimaryVals: Record<string, number> = {};
			splittableTokens.forEach((token) => {
				const parentVal = parentVals[token.key] ?? 0;
				const secSum = secondaries.reduce((sum, s) => sum + (prev[s.id]?.[token.key] ?? 0), 0);
				oldPrimaryVals[token.key] = Math.max(0, Math.round((parentVal - secSum) * 10) / 10);
			});
			next[oldPrimaryId] = oldPrimaryVals;
			delete next[newPrimaryId];
			return next;
		});

		setPrimaryId(newPrimaryId);
	}, [primaryId, splits, splittableTokens]);

	const handleAutoFix = useCallback((tokenKey: string) => {
		const parentVal = parentMeasurement.token_values[tokenKey] ?? 0;
		if (parentVal === 0) return;
		const secondaries = splits.filter((s) => s.id !== primaryId);
		const secondarySum = secondaries.reduce((sum, s) => sum + (values[s.id]?.[tokenKey] ?? 0), 0);
		const overage = Math.round((secondarySum - parentVal) * 10) / 10;
		if (overage <= 0) return;

		let target = secondaries[0];
		let maxVal = 0;
		secondaries.forEach((s) => {
			const v = values[s.id]?.[tokenKey] ?? 0;
			if (v > maxVal) { maxVal = v; target = s; }
		});
		if (target && maxVal >= overage) {
			handleManualChange(target.id, tokenKey, Math.round((maxVal - overage) * 10) / 10);
		}
	}, [splits, primaryId, values, handleManualChange]);

	const hasDuplicateTypes = useMemo(() => {
		const types = splits.map((s) => s.trade_type);
		return new Set(types).size !== types.length;
	}, [splits]);

	const rowIssues = useMemo(() => {
		let overCount = 0;
		const parentVals = parentMeasurement.token_values;
		const secondaries = splits.filter((s) => s.id !== primaryId);
		splittableTokens.forEach((token) => {
			const parentVal = parentVals[token.key] ?? 0;
			if (parentVal === 0) return;
			const secSum = secondaries.reduce((sum, s) => sum + (values[s.id]?.[token.key] ?? 0), 0);
			if (secSum > parentVal + 0.01) overCount++;
		});
		return { overCount };
	}, [splits, primaryId, values, splittableTokens]);

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

	const canGenerate = splits.length >= 2 && !hasDuplicateTypes && rowIssues.overCount === 0;

	const independentTokens = useMemo(() => TOKEN_DEFINITIONS.filter(t => t.classification === 'independent'), []);
	const fixedTokens = useMemo(() => TOKEN_DEFINITIONS.filter(t => t.classification === 'fixed'), []);

	const handleGenerate = useCallback(() => {
		if (hasDuplicateTypes) { setError('Each split must have a unique material type'); return; }
		setError('');
		const parentValues = parentMeasurement.token_values;
		const secondaries = splits.filter((s) => s.id !== primaryId);
		const finalScopes: SplitScope[] = splits.map((split) => {
			const allocations: Record<string, number> = {};
			splittableTokens.forEach((token) => {
				const parentVal = parentValues[token.key] ?? 0;
				if (split.id === primaryId) {
					const secSum = secondaries.reduce(
						(sum, s) => sum + (values[s.id]?.[token.key] ?? 0), 0
					);
					allocations[token.key] = Math.max(0, Math.round((parentVal - secSum) * 10) / 10);
				} else {
					allocations[token.key] = values[split.id]?.[token.key] ?? 0;
				}
			});
			independentTokens.forEach((token) => {
				allocations[token.key] = independentValues[split.id]?.[token.key] ?? 0;
			});
			fixedTokens.forEach((token) => {
				allocations[token.key] = parentValues[token.key] ?? 0;
			});
			return {
				id: split.id,
				name: split.trade_type,
				trade_type: split.trade_type as TradeType,
				color: split.color,
				allocations,
			};
		});
		onGenerate(generateChildCards(parentMeasurement, finalScopes));
		onClose();
	}, [hasDuplicateTypes, splits, primaryId, values, independentValues, splittableTokens, independentTokens, fixedTokens, onGenerate, onClose]);

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
								Enter secondary material values — the <span className="font-medium text-[#475569]">primary auto-adjusts</span>.
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
						{splits.map((s) => {
							const isPrimary = s.id === primaryId;
							return (
								<div key={s.id}
									className={`flex items-center gap-0.5 rounded-lg border bg-white pl-1 pr-1 py-1 transition-all duration-150 ${
										isPrimary ? 'border-[#3b82f6]/30 ring-1 ring-[#3b82f6]/10' : 'border-[#e5e7eb] hover:border-[#cbd5e1] hover:shadow-sm'
									}`}>
									<MaterialDropdown
										value={s.trade_type} usedTypes={usedTradeTypes}
										onChange={(tt) => setTradeType(s.id, tt)}
									/>
									{isPrimary ? (
										<span className="text-[9px] font-bold text-[#3b82f6] bg-[#eff6ff] rounded px-1.5 py-[3px] uppercase tracking-wider leading-none mr-0.5 select-none">
											Primary
										</span>
									) : (
										<>
											<button type="button" onClick={() => swapPrimary(s.id)}
												className="flex items-center justify-center size-[28px] rounded-md text-[#d4d4d8] transition-all duration-150 hover:text-[#3b82f6] hover:bg-[#eff6ff]"
												aria-label={`Set ${s.trade_type} as primary`}
												title="Set as primary">
												<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
												</svg>
											</button>
											{splits.length > 2 && (
												<button type="button" onClick={() => removeSplit(s.id)}
													className="flex items-center justify-center size-[28px] rounded-md text-[#d4d4d8] transition-all duration-150 hover:bg-[#fef2f2] hover:text-[#ef4444]"
													aria-label={`Remove ${s.trade_type}`}>
													<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
														<path d="M18 6L6 18" /><path d="M6 6l12 12" />
													</svg>
												</button>
											)}
										</>
									)}
								</div>
							);
						})}
						{splits.length < 4 && (
							<button type="button" onClick={addSplit}
								className="flex items-center gap-1.5 rounded-lg border border-dashed border-[#cbd5e1] px-3 py-[7px] text-[12px] font-medium text-[#94a3b8] transition-all duration-150 hover:border-[#3b82f6] hover:text-[#3b82f6] hover:bg-[#eff6ff]">
								<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
									<path d="M12 5v14" /><path d="M5 12h14" />
								</svg>
								Add material
							</button>
						)}
					</div>
					{hasDuplicateTypes && (
						<p className="text-[11px] text-[#ef4444] mt-2 flex items-center gap-1">
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
							</svg>
							Each split must be a different material type.
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
							splits={splits} primaryId={primaryId} values={values}
							searchQuery={searchQuery} hideZero={hideZeroValues}
							onManualChange={handleManualChange}
							onAutoFix={handleAutoFix}
						/>
					))}

					{/* Material-Specific Tokens (independent — not split from parent total) */}
					{TOKEN_DEFINITIONS.filter(t => t.classification === 'independent').length > 0 && (
						<MaterialSpecificSection
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
							{rowIssues.overCount > 0 ? (
								<span className="text-[11px] text-[#ef4444] font-medium flex items-center gap-1">
									{rowIssues.overCount} over-allocated — click to fix
								</span>
							) : !hasAnyValues ? (
								<span className="text-[11px] text-[#94a3b8]">
									Enter values for secondary materials to split
								</span>
							) : null}
						</div>
						<div className="flex items-center gap-2.5">
							{hasAnyValues && (
								<button type="button" onClick={() => { setValues({}); setIndependentValues({}); }}
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
