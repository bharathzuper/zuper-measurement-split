'use client';

import { useCallback, useState } from 'react';
import { MEASUREMENT_GROUPS, TOKEN_DEFINITIONS } from '@/lib/mock-data';
import type { MeasurementCard, MeasurementGroup } from '@/lib/types';
import { EditMeasurementDrawer } from './edit-measurement-drawer';

interface TokenTableProps {
	card: MeasurementCard;
	onValueChange?: (key: string, value: number) => void;
	readOnly?: boolean;
}

function EditPencilIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-[#94a3b8]"
		>
			<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
		</svg>
	);
}

function ChevronDown({ isOpen }: { isOpen: boolean }) {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			className={`transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : ''}`}
		>
			<path
				d="M4 6L8 10L12 6"
				stroke="#64748b"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function GroupCard({
	group,
	defaultOpen,
	onEditClick,
	readOnly,
}: {
	group: MeasurementGroup;
	defaultOpen: boolean;
	onEditClick: (groupId: string) => void;
	readOnly?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const isDeleted = group.status === 'Deleted';

	return (
		<div className="rounded-lg border border-[#e2e8f0] bg-white overflow-hidden">
			<button
				type="button"
				onClick={() => setIsOpen((p) => !p)}
				className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#f8fafc] cursor-pointer"
			>
				<span className="text-[14px] font-semibold text-[#334155]">
					{group.name}
				</span>
				<span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#dbeafe] px-1.5 text-[11px] font-bold text-[#3b82f6]">
					{group.count}
				</span>

				{isDeleted && (
					<span className="ml-auto mr-2 rounded border border-[#fecaca] bg-[#fef2f2] px-2 py-0.5 text-[11px] font-medium text-[#ef4444]">
						Deleted
					</span>
				)}

				<span className={`${isDeleted ? '' : 'ml-auto'} flex items-center gap-2`}>
					{!isDeleted && !readOnly && (
						<span
							className="flex size-[30px] items-center justify-center rounded-full transition-colors hover:bg-[#e2e8f0]"
							onClick={(e) => {
								e.stopPropagation();
								onEditClick(group.id);
							}}
							role="button"
							tabIndex={0}
							aria-label={`Edit ${group.name}`}
						>
							<EditPencilIcon />
						</span>
					)}
					<ChevronDown isOpen={isOpen} />
				</span>
			</button>

			{isOpen && (
				<div className="border-t border-[#e2e8f0]">
					<table className="w-full">
						<thead>
							<tr className="bg-[#f8fafc]">
								<th className="px-5 py-2.5 text-left text-[13px] font-semibold text-[#334155]">
									Measurement
								</th>
								<th className="px-5 py-2.5 text-left text-[13px] font-semibold text-[#334155]">
									Value
								</th>
							</tr>
						</thead>
						<tbody>
							{group.measurements.map((row, idx) => (
								<tr
									key={row.name}
									className={idx < group.measurements.length - 1 ? 'border-b border-[#f1f5f9]' : ''}
								>
									<td className="px-5 py-2.5 text-[13px] text-[#334155]">
										{row.name}
									</td>
									<td className="px-5 py-2.5 text-[13px] text-[#334155]">
										{row.value ?? '—'}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

export function TokenTable({ card, onValueChange, readOnly }: TokenTableProps) {
	const isSplitChild = !!card.parent_id;
	const [editOpen, setEditOpen] = useState(false);
	const [editGroupId, setEditGroupId] = useState<string | null>(null);

	const handleEditClick = useCallback((groupId: string) => {
		if (readOnly) return;
		setEditGroupId(groupId);
		setEditOpen(true);
	}, [readOnly]);

	const handleClose = useCallback(() => {
		setEditOpen(false);
		setEditGroupId(null);
	}, []);

	if (isSplitChild) {
		return <LegacyTokenTable card={card} onValueChange={onValueChange} />;
	}

	return (
		<>
			<div className="space-y-3">
				{MEASUREMENT_GROUPS.map((group, idx) => (
					<GroupCard
						key={group.id}
						group={group}
						defaultOpen={idx === 0}
						onEditClick={handleEditClick}
						readOnly={readOnly}
					/>
				))}
			</div>

			{!readOnly && (
				<EditMeasurementDrawer
					isOpen={editOpen}
					onClose={handleClose}
					focusGroupId={editGroupId}
				/>
			)}
		</>
	);
}

function LegacyTokenTable({ card, onValueChange }: TokenTableProps) {
	const [openGroups, setOpenGroups] = useState<Set<string>>(
		new Set(MEASUREMENT_GROUPS.map(g => g.id))
	);

	const toggleGroup = (id: string) => {
		setOpenGroups(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	return (
		<div className="space-y-3">
			{MEASUREMENT_GROUPS.map((group) => {
				const isOpen = openGroups.has(group.id);
				return (
					<div key={group.id} className="rounded-lg border border-[#e2e8f0] bg-white overflow-hidden">
						<button
							type="button"
							onClick={() => toggleGroup(group.id)}
							className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#f8fafc] cursor-pointer"
						>
							<span className="text-[14px] font-semibold text-[#334155]">{group.name}</span>
							<span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#dbeafe] px-1.5 text-[11px] font-bold text-[#3b82f6]">
								{group.count}
							</span>
							<span className="ml-auto flex items-center gap-2">
								{onValueChange && (
									<span
										className="flex size-[30px] items-center justify-center rounded-full transition-colors hover:bg-[#e2e8f0]"
										onClick={(e) => { e.stopPropagation(); }}
									>
										<EditPencilIcon />
									</span>
								)}
								<ChevronDown isOpen={isOpen} />
							</span>
						</button>

						{isOpen && (
							<div className="border-t border-[#e2e8f0]">
								<table className="w-full">
									<thead>
										<tr className="bg-[#f8fafc]">
											<th className="px-5 py-2.5 text-left text-[13px] font-semibold text-[#334155]">Measurement</th>
											<th className="px-5 py-2.5 text-left text-[13px] font-semibold text-[#334155]">Value</th>
										</tr>
									</thead>
									<tbody>
										{group.measurements.map((row, idx) => {
											const value = row.value != null && row.value !== '' ? parseFloat(String(row.value)) : undefined;
											return (
												<tr key={row.name} className={idx < group.measurements.length - 1 ? 'border-b border-[#f1f5f9]' : ''}>
													<td className="px-5 py-2.5 text-[13px] text-[#334155]">{row.name}</td>
													<td className="px-5 py-2.5 text-[13px] text-[#334155] tabular-nums">
														{value !== undefined ? value.toLocaleString() : '—'}
													</td>
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
