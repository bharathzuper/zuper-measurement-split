'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MEASUREMENT_GROUPS } from '@/lib/mock-data';
import type { MeasurementGroup } from '@/lib/types';

interface EditMeasurementDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	focusGroupId?: string | null;
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 16 16"
			fill="none"
			className={`shrink-0 transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : ''}`}
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

function DrawerGroup({
	group,
	defaultOpen,
	searchQuery,
}: {
	group: MeasurementGroup;
	defaultOpen: boolean;
	searchQuery: string;
}) {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const [values, setValues] = useState<Record<string, string>>({});

	const filteredMeasurements = useMemo(() => {
		if (!searchQuery.trim()) return group.measurements;
		const q = searchQuery.toLowerCase();
		return group.measurements.filter((m) =>
			m.name.toLowerCase().includes(q)
		);
	}, [group.measurements, searchQuery]);

	const handleValueChange = useCallback((name: string, val: string) => {
		setValues((prev) => ({ ...prev, [name]: val }));
	}, []);

	if (searchQuery.trim() && filteredMeasurements.length === 0) {
		return null;
	}

	return (
		<div className="border-b border-[#e5e7eb] last:border-b-0">
			<button
				type="button"
				onClick={() => setIsOpen((p) => !p)}
				className="flex w-full items-center gap-2.5 px-5 py-3 text-left transition-colors hover:bg-[#f8fafc] cursor-pointer"
			>
				<span className="text-[13px] font-semibold text-[#334155]">
					{group.name}
				</span>
				<span className="inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#dbeafe] px-1.5 text-[10px] font-bold text-[#3b82f6]">
					{group.count}
				</span>
				<span className="ml-auto">
					<ChevronIcon isOpen={isOpen} />
				</span>
			</button>

			{isOpen && (
				<div>
					<div className="grid grid-cols-[1fr_auto_auto] items-center border-b border-[#e5e7eb] bg-[#f8fafc] px-5 py-2">
						<span className="text-[12px] font-semibold text-[#64748b]">
							Measurement
						</span>
						<span className="w-[100px] text-right text-[12px] font-semibold text-[#64748b]">
							Value
						</span>
						<span className="w-[40px]" />
					</div>

					{filteredMeasurements.map((row) => (
						<div
							key={row.name}
							className="grid grid-cols-[1fr_auto_auto] items-center border-b border-[#f1f5f9] px-5 py-2 last:border-b-0"
						>
							<span className="text-[13px] text-[#334155] pr-3">
								{row.name}
							</span>
							<input
								type="text"
								value={values[row.name] ?? ''}
								onChange={(e) =>
									handleValueChange(row.name, e.target.value)
								}
								className="h-[32px] w-[80px] rounded border border-[#e2e8f0] bg-white px-2 text-[13px] text-[#334155] text-right tabular-nums outline-none transition-colors focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
								placeholder=""
							/>
							<span className="w-[40px] text-right text-[12px] font-medium text-[#94a3b8]">
								{row.unit}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export function EditMeasurementDrawer({
	isOpen,
	onClose,
	focusGroupId,
}: EditMeasurementDrawerProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const drawerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) {
			setSearchQuery('');
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', handleEsc);
		return () => document.removeEventListener('keydown', handleEsc);
	}, [isOpen, onClose]);

	const editableGroups = MEASUREMENT_GROUPS.filter(
		(g) => g.status !== 'Deleted'
	);

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-[100] bg-black/40 transition-opacity"
				onClick={onClose}
				aria-hidden
			/>

			{/* Drawer panel */}
			<div
				ref={drawerRef}
				className="fixed right-0 top-0 z-[101] flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl"
				role="dialog"
				aria-modal="true"
				aria-label="Edit Measurement"
			>
				{/* Header */}
				<div className="flex h-[56px] shrink-0 items-center justify-between border-b border-[#e5e7eb] px-5">
					<h2 className="text-[16px] font-semibold text-[#1e293b]">
						Edit Measurement
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="flex size-[32px] items-center justify-center rounded-full text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#1e293b]"
						aria-label="Close"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M18 6L6 18" />
							<path d="M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Search */}
				<div className="shrink-0 border-b border-[#e5e7eb] px-5 py-3">
					<div className="relative">
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#94a3b8"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
						>
							<circle cx="11" cy="11" r="8" />
							<path d="M21 21l-4.35-4.35" />
						</svg>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search Tokens"
							className="h-[36px] w-full rounded-md border border-[#e2e8f0] bg-white pl-9 pr-3 text-[13px] text-[#334155] placeholder-[#94a3b8] outline-none transition-colors focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
						/>
					</div>
				</div>

				{/* Scrollable group list */}
				<div className="flex-1 overflow-y-auto">
					{editableGroups.map((group) => (
						<DrawerGroup
							key={group.id}
							group={group}
							defaultOpen={
								focusGroupId
									? group.id === focusGroupId
									: group.id === editableGroups[0]?.id
							}
							searchQuery={searchQuery}
						/>
					))}
				</div>

				{/* Footer */}
				<div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#e5e7eb] px-5 py-3">
					<button
						type="button"
						onClick={onClose}
						className="h-[36px] rounded-md border border-[#e2e8f0] bg-white px-5 text-[13px] font-medium text-[#334155] transition-colors hover:bg-[#f8fafc]"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={onClose}
						className="h-[36px] rounded-md bg-[#e44a19] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#cc3f14]"
					>
						Save
					</button>
				</div>
			</div>
		</>
	);
}
