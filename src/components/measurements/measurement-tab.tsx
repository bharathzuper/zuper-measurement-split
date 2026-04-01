'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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


function DisabledSplitMenuItem() {
	const rowRef = useRef<HTMLDivElement>(null);
	const [tipPos, setTipPos] = useState<{ top: number; left: number } | null>(null);
	const [show, setShow] = useState(false);

	const handleEnter = useCallback(() => {
		if (!rowRef.current) return;
		const rect = rowRef.current.getBoundingClientRect();
		setTipPos({ top: rect.top - 8, left: rect.left + rect.width / 2 });
		setShow(true);
	}, []);

	const handleLeave = useCallback(() => setShow(false), []);

	return (
		<>
			<div
				ref={rowRef}
				className="text-base min-h-10 px-3 py-2 rounded-md flex items-center w-full opacity-40 cursor-not-allowed select-none"
				onMouseEnter={handleEnter}
				onMouseLeave={handleLeave}
			>
				<span className="flex items-center gap-2 w-full">
					<span className="font-medium text-gray-400">Split Measurement</span>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="ml-auto shrink-0 opacity-40">
						<path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="#f59e0b" />
					</svg>
				</span>
			</div>
			{show && tipPos && createPortal(
				<span
					className="fixed px-2.5 py-1.5 rounded-lg bg-[#0f172a] text-[11px] text-white whitespace-nowrap shadow-lg pointer-events-none"
					style={{ top: tipPos.top, left: tipPos.left, transform: 'translate(-50%, -100%)', zIndex: 99999 }}
				>
					Remove child measurements to split again
					<span className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-[#0f172a]" />
				</span>,
				document.body
			)}
		</>
	);
}

function KebabSpotlight({ buttonRef }: { buttonRef: React.RefObject<HTMLButtonElement | null> }) {
	const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

	useEffect(() => {
		const update = () => {
			if (buttonRef.current) {
				const rect = buttonRef.current.getBoundingClientRect();
				setPos({ top: rect.top + rect.height / 2, right: window.innerWidth - rect.left + 10 });
			}
		};
		update();
		window.addEventListener('scroll', update, true);
		return () => window.removeEventListener('scroll', update, true);
	}, [buttonRef]);

	return (
		<>
			{/* Pulsing ring */}
			<motion.div
				className="absolute inset-[-6px] rounded-lg border-2 border-[#f59e0b] pointer-events-none"
				animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.08, 1] }}
				transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
			/>
			{/* Tooltip — fixed position to escape overflow clipping */}
			{pos && (
				<motion.div
					className="fixed z-[9999] pointer-events-none whitespace-nowrap"
					style={{ top: pos.top, right: pos.right, transform: 'translateY(-50%)' }}
					initial={{ opacity: 0, x: 6 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.3, duration: 0.3 }}
				>
					<div className="relative bg-white rounded-lg px-3.5 py-2 shadow-lg shadow-black/[0.08] border border-[#e2e8f0]">
						{/* Arrow pointing right */}
						<div className="absolute top-1/2 -translate-y-1/2 -right-[5px]">
							<div className="w-2.5 h-2.5 bg-white border-r border-b border-[#e2e8f0] rotate-[-45deg] rounded-[1px]" />
						</div>
						<div className="flex items-center gap-1.5">
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
								<path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="#f59e0b" />
							</svg>
							<span className="text-[12px] font-semibold text-[#0f172a]">Click here to split</span>
						</div>
					</div>
				</motion.div>
			)}
		</>
	);
}

function SplitMeasurementMenuItem({ canSplit, onSplit, highlight }: { canSplit: boolean; onSplit: () => void; highlight?: boolean }) {
	const [showTooltip, setShowTooltip] = useState(false);
	const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const itemRef = useRef<HTMLDivElement>(null);

	const handleEnter = () => {
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			if (itemRef.current) {
				const rect = itemRef.current.getBoundingClientRect();
				setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 12 });
			}
			setShowTooltip(true);
		}, 350);
	};
	const handleLeave = () => {
		clearTimeout(timeoutRef.current);
		setShowTooltip(false);
	};

	return (
		<>
			<div ref={itemRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave} className="relative">
				{highlight && (
					<motion.div
						className="absolute inset-0 rounded-md border-2 border-[#f59e0b] pointer-events-none z-10"
						animate={{ opacity: [0.4, 1, 0.4] }}
						transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
					/>
				)}
				<DropdownMenuItem
					className={`text-base min-h-10 px-3 py-2 rounded-md flex items-center w-full cursor-pointer ${highlight ? 'bg-[#fffbeb]' : ''}`}
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
			</div>

			<AnimatePresence>
				{showTooltip && tooltipPos && (
					<motion.div
						initial={{ opacity: 0, x: -6, scale: 0.97 }}
						animate={{ opacity: 1, x: 0, scale: 1 }}
						exit={{ opacity: 0, x: -6, scale: 0.97 }}
						transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
						className="fixed z-[9999] w-[260px] pointer-events-none"
						style={{ top: tooltipPos.top, left: tooltipPos.left, transform: 'translateY(-50%)' }}
					>
						<div className="bg-white rounded-xl p-4 shadow-xl shadow-black/[0.08] border border-[#e2e8f0] relative">
							{/* Arrow pointing left */}
							<div className="absolute top-1/2 -translate-y-1/2 -left-[7px]">
								<div className="w-3 h-3 bg-white border-l border-b border-[#e2e8f0] rotate-45 rounded-[1px]" />
							</div>

							<div className="flex items-center gap-2.5 mb-2.5">
								<div className="flex items-center justify-center size-[30px] rounded-lg bg-[#fffbeb] border border-[#fde68a]">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
										<path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="#f59e0b" />
									</svg>
								</div>
								<span className="text-[13px] font-semibold text-[#0f172a] tracking-tight">Split Measurement</span>
							</div>

							<p className="text-[12px] text-[#64748b] leading-[1.6] mb-3">
								Divide this report across multiple structures. Set a primary split and enter values for the rest — the primary auto-calculates.
							</p>

							<div className="flex gap-1.5 flex-wrap">
								<div className="flex items-center gap-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-md px-2 py-1">
									<div className="size-[5px] rounded-full bg-[#4F46E5]" />
									<span className="text-[10px] text-[#475569] font-medium">Split 1</span>
								</div>
								<div className="flex items-center gap-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-md px-2 py-1">
									<div className="size-[5px] rounded-full bg-[#E18026]" />
									<span className="text-[10px] text-[#475569] font-medium">Split 2</span>
								</div>
								<div className="flex items-center gap-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-md px-2 py-1">
									<div className="size-[5px] rounded-full bg-[#0891B2]" />
									<span className="text-[10px] text-[#475569] font-medium">Split 3</span>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

export function MeasurementTab({ guidedStep, onGuidedStepChange }: { guidedStep?: number; onGuidedStepChange?: (step: number) => void } = {}) {
	const [splitChildCards, setSplitChildCards] = useState<MeasurementCard[] | null>(null);
	const [splitDrawerOpen, setSplitDrawerOpen] = useState(false);
	const [toast, setToast] = useState<string | null>(null);
	const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const kebabRef = useRef<HTMLButtonElement>(null);

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
		showToast(`Split into ${childCards.length} parts`);
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
													parentName={parentCard.report_name}
													onParentClick={() => setSelectedCardId(parentCard.id)}
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
								<DropdownMenu onOpenChange={(open) => {
									if (open && guidedStep === 1) onGuidedStepChange?.(2);
								}}>
									<DropdownMenuTrigger
										ref={kebabRef}
										type="button"
										className="border p-2 rounded-md flex items-center h-10 justify-center hover:bg-gray-50 bg-white cursor-pointer relative"
									>
										<i className="ti ti-dots-vertical text-lg" />
										{guidedStep === 1 && <KebabSpotlight buttonRef={kebabRef} />}
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56 p-1">
										<DropdownMenuGroup>
											{!isSelectedSplitParent && (
												<DropdownMenuItem className="text-base h-10 px-3 py-2 rounded-md text-gray-700 flex items-center w-full cursor-pointer">
													<span>Edit</span>
												</DropdownMenuItem>
											)}
											{!isSelectedChildSplit && (
												isSelectedSplitParent ? (
													<DisabledSplitMenuItem />
												) : (
													<SplitMeasurementMenuItem
														canSplit={canSplit}
														onSplit={() => { onGuidedStepChange?.(0); setSplitDrawerOpen(true); }}
														highlight={guidedStep === 2}
													/>
												)
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
									<TokenTable card={selectedCard} onValueChange={isSelectedChildSplit ? handleChildValueChange : undefined} />
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


