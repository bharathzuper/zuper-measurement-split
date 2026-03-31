'use client';

import type { MeasurementCard as MeasurementCardType } from '@/lib/types';
import { TRADE_TYPE_COLORS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export interface MeasurementCardProps {
	card: MeasurementCardType;
	isSelected: boolean;
	onSelect: (id: string) => void;
	totalCards: number;
	parentTotalArea?: number;
	parentName?: string;
	onParentClick?: () => void;
	compact?: boolean;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
	Completed: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-500', label: 'Completed' },
	Failed: { bg: 'bg-red-100', text: 'text-red-500', border: 'border-red-500', label: 'Failed' },
	'In Progress': { bg: 'bg-blue-100', text: 'text-blue-500', border: 'border-blue-500', label: 'In Progress' },
	Pending: { bg: 'bg-orange-100', text: 'text-orange-500', border: 'border-orange-500', label: 'Pending' },
};

function StatusBadge({ status }: { status: string }) {
	const s = STATUS_STYLES[status];
	if (!s) return null;
	return (
		<span className={cn('text-[12px] font-medium px-2 py-0.5 rounded border', s.bg, s.text, s.border)}>
			{s.label}
		</span>
	);
}

function ProviderLabel({ provider }: { provider: string }) {
	if (provider === 'HOVER') {
		return <span className="text-[14px] font-medium text-[#64748b]">Hover</span>;
	}
	if (provider === 'EagleView') {
		return <i className="eagle-card not-italic inline-block" aria-hidden />;
	}
	if (provider === 'GAF QuickMeasure') {
		return <i className="gaf-measurement not-italic inline-block" aria-hidden />;
	}
	if (provider === 'RoofSnap') {
		return <img src="/assets/images/svgs/roofsnap_logo.svg" alt="RoofSnap" className="w-6 h-6 rounded-lg object-cover" />;
	}
	if (provider === 'Split') {
		return null;
	}
	return <i className="manual-measurement not-italic inline-block" aria-hidden />;
}

export function MeasurementCardComponent({
	card,
	isSelected,
	onSelect,
	totalCards,
	parentTotalArea,
	parentName,
	onParentClick,
	compact,
}: MeasurementCardProps) {
	const isChildSplit = !!card.parent_id;
	const isSplitParent = card.status === 'Split';
	const name = card.report_name || card.provider || 'Report';
	const splitCount = card.split_child_ids?.length;
	const totalArea = card.token_values['total_roof_area_squares'] ?? 0;
	const tradeColor = card.trade_type ? TRADE_TYPE_COLORS[card.trade_type] ?? '#94a3b8' : '#94a3b8';
	const pct = isChildSplit && parentTotalArea && parentTotalArea > 0
		? Math.round((totalArea / parentTotalArea) * 100)
		: null;
	const displayStatus = isSplitParent ? 'Completed' : card.status;

	if (isChildSplit) {
		return (
			<div
				role="button"
				tabIndex={0}
				onClick={() => onSelect(card.id)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(card.id); }
				}}
				className={cn(
					'rounded-lg border cursor-pointer transition-all hover:shadow-sm flex-shrink-0 relative overflow-hidden flex flex-col',
					compact ? 'p-3 min-w-[240px] max-w-[240px]' : 'p-4 min-w-[300px] max-w-[300px]',
					isSelected ? 'border-[#3b82f6] shadow-sm' : 'border-[#e2e8f0]',
					'bg-white',
				)}
			>
				{card.trade_type && (
					<div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: tradeColor }} />
				)}

				{/* Row 1: Material name */}
				<div className="min-w-0">
					<span className="truncate text-[13px] font-medium text-[#1e293b] block">
						{card.trade_type ?? name}
					</span>
				</div>

				{/* Row 2: Hero area number */}
				<div className="mt-1.5 flex items-baseline gap-1.5">
					{totalArea > 0 ? (
						<>
							<span className="text-[20px] font-bold text-[#1e293b] tabular-nums leading-none">
								{totalArea.toLocaleString()}
							</span>
							<span className="text-[11px] text-[#94a3b8] font-medium">SQ</span>
							{pct !== null && (
								<span className="text-[11px] text-[#94a3b8] tabular-nums">· {pct}%</span>
							)}
						</>
					) : (
						<span className="text-[13px] text-[#94a3b8]">No area assigned</span>
					)}
				</div>

				{/* Row 3: Parent breadcrumb */}
				{parentName && (
					<div className="mt-auto pt-2 min-w-0">
						{onParentClick ? (
							<button
								type="button"
								onClick={(e) => { e.stopPropagation(); onParentClick(); }}
								className="text-[11px] text-[#3b82f6] hover:text-[#2563eb] hover:underline truncate block max-w-full cursor-pointer transition-colors text-left"
								title={`Go to ${parentName}`}
							>
								↳ {parentName}
							</button>
						) : (
							<span className="text-[11px] text-[#94a3b8] truncate block max-w-full" title={parentName}>
								↳ {parentName}
							</span>
						)}
					</div>
				)}
			</div>
		);
	}

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={() => onSelect(card.id)}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(card.id); }
			}}
			className={cn(
				'rounded-lg border cursor-pointer transition-all hover:shadow-sm flex-shrink-0 relative overflow-hidden',
				compact ? 'p-3 min-w-[240px] max-w-[240px]' : 'p-4',
				!compact && (totalCards <= 3 ? 'w-[300px]' : 'min-w-[300px] max-w-[300px]'),
				isSelected ? 'border-[#3b82f6] shadow-sm' : 'border-[#e2e8f0]',
				'bg-white',
			)}
		>
			{/* Title */}
			<div className="min-w-0">
				<span className="truncate text-[14px] font-medium text-[#1e293b] block" title={name}>
					{name}
				</span>
			</div>

			{/* Subtitle */}
			<div className="mt-1 text-[13px] text-[#94a3b8]">
				Order placed on {card.ordered_date}
			</div>

			{/* Bottom: Status (left) + Provider (right) */}
			<div className="mt-3 flex items-center justify-between">
				<span className="flex items-center gap-1.5">
					<StatusBadge status={displayStatus} />
					{isSplitParent && splitCount && (
						<span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]">
							Split · {splitCount}
						</span>
					)}
				</span>
				<ProviderLabel provider={isSplitParent ? 'HOVER' : card.provider} />
			</div>
		</div>
	);
}
