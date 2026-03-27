'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MeasurementCardComponent } from './measurement-card';
import { TokenTable } from './token-table';
import { SplitMeasurementDrawer } from './split-measurement-drawer';
import { parentMeasurement, pendingMeasurement, additionalMeasurements, TOKEN_DEFINITIONS, TRADE_TYPE_COLORS, CATEGORIES } from '@/lib/mock-data';
import type { MeasurementCard } from '@/lib/types';
import { cn } from '@/lib/utils';

function SuccessToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 10, scale: 0.95 }}
			transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
			className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 rounded-lg bg-[#1e293b] px-4 py-3 shadow-xl shadow-black/15"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
				<path d="M20 6L9 17l-5-5" />
			</svg>
			<span className="text-[13px] font-medium text-white whitespace-nowrap">{message}</span>
			<button type="button" onClick={onDismiss} className="ml-2 text-white/50 hover:text-white transition-colors">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M18 6L6 18" /><path d="M6 6l12 12" />
				</svg>
			</button>
		</motion.div>
	);
}

function UndoSplitDialog({ splitCount, onConfirm, onCancel }: { splitCount: number; onConfirm: () => void; onCancel: () => void }) {
	return (
		<>
			<div className="fixed inset-0 bg-black/40 z-[55]" onClick={onCancel} />
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
				className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[56] w-[420px] rounded-xl bg-white shadow-2xl shadow-black/15 overflow-hidden"
			>
				<div className="px-6 pt-6 pb-4">
					<div className="flex items-center gap-3 mb-3">
						<div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#fef2f2]">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
							</svg>
						</div>
						<h3 className="text-[15px] font-semibold text-[#1e293b]">Undo Split?</h3>
					</div>
					<p className="text-[13px] text-[#64748b] leading-relaxed">
						This will remove all <strong className="text-[#334155] font-medium">{splitCount} split measurements</strong> and restore the original measurement to its completed state. This action cannot be undone.
					</p>
				</div>
				<div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-[#f1f5f9] bg-[#fafbfc]">
					<button type="button" onClick={onCancel}
						className="h-[36px] rounded-md border border-[#e2e8f0] bg-white px-4 text-[13px] font-medium text-[#475569] transition-all hover:bg-[#f8fafc] hover:border-[#cbd5e1]">
						Cancel
					</button>
					<button type="button" onClick={onConfirm}
						className="h-[36px] rounded-md bg-[#ef4444] px-4 text-[13px] font-semibold text-white transition-all hover:bg-[#dc2626] shadow-sm shadow-[#ef4444]/20">
						Undo Split
					</button>
				</div>
			</motion.div>
		</>
	);
}

function SplitMeasurementMenuItem({ canSplit, onSplit }: { canSplit: boolean; onSplit: () => void }) {
	const [showTooltip, setShowTooltip] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	const handleEnter = () => {
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => setShowTooltip(true), 400);
	};
	const handleLeave = () => {
		clearTimeout(timeoutRef.current);
		setShowTooltip(false);
	};

	return (
		<div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
			<DropdownMenuItem
				className="text-base min-h-10 px-3 py-2 rounded-md flex items-center w-full cursor-pointer"
				disabled={!canSplit}
				onClick={() => { if (canSplit) onSplit(); }}
			>
				<span className="flex items-center gap-2 w-full">
					<span className="font-medium text-gray-700">Split Measurement</span>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="ml-auto shrink-0">
						<path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="#f59e0b" />
					</svg>
				</span>
			</DropdownMenuItem>

			<AnimatePresence>
				{showTooltip && (
					<motion.div
						initial={{ opacity: 0, x: 8, scale: 0.96 }}
						animate={{ opacity: 1, x: 0, scale: 1 }}
						exit={{ opacity: 0, x: 8, scale: 0.96 }}
						transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
						className="absolute right-full top-1/2 -translate-y-1/2 mr-3 z-50 w-[260px] pointer-events-none"
					>
						<div className="bg-[#0f172a] rounded-xl p-4 shadow-2xl shadow-black/25 relative">
							{/* Arrow pointing right */}
							<div className="absolute top-1/2 -translate-y-1/2 -right-[6px]">
								<div className="w-3 h-3 bg-[#0f172a] rotate-45 rounded-[1px]" />
							</div>

							<div className="flex items-center gap-2 mb-2.5">
								<div className="flex items-center justify-center size-[28px] rounded-lg bg-[#f59e0b]/15">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
										<path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="#f59e0b" />
									</svg>
								</div>
								<span className="text-[13px] font-semibold text-white tracking-tight">Split Measurement</span>
							</div>

							<p className="text-[12px] text-[#94a3b8] leading-[1.6] mb-3">
								Divide this report across multiple roofing materials. Set a primary material and enter values for the rest — the primary auto-calculates.
							</p>

							<div className="flex gap-2">
								<div className="flex items-center gap-1.5 bg-[#1e293b] rounded-md px-2 py-1">
									<div className="size-[5px] rounded-full bg-[#4F46E5]" />
									<span className="text-[10px] text-[#cbd5e1] font-medium">Shingles</span>
								</div>
								<div className="flex items-center gap-1.5 bg-[#1e293b] rounded-md px-2 py-1">
									<div className="size-[5px] rounded-full bg-[#E18026]" />
									<span className="text-[10px] text-[#cbd5e1] font-medium">Metal</span>
								</div>
								<div className="flex items-center gap-1.5 bg-[#1e293b] rounded-md px-2 py-1">
									<div className="size-[5px] rounded-full bg-[#0891B2]" />
									<span className="text-[10px] text-[#cbd5e1] font-medium">TPO</span>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export function MeasurementTab() {
	const [splitChildCards, setSplitChildCards] = useState<MeasurementCard[] | null>(null);
	const [splitDrawerOpen, setSplitDrawerOpen] = useState(false);
	const [toast, setToast] = useState<string | null>(null);
	const [undoDialogOpen, setUndoDialogOpen] = useState(false);
	const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

	const isSplit = !!splitChildCards && splitChildCards.length > 0;

	const allCards = useMemo<MeasurementCard[]>(() => {
		if (isSplit) {
			const splitParent: MeasurementCard = {
				...parentMeasurement,
				status: 'Split',
				split_child_ids: splitChildCards.map(c => c.id),
			};
			return [splitParent, ...splitChildCards, pendingMeasurement, ...additionalMeasurements];
		}
		return [parentMeasurement, pendingMeasurement, ...additionalMeasurements];
	}, [isSplit, splitChildCards]);

	const [selectedCardId, setSelectedCardId] = useState(allCards[0]?.id ?? '');
	const [activeDetailTab, setActiveDetailTab] = useState<'measurement' | 'attachments'>('measurement');
	const [searchQuery, setSearchQuery] = useState('');

	const showToast = useCallback((msg: string) => {
		setToast(msg);
		clearTimeout(toastTimer.current);
		toastTimer.current = setTimeout(() => setToast(null), 4000);
	}, []);

	useEffect(() => {
		setSelectedCardId(prev => {
			if (allCards.some(c => c.id === prev)) return prev;
			return allCards[0]?.id ?? prev;
		});
	}, [allCards]);

	const selectedCard = allCards.find(c => c.id === selectedCardId) ?? allCards[0];
	const totalCards = allCards.length;

	const isSelectedSplitParent = selectedCard?.status === 'Split';
	const isSelectedChildSplit = !!selectedCard?.parent_id;

	const showSearch =
		selectedCard &&
		(selectedCard.status === 'Completed' || isSelectedChildSplit) &&
		activeDetailTab === 'measurement';

	const contentPt =
		(selectedCard && activeDetailTab === 'measurement') || totalCards === 0;

	const handleSplitGenerate = useCallback((childCards: MeasurementCard[]) => {
		setSplitChildCards(childCards);
		setTimeout(() => {
			if (childCards.length > 0) {
				setSelectedCardId(childCards[0].id);
			}
		}, 50);
		showToast(`Split into ${childCards.length} materials`);
	}, [showToast]);

	const handleUndoSplit = useCallback(() => {
		setSplitChildCards(null);
		setSelectedCardId(parentMeasurement.id);
		setUndoDialogOpen(false);
		showToast('Split removed — original measurement restored');
	}, [showToast]);

	const handleChildValueChange = useCallback((key: string, value: number) => {
		if (!selectedCard?.parent_id || !splitChildCards) return;
		setSplitChildCards(prev => {
			if (!prev) return prev;
			return prev.map(c =>
				c.id === selectedCard.id
					? { ...c, token_values: { ...c.token_values, [key]: value } }
					: c
			);
		});
	}, [selectedCard, splitChildCards]);

	const canSplit =
		selectedCard &&
		selectedCard.status !== 'Split' &&
		selectedCard.status !== 'Pending' &&
		!selectedCard.parent_id;

	return (
		<div className="h-full overflow-y-auto">
			<div className="text-base text-gray-900 bg-white m-4 rounded-md shadow">
				{/* HEADER */}
				<div className="flex justify-between items-center px-6 py-3 border-b border-gray-200 min-h-[64px]">
					<h3 className="text-xl font-semibold leading-7 text-gray-600">
						Measurements
						{totalCards > 0 ? (
							<span className="primary-font">({totalCards})</span>
						) : null}
					</h3>

					{totalCards > 0 ? (
						<div className="relative">
							<DropdownMenu>
								<DropdownMenuTrigger
									type="button"
									className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none h-10 cursor-pointer"
								>
									<em className="text-base ti ti-plus flex items-center not-italic" />
									<span className="ml-2 primary-font text-base flex items-center">New Measurement</span>
									<em className="ml-2 text-base ti ti-chevron-down flex items-center not-italic" />
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-80 p-1">
									<DropdownMenuItem className="flex items-center w-full px-3 py-3 text-left hover:bg-gray-50 cursor-pointer rounded-none h-auto">
										<div className="flex items-center justify-center w-14 h-12 rounded-lg mr-3 border border-gray-200">
											<em className="hover not-italic" />
										</div>
										<div className="flex-1">
											<div className="font-medium text-base text-gray-900">HOVER</div>
											<div className="text-sm text-gray-500">Order a HOVER measurement report</div>
										</div>
									</DropdownMenuItem>
									<DropdownMenuItem className="flex items-center w-full px-3 py-3 text-left hover:bg-gray-50 cursor-pointer rounded-none h-auto">
										<div className="flex items-center justify-center w-14 h-12 rounded-lg mr-3 border border-gray-200">
											<em className="eagle-menu not-italic" />
										</div>
										<div className="flex-1">
											<div className="font-medium text-base text-gray-900">EagleView</div>
											<div className="text-sm text-gray-500">Order an EagleView report</div>
										</div>
									</DropdownMenuItem>
									<DropdownMenuItem className="flex items-center w-full px-3 py-3 text-left hover:bg-gray-50 cursor-pointer rounded-none h-auto">
										<div className="flex items-center justify-center w-14 h-12 rounded-lg mr-3 border border-gray-200">
											<em className="roofscope-menu not-italic" />
										</div>
										<div className="flex-1">
											<div className="font-medium text-base text-gray-900">RoofScope</div>
											<div className="text-sm text-gray-500">Order a RoofScope report</div>
										</div>
									</DropdownMenuItem>
									<DropdownMenuItem className="flex items-center w-full px-3 py-3 text-left hover:bg-gray-50 cursor-pointer rounded-none h-auto">
										<div className="flex items-center justify-center w-14 h-12 rounded-lg mr-3 border border-gray-200">
											<em className="gaf-menu not-italic" />
										</div>
										<div className="flex-1">
											<div className="font-medium text-base text-gray-900">GAF QuickMeasure</div>
											<div className="text-sm text-gray-500">Order a GAF measurement</div>
										</div>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem className="flex items-center w-full px-3 py-3 text-left hover:bg-gray-50 cursor-pointer rounded-none h-auto">
										<div className="flex items-center justify-center w-14 h-12 rounded-lg mr-3 border border-gray-200">
											<em className="manual-measurement not-italic" />
										</div>
										<div className="flex-1">
											<div className="font-medium text-base text-gray-900">Manual entry</div>
											<div className="text-sm text-gray-500">Enter measurements manually</div>
										</div>
									</DropdownMenuItem>
									<DropdownMenuItem className="flex items-center w-full px-3 py-3 text-left hover:bg-gray-50 cursor-pointer rounded-none h-auto">
										<div className="flex items-center justify-center w-14 h-12 rounded-lg mr-3 border border-gray-200">
											<em className="text-xl text-green-600 ti ti-upload flex items-center not-italic" />
										</div>
										<div className="flex-1">
											<div className="font-medium text-base text-gray-900">Import file</div>
											<div className="text-sm text-gray-500">Upload a measurement file</div>
										</div>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					) : null}
				</div>

				{/* CARDS */}
				<div className="relative border-b border-gray-200">
					<div
						className={cn(
							'flex gap-3 py-4 mx-6 select-none overflow-x-auto relative z-[2] cursor-grab',
							totalCards > 3 && 'measurement-cards-hide-scrollbar'
						)}
						style={
							totalCards > 3
								? { msOverflowStyle: 'none', scrollbarWidth: 'none' }
								: undefined
						}
					>
						<AnimatePresence mode="popLayout">
							{(() => {
								const groups: { type: 'single' | 'split-group'; cards: MeasurementCard[] }[] = [];
								let i = 0;
								while (i < allCards.length) {
									const card = allCards[i];
									if (card.status === 'Split' && card.split_child_ids?.length) {
										const children = allCards.filter(c => c.parent_id === card.id);
										groups.push({ type: 'split-group', cards: [card, ...children] });
										i += 1 + children.length;
									} else if (!card.parent_id) {
										groups.push({ type: 'single', cards: [card] });
										i++;
									} else {
										i++;
									}
								}
								return groups.map((group) => {
									if (group.type === 'single') {
										const card = group.cards[0];
										return (
											<motion.div key={card.id} layout
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.95 }}
												transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}>
												<MeasurementCardComponent
													card={card}
													isSelected={card.id === selectedCardId}
													onSelect={setSelectedCardId}
													totalCards={totalCards}
												/>
											</motion.div>
										);
									}
									const parentCard = group.cards[0];
									const childCards = group.cards.slice(1);
									const parentArea = parentCard.token_values['total_roof_area_squares'] ?? 0;
									return (
										<motion.div key={`split-${parentCard.id}`} layout
											initial={{ opacity: 0, scale: 0.95 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.95 }}
											transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
											className="flex items-stretch gap-3 shrink-0 relative bg-[#f8fafc] border border-[#e2e8f0] border-dashed rounded-xl px-3 -my-1 py-1">
											<MeasurementCardComponent
												card={parentCard}
												isSelected={parentCard.id === selectedCardId}
												onSelect={setSelectedCardId}
												totalCards={totalCards}
											/>
											{childCards.map(child => (
												<MeasurementCardComponent
													key={child.id}
													card={child}
													isSelected={child.id === selectedCardId}
													onSelect={setSelectedCardId}
													totalCards={totalCards}
													parentTotalArea={parentArea}
													parentName={parentCard.report_name}
												/>
											))}
										</motion.div>
									);
								});
							})()}
						</AnimatePresence>
					</div>
				</div>

				{/* TOOLBAR */}
				{selectedCard ? (
					<div className="flex items-center justify-between px-6 border-b border-gray-200">
						<div className="flex items-center gap-6">
							<div className="relative py-3">
								<DropdownMenu>
									<DropdownMenuTrigger
										type="button"
										className="border px-3 py-1.5 h-10 rounded-md flex items-center gap-1 hover:bg-gray-50 bg-white cursor-pointer"
									>
										<span>View In</span>
										<i className="ti ti-chevron-down text-sm" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start" className="w-32 p-1">
										<DropdownMenuGroup>
											<DropdownMenuItem className="text-base h-10 px-3 py-2 rounded-md text-gray-700 flex items-center w-full cursor-pointer">
												<span>PDF</span>
											</DropdownMenuItem>
											<DropdownMenuItem className="text-base h-10 px-3 py-2 rounded-md text-gray-700 flex items-center w-full cursor-pointer">
												<span>3D</span>
											</DropdownMenuItem>
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							<nav className="flex gap-6">
								<button
									type="button"
									onClick={() => setActiveDetailTab('measurement')}
									className={cn(
										'py-3 text-base font-medium border-b-2 transition-colors',
										activeDetailTab === 'measurement'
											? 'text-[#E44A19]'
											: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
									)}
									style={
										activeDetailTab === 'measurement'
											? { borderBottomColor: '#E44A19', color: '#E44A19' }
											: undefined
									}
								>
									Measurements
								</button>
								<button
									type="button"
									onClick={() => setActiveDetailTab('attachments')}
									className={cn(
										'py-3 text-base font-medium border-b-2 transition-colors',
										activeDetailTab === 'attachments'
											? 'text-[#E44A19]'
											: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
									)}
									style={
										activeDetailTab === 'attachments'
											? { borderBottomColor: '#E44A19', color: '#E44A19' }
											: undefined
									}
								>
									Attachments
								</button>
							</nav>
						</div>

						<div className="flex items-center gap-2 py-3">
							{showSearch ? (
								<div className="relative flex items-center">
									<i className="ti ti-search text-lg text-gray-900 cursor-pointer absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
									<input
										type="text"
										value={searchQuery}
										onChange={e => setSearchQuery(e.target.value)}
										placeholder="Search measurements"
										className="text-base block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0.5 focus:ring-blue-500 focus:border-blue-500 h-10 flex items-center"
									/>
									{searchQuery ? (
										<button
											type="button"
											onClick={() => setSearchQuery('')}
											className="filter-search-clear absolute right-3 top-1/2 w-6 h-6 transform -translate-y-1/2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full flex items-center justify-center"
											aria-label="Clear search"
										>
											✕
										</button>
									) : null}
								</div>
							) : null}

							{activeDetailTab === 'attachments' ? (
								<button
									type="button"
									className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-base font-medium text-gray-700"
								>
									<i className="ti ti-upload text-lg" />
									Upload
								</button>
							) : null}

							<div className="relative">
								<DropdownMenu>
									<DropdownMenuTrigger
										type="button"
										className="border p-2 rounded-md flex items-center h-10 justify-center hover:bg-gray-50 bg-white cursor-pointer"
									>
										<i className="ti ti-dots-vertical text-lg" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56 p-1">
										<DropdownMenuGroup>
											{!isSelectedSplitParent && (
												<DropdownMenuItem className="text-base h-10 px-3 py-2 rounded-md text-gray-700 flex items-center w-full cursor-pointer">
													<span>Edit</span>
												</DropdownMenuItem>
											)}
											{!isSelectedChildSplit && !isSelectedSplitParent && (
												<SplitMeasurementMenuItem
													canSplit={canSplit}
													onSplit={() => setSplitDrawerOpen(true)}
												/>
											)}
											{isSelectedSplitParent && (
												<DropdownMenuItem
													className="text-base h-10 px-3 py-2 rounded-md flex items-center w-full cursor-pointer text-[#ef4444] focus:text-[#ef4444] focus:bg-[#fef2f2]"
													onClick={() => setUndoDialogOpen(true)}
												>
													<span className="flex items-center gap-2">
														<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
															<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
														</svg>
														Undo Split
													</span>
												</DropdownMenuItem>
											)}
											<DropdownMenuSub>
												<DropdownMenuSubTrigger className="text-base h-10 px-3 py-2 rounded-md text-gray-700 flex items-center w-full cursor-pointer">
													<span>Download</span>
												</DropdownMenuSubTrigger>
												<DropdownMenuSubContent className="w-32 p-1">
													<DropdownMenuItem className="text-base h-10 px-3 py-2 rounded-md text-gray-700 flex items-center w-full cursor-pointer">
														<span>PDF</span>
													</DropdownMenuItem>
													<DropdownMenuItem className="text-base h-10 px-3 py-2 rounded-md text-gray-700 flex items-center w-full cursor-pointer">
														<span>XML</span>
													</DropdownMenuItem>
													<DropdownMenuItem className="text-base h-10 px-3 py-2 rounded-md text-gray-700 flex items-center w-full cursor-pointer">
														<span>JSON</span>
													</DropdownMenuItem>
													<DropdownMenuItem className="text-base h-10 px-3 py-2 rounded-md text-gray-700 flex items-center w-full cursor-pointer">
														<span>XLSX</span>
													</DropdownMenuItem>
												</DropdownMenuSubContent>
											</DropdownMenuSub>
											{!isSelectedSplitParent && (
												<DropdownMenuItem
													variant="destructive"
													className="text-base h-10 px-3 py-2 rounded-md flex items-center w-full cursor-pointer"
												>
													<span>Remove</span>
												</DropdownMenuItem>
											)}
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</div>
				) : null}

				{/* MAIN CONTENT */}
				<div
					className={cn(
						'px-6 pb-6 space-y-4 min-h-[58vh]',
						contentPt && 'pt-6',
						selectedCard &&
							activeDetailTab === 'attachments' &&
							'hidden'
					)}
				>
					{selectedCard && activeDetailTab === 'measurement' ? (
						selectedCard.status === 'Pending' ? (
							<PendingEmptyState />
						) : (
							<AnimatePresence mode="wait">
								<motion.div
									key={selectedCardId}
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -6 }}
									transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
								>
									{isSelectedSplitParent && splitChildCards && (
										<>
											<SplitSumBanner parentCard={selectedCard} childCards={splitChildCards} onSelectChild={setSelectedCardId} />
											<SplitComparisonTable parentCard={parentMeasurement} childCards={splitChildCards} onSelectChild={setSelectedCardId} />
										</>
									)}
									{!isSelectedSplitParent && (
										<TokenTable card={selectedCard} onValueChange={isSelectedChildSplit ? handleChildValueChange : undefined} />
									)}
								</motion.div>
							</AnimatePresence>
						)
					) : null}
				</div>

				{/* ATTACHMENTS PANEL */}
				{selectedCard && activeDetailTab === 'attachments' ? (
					<div className="px-6 pb-6 min-h-[50vh] pt-6 flex flex-col">
						<div className="flex-1 flex flex-col items-center justify-center">
							<div className="flex flex-col items-center justify-center">
								<i className="ti ti-paperclip text-[120px] text-gray-200 leading-none" aria-hidden />
								<h4 className="font-medium mt-4 text-gray-500 text-base">No Attachments Found</h4>
							</div>
						</div>
					</div>
				) : null}
			</div>

			<SplitMeasurementDrawer
				isOpen={splitDrawerOpen}
				onClose={() => setSplitDrawerOpen(false)}
				onGenerate={handleSplitGenerate}
			/>

			<AnimatePresence>
				{toast && <SuccessToast message={toast} onDismiss={() => setToast(null)} />}
			</AnimatePresence>

			<AnimatePresence>
				{undoDialogOpen && (
					<UndoSplitDialog
						splitCount={splitChildCards?.length ?? 0}
						onConfirm={handleUndoSplit}
						onCancel={() => setUndoDialogOpen(false)}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}

function PendingEmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-12 px-6">
			<div className="h-[150px] w-full flex items-center justify-center" aria-hidden>
				<i className="ti ti-clock-hour-4 text-[120px] text-gray-300 leading-none" />
			</div>
			<h3 className="text-xl font-medium text-gray-900 mt-4 mb-2">Measurement pending</h3>
			<p className="text-base text-gray-500 text-center max-w-md">
				Your measurement is being processed. Check back shortly for results.
			</p>
		</div>
	);
}


function SplitComparisonTable({ parentCard, childCards, onSelectChild }: { parentCard: MeasurementCard; childCards: MeasurementCard[]; onSelectChild: (id: string) => void }) {
	const [openCategories, setOpenCategories] = useState<Set<string>>(new Set([CATEGORIES[0]]));

	const toggleCategory = (cat: string) => {
		setOpenCategories(prev => {
			const next = new Set(prev);
			if (next.has(cat)) next.delete(cat);
			else next.add(cat);
			return next;
		});
	};

	return (
		<div className="space-y-3">
			{CATEGORIES.map((category) => {
				const tokens = TOKEN_DEFINITIONS.filter(t => t.category === category && t.classification !== 'fixed' && (parentCard.token_values[t.key] ?? 0) > 0);
				if (tokens.length === 0) return null;
				const isOpen = openCategories.has(category);

				return (
					<div key={category} className="rounded-lg border border-[#e2e8f0] bg-white overflow-hidden">
						<button type="button" onClick={() => toggleCategory(category)}
							className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#f8fafc] cursor-pointer">
							<span className="text-[14px] font-semibold text-[#334155]">{category}</span>
							<span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#dbeafe] px-1.5 text-[11px] font-bold text-[#3b82f6]">
								{tokens.length}
							</span>
							<span className="ml-auto">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none"
									className={`transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : ''}`}>
									<path d="M4 6L8 10L12 6" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</span>
						</button>

						{isOpen && (
							<div className="border-t border-[#e2e8f0] overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="bg-[#f8fafc]">
											<th className="px-5 py-2 text-left text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">Measurement</th>
											<th className="px-3 py-2 text-right text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider w-[100px]">Total</th>
											{childCards.map((child) => {
												const color = child.trade_type ? TRADE_TYPE_COLORS[child.trade_type] ?? '#94a3b8' : '#94a3b8';
												return (
													<th key={child.id} className="px-3 py-2 text-right w-[120px]">
														<button type="button" onClick={() => onSelectChild(child.id)}
															className="flex items-center justify-end gap-1.5 cursor-pointer hover:opacity-80 transition-opacity ml-auto">
															<span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: color }} />
															<span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider truncate">{child.trade_type}</span>
														</button>
													</th>
												);
											})}
										</tr>
									</thead>
									<tbody>
										{tokens.map((token, idx) => {
											const parentVal = parentCard.token_values[token.key] ?? 0;
											const childSum = childCards.reduce((s, c) => s + (c.token_values[token.key] ?? 0), 0);
											const isMismatch = Math.abs(childSum - parentVal) > 0.1;
											return (
												<tr key={token.key} className={idx < tokens.length - 1 ? 'border-b border-[#f1f5f9]' : ''}>
													<td className="px-5 py-2.5 text-[13px] text-[#334155]">{token.label}</td>
													<td className="px-3 py-2.5 text-[13px] text-[#94a3b8] text-right tabular-nums font-medium">{parentVal.toLocaleString()}</td>
													{childCards.map((child) => {
														const val = child.token_values[token.key] ?? 0;
														const color = child.trade_type ? TRADE_TYPE_COLORS[child.trade_type] ?? '#334155' : '#334155';
														return (
															<td key={child.id} className={`px-3 py-2.5 text-[13px] text-right tabular-nums font-medium ${isMismatch ? 'text-[#d97706]' : 'text-[#334155]'}`}>
																{val.toLocaleString()}
															</td>
														);
													})}
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

function SplitSumBanner({ parentCard, childCards, onSelectChild }: { parentCard: MeasurementCard; childCards: MeasurementCard[]; onSelectChild?: (id: string) => void }) {
	const mismatches: { label: string; parentVal: number; childSums: { name: string; val: number; color: string; id: string }[]; total: number }[] = [];
	TOKEN_DEFINITIONS.forEach((token) => {
		const parentVal = parentCard.token_values[token.key];
		if (parentVal === undefined || parentVal === 0) return;
		if (token.classification !== 'splittable') return;
		const childSums = childCards.map(c => ({
			name: c.trade_type ?? c.report_name,
			val: c.token_values[token.key] ?? 0,
			color: c.trade_type ? (TRADE_TYPE_COLORS[c.trade_type] ?? '#94a3b8') : '#94a3b8',
			id: c.id,
		}));
		const total = childSums.reduce((s, c) => s + c.val, 0);
		if (Math.abs(total - parentVal) > 0.1) {
			mismatches.push({ label: token.label, parentVal, childSums, total });
		}
	});

	if (mismatches.length === 0) return null;

	const diff = mismatches[0].total - mismatches[0].parentVal;
	const isOver = diff > 0;

	return (
		<div className="rounded-lg border border-[#fde68a] bg-[#fffbeb] px-4 py-3 mb-4">
			<div className="flex items-start gap-2.5">
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
					<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
					<line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
				</svg>
				<div className="flex-1 min-w-0">
					<p className="text-[12px] font-medium text-[#92400e]">
						{mismatches.length} {mismatches.length === 1 ? 'measurement' : 'measurements'} {isOver ? 'over-allocated' : 'under-allocated'}
					</p>
					<div className="mt-2 space-y-1.5">
						{mismatches.slice(0, 3).map(m => (
							<div key={m.label} className="flex items-center gap-2 text-[11px]">
								<span className="text-[#92400e] w-[120px] truncate shrink-0">{m.label}</span>
								<span className="text-[#b45309] tabular-nums">
									{m.childSums.map((c, i) => (
										<span key={c.id}>
											{i > 0 && ' + '}
											<button type="button" onClick={() => onSelectChild?.(c.id)}
												className="hover:underline cursor-pointer" style={{ color: c.color }}>
												{c.val.toLocaleString()}
											</button>
										</span>
									))}
									{' = '}{m.total.toLocaleString()}{' vs '}<span className="font-medium text-[#92400e]">{m.parentVal.toLocaleString()}</span>
								</span>
							</div>
						))}
						{mismatches.length > 3 && (
							<span className="text-[11px] text-[#b45309]">and {mismatches.length - 3} more...</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
