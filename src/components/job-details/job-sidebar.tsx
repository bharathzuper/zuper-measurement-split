'use client';

import { useState } from 'react';
import type { Job, JobDetailTab } from '@/lib/types';

const ACTION_ICONS = {
	updateStatus:
		'https://www.figma.com/api/mcp/asset/889e5c2a-0d7a-43af-9f2e-77aa2128ed32',
	reschedule:
		'https://www.figma.com/api/mcp/asset/54ba660f-3003-4e2b-956d-e64e3ba627a8',
	newAction:
		'https://www.figma.com/api/mcp/asset/df6d77e5-98f0-49cb-9168-264276ebfc4a',
	addNote:
		'https://www.figma.com/api/mcp/asset/1a4013da-40a1-4e9b-ae8d-6f05f42016a0',
} as const;

const NAV_ITEMS: {
	dataKey: JobDetailTab;
	label: string;
	icon: string;
	badge?: number;
}[] = [
	{
		dataKey: 'details',
		label: 'Details',
		icon: 'https://www.figma.com/api/mcp/asset/491ab1c7-f5a8-4ca7-9b5b-801331772e36',
	},
	{
		dataKey: 'line-items',
		label: 'Line Items',
		icon: 'https://www.figma.com/api/mcp/asset/a3aeed68-4093-43be-bc09-256ac639d1f6',
		badge: 1,
	},
	{
		dataKey: 'measurements',
		label: 'Measurements',
		icon: 'https://www.figma.com/api/mcp/asset/c351892f-45e7-40d7-b0f9-932f528cb233',
		badge: 1,
	},
	{
		dataKey: 'notes',
		label: 'Notes',
		icon: 'https://www.figma.com/api/mcp/asset/863fe41a-1f8a-4510-a289-58f8b66c171d',
	},
	{
		dataKey: 'activity',
		label: 'Activity',
		icon: 'https://www.figma.com/api/mcp/asset/584d09a8-0697-4a8c-b0b7-48e5fde551d6',
	},
	{
		dataKey: 'messages',
		label: 'Chat',
		icon: 'https://www.figma.com/api/mcp/asset/131deb60-f86c-4092-80f6-c0d9c6a7907e',
	},
	{
		dataKey: 'gallery',
		label: 'Gallery',
		icon: 'https://www.figma.com/api/mcp/asset/aa87b416-9ee0-449c-a718-8b580b9a6b82',
		badge: 6,
	},
];

const STATUS_HISTORY_MOCK = [
	{
		status_name: 'Yet to Start',
		created_at: 'Mar 5, 2026 09:00 AM',
		done_by: 'Admin User',
	},
	{
		status_name: 'In Progress',
		created_at: 'Mar 7, 2026 10:30 AM',
		done_by: 'John Smith',
	},
	{
		status_name: 'Measurement Ordered',
		created_at: 'Mar 8, 2026 02:15 PM',
		done_by: 'John Smith',
	},
];

function formatJobValue(total: number | undefined): string {
	if (total == null) {
		return '—';
	}
	return `$${total.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
}

export function JobSidebar({
	job,
	activeTab,
	onTabChange,
}: {
	job: Job;
	activeTab: JobDetailTab;
	onTabChange: (tab: JobDetailTab) => void;
}) {
	const [leftPanelTab, setLeftPanelTab] = useState<
		'NAVIGATION' | 'STATUS_HISTORY'
	>('NAVIGATION');

	const selectedNavIndex = NAV_ITEMS.findIndex(item => item.dataKey === activeTab);
	const highlightOffset = selectedNavIndex >= 0 ? selectedNavIndex * 49 : 0;
	const showHighlight = selectedNavIndex >= 0;

	const scheduleLine = [job.scheduled_start_time, job.scheduled_end_time]
		.filter(Boolean)
		.join(' → ');

	return (
		<div className="flex h-full flex-col overflow-y-auto overflow-x-hidden bg-white">
			{/* Header — job info */}
			<div className="border-b border-[#e2e8f0] bg-white px-[14px]">
				<div className="px-[10.5px] pb-[10.5px] pt-[28px]">
					<div className="mb-0 flex justify-between gap-2">
						<span className="text-[14px] font-normal text-[#64748b]">
							#{job.prefix} {job.work_order_number}
						</span>
						<span
							className="inline-flex shrink-0 items-center rounded-[3.5px] border border-[#1abc9c] bg-[rgba(26,188,156,0.15)] px-2 py-0.5 text-[12.6px] font-medium capitalize text-[#1abc9c]"
						>
							{job.current_job_status?.status_name ?? 'Copy Field'}
						</span>
					</div>
					<h2 className="mt-3 text-center text-[17.5px] font-bold text-[#1e293b]">
						{job.job_title}
					</h2>
					<div className="mt-2 flex w-full items-center justify-center gap-1.5">
						<span className="text-[12.6px] font-normal text-[#1e293b]">
							Job Value:
						</span>
						<span className="text-[12.6px] text-[#ef4444]">
							{formatJobValue(job.job_total)}
						</span>
					</div>
					{scheduleLine ? (
						<p className="mt-2 text-center text-[12.6px] text-[#334155]">
							{scheduleLine}
						</p>
					) : null}
				</div>

				{/* Action buttons — 4 columns */}
				<div className="grid w-full grid-cols-4 gap-2 pb-[10.5px] pt-2">
					{(
						[
							{ src: ACTION_ICONS.updateStatus, label: 'Update Status' },
							{ src: ACTION_ICONS.reschedule, label: 'Reschedule' },
							{ src: ACTION_ICONS.newAction, label: 'New' },
							{ src: ACTION_ICONS.addNote, label: 'Add Note' },
						] as const
					).map(action => (
						<button
							key={action.label}
							type="button"
							className="flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005aa3] focus-visible:ring-offset-2"
						>
							<span className="flex size-[38px] items-center justify-center rounded-[10.5px] bg-[#fcede8] p-[7px]">
								<img
									src={action.src}
									alt=""
									width={24}
									height={24}
									className="size-6"
								/>
							</span>
							<span className="text-center text-[11.4px] text-[#1e293b]">
								{action.label}
							</span>
						</button>
					))}
				</div>
			</div>

			{/* Navigation / Status History tabs */}
			<div className="flex h-[42px] shrink-0 items-end bg-white">
				<button
					type="button"
					onClick={() => setLeftPanelTab('NAVIGATION')}
					className={`flex h-full flex-col justify-end px-[16px] pb-0 text-[14px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#005aa3] ${
						leftPanelTab === 'NAVIGATION'
							? 'text-[#334155]'
							: 'text-[#64748b]'
					}`}
				>
					<span className="pb-2">Navigation</span>
					{leftPanelTab === 'NAVIGATION' ? (
						<span className="h-[2px] w-full bg-[#e44a19]" aria-hidden />
					) : (
						<span className="h-[2px] w-full bg-transparent" aria-hidden />
					)}
				</button>
				<button
					type="button"
					onClick={() => setLeftPanelTab('STATUS_HISTORY')}
					className={`flex h-full flex-col justify-end pl-[21px] pr-[16px] pb-0 text-[14px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#005aa3] ${
						leftPanelTab === 'STATUS_HISTORY'
							? 'text-[#334155]'
							: 'text-[#64748b]'
					}`}
				>
					<span className="pb-2">Status History</span>
					{leftPanelTab === 'STATUS_HISTORY' ? (
						<span className="h-[2px] w-full bg-[#e44a19]" aria-hidden />
					) : (
						<span className="h-[2px] w-full bg-transparent" aria-hidden />
					)}
				</button>
			</div>

			{leftPanelTab === 'NAVIGATION' && (
				<div className="px-[14px] pb-6 pt-2">
					<nav className="relative" aria-label="Job sections">
						{showHighlight && (
							<div
								className="pointer-events-none absolute left-0 right-0 top-0 h-[49px] rounded-[7px] border border-[#b3ddff] bg-[#e8f4fd] transition-transform duration-150 ease-out"
								style={{ transform: `translateY(${highlightOffset}px)` }}
								aria-hidden
							/>
						)}
						<ul className="relative m-0 list-none p-0">
							{NAV_ITEMS.map(item => {
								const isActive = activeTab === item.dataKey;
								return (
									<li key={item.dataKey} className="h-[49px]">
										<button
											type="button"
											onClick={() => onTabChange(item.dataKey)}
											className="flex h-full w-full items-center justify-between px-[17.5px] pb-[11px] pt-[14px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#005aa3]"
										>
											<span className="flex min-w-0 flex-1 items-center gap-2">
												<img
													src={item.icon}
													alt=""
													width={24}
													height={24}
													className="size-6 shrink-0"
												/>
												<span
													className={`truncate text-[14px] ${
														isActive
															? 'font-semibold text-[#005aa3]'
															: 'font-normal text-[#334155]'
													}`}
												>
													{item.label}
												</span>
											</span>
											{item.badge != null ? (
												<span className="ml-2 inline-flex min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-[rgba(0,90,163,0.15)] px-1.5 py-0.5 text-[11.4px] font-medium text-[#005aa3]">
													{item.badge}
												</span>
											) : null}
										</button>
									</li>
								);
							})}
						</ul>
					</nav>
				</div>
			)}

			{leftPanelTab === 'STATUS_HISTORY' && (
				<div className="relative flex flex-col gap-4 px-[14px] pb-6 pt-2">
					<div
						className="absolute bottom-0 left-[30px] top-2 w-px bg-[#e2e8f0]"
						aria-hidden
					/>
					{STATUS_HISTORY_MOCK.map((row, i) => (
						<div key={i} className="relative z-[1] pl-8">
							<div className="absolute left-0 top-3 size-2 rounded-full border-2 border-[#005aa3] bg-white" />
							<div className="rounded-lg border border-[#e2e8f0] bg-white p-3 shadow-sm">
								<p className="text-[14px] font-medium text-[#1e293b]">
									{row.status_name}
								</p>
								<p className="mt-1 text-[12.6px] text-[#64748b]">
									{row.created_at}
								</p>
								<p className="mt-0.5 text-[12.6px] text-[#64748b]">
									{row.done_by}
								</p>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
