'use client';

import { useCallback, useRef, useState } from 'react';

const NO_TIMELOG_IMG =
	'https://www.figma.com/api/mcp/asset/4ec6e994-91f5-4331-a12c-ce85b1fd838f';

type SectionKey =
	| 'usersTeams'
	| 'timelog'
	| 'organization'
	| 'customer'
	| 'property'
	| 'tags';

type SectionMeta = {
	key: SectionKey;
	title: string;
	count: number | null;
};

const SECTIONS: readonly SectionMeta[] = [
	{ key: 'usersTeams', title: 'Users/Teams Assigned', count: 1 },
	{ key: 'timelog', title: 'Timelog Summary', count: 0 },
	{ key: 'organization', title: 'Organization', count: null },
	{ key: 'customer', title: 'Customer', count: null },
	{ key: 'property', title: 'Property', count: null },
	{ key: 'tags', title: 'Tags', count: null },
] as const;

/* ── Production-exact SVG icons (from tabler.svg & heroicons-outline.svg) ── */

function EmployeeAssignedIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
			<path d="M6 21v-2a4 4 0 0 1 4 -4h2.5" />
			<path d="M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879z" />
			<path d="M19 18v.01" />
		</svg>
	);
}

function TimelogIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			className={className}
		>
			<path
				d="M21 12.3C21.0603 10.4949 20.5761 8.71335 19.6104 7.18709C18.6446 5.66084 17.242 4.46045 15.5849 3.74203C13.9278 3.0236 12.0929 2.82038 10.3188 3.15877C8.54463 3.49717 6.91334 4.36153 5.63702 5.63946C4.3607 6.9174 3.49841 8.54978 3.16226 10.3244C2.82611 12.0989 3.03166 13.9336 3.75218 15.5898C4.47271 17.246 5.67486 18.6471 7.20234 19.6109C8.72982 20.5747 10.5119 21.0566 12.317 20.994"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12 7V12L14 14"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M16 19C16 19.7956 16.3161 20.5587 16.8787 21.1213C17.4413 21.6839 18.2044 22 19 22C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7956 22 19C22 18.2044 21.6839 17.4413 21.1213 16.8787C20.5587 16.3161 19.7956 16 19 16C18.2044 16 17.4413 16.3161 16.8787 16.8787C16.3161 17.4413 16 18.2044 16 19Z"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function OfficeBuildingIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			width="24"
			height="24"
			className={className}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
			/>
		</svg>
	);
}

function UsersIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
			<path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
			<path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
		</svg>
	);
}

function OfficeBuilding2Icon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="1.5"
			stroke="currentColor"
			width="24"
			height="24"
			className={className}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
			/>
		</svg>
	);
}

function TagIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			strokeWidth="2"
			stroke="currentColor"
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
			<path d="M4 7v3.859c0 .537 .213 1.052 .593 1.432l8.116 8.116a2.025 2.025 0 0 0 2.864 0l4.834 -4.834a2.025 2.025 0 0 0 0 -2.864l-8.117 -8.116a2.025 2.025 0 0 0 -1.431 -.593h-3.859a3 3 0 0 0 -3 3z" />
		</svg>
	);
}

const SECTION_ICON_MAP: Record<
	SectionKey,
	React.FC<{ className?: string }>
> = {
	usersTeams: EmployeeAssignedIcon,
	timelog: TimelogIcon,
	organization: OfficeBuildingIcon,
	customer: UsersIcon,
	property: OfficeBuilding2Icon,
	tags: TagIcon,
};

/* ── Action icons ── */

function EyeIcon() {
	return (
		<svg
			width="17"
			height="17"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-[#9ca3af]"
		>
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	);
}

function EditIcon() {
	return (
		<svg
			width="17"
			height="17"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-[#9ca3af]"
		>
			<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
		</svg>
	);
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 12 12"
			fill="none"
			className={`transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : ''}`}
		>
			<path
				d="M2.5 4.5L6 8L9.5 4.5"
				stroke="#1e293b"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

/* ── Section content components ── */

function UsersTeamsContent() {
	return (
		<div className="bg-[#f8fafc] px-[7px] py-[10.5px]">
			<div className="rounded-[5.25px] border border-[#e5e7eb] bg-white px-[8px] py-[11.5px]">
				<div className="flex items-center gap-[10px]">
					<div className="flex size-[42px] shrink-0 items-center justify-center rounded-[5.25px] bg-[#3498db] text-[28px] font-normal uppercase leading-none text-white">
						T
					</div>
					<p className="text-[14px] font-bold tracking-[0.25px] text-[#475569]">
						Team S
					</p>
				</div>
			</div>
		</div>
	);
}

function TimelogContent() {
	return (
		<div className="flex h-[210px] flex-col items-center justify-center">
			<img
				src={NO_TIMELOG_IMG}
				alt="No timelogs found"
				width={140}
				height={139}
				className="h-[139px] w-[140px] object-contain"
			/>
			<p className="mt-[14px] text-[12.6px] font-medium tracking-[0.25px] text-[#64748b]">
				No Timelogs Found
			</p>
		</div>
	);
}

function LocationPin() {
	return (
		<div className="flex size-[24.5px] shrink-0 items-center justify-center rounded-full bg-[#e2e8f0]">
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="#64748b"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
				<circle cx="12" cy="10" r="3" />
			</svg>
		</div>
	);
}

function OrganizationContent() {
	return (
		<div className="px-[7px] py-[5.25px]">
			<div className="flex items-center px-[14px] py-[7px]">
				<div className="flex size-[42px] shrink-0 items-center justify-center overflow-hidden rounded-[5.25px] bg-[#e2e8f0]">
					<span className="text-[21px] font-normal uppercase tracking-[0.25px] text-[#475569]">
						N
					</span>
				</div>
				<div className="max-w-[150px] px-[10.5px] py-[7px]">
					<p className="truncate text-[14px] font-bold tracking-[0.25px] text-[#334155]">
						{`Nachivel's Org`}
					</p>
				</div>
			</div>
			<div className="flex items-start p-[3.5px] px-[10.5px]">
				<LocationPin />
				<div className="flex flex-col justify-center pl-[17.5px]">
					<p className="text-[12.6px] font-normal leading-[21px] tracking-[0.25px] text-[#64748b]">
						Seattle–Tacoma International
						<br />
						Airport (SEA), International
						<br />
						Boulevard, WA, USA, SeaTa…
					</p>
				</div>
			</div>
		</div>
	);
}

function CustomerContent() {
	return (
		<div className="flex flex-col">
			<div className="px-[7px] py-[5.25px]">
				<div className="flex items-center px-[10.5px] py-[7px]">
					<div className="flex size-[42px] shrink-0 items-center justify-center overflow-hidden rounded-[7px] bg-[#e2e8f0]">
						<span className="text-[21px] font-normal uppercase tracking-[0.25px] text-[#475569]">
							A
						</span>
					</div>
					<div className="max-w-[150px] px-[10.5px] py-[7px]">
						<p className="truncate text-[14px] font-bold tracking-[0.25px] text-[#334155]">
							Another …
						</p>
					</div>
				</div>
				<div className="flex flex-col gap-0 px-[10.5px] pb-[7px]">
					<div className="flex items-start p-[3.5px]">
						<LocationPin />
						<div className="flex flex-col justify-center pl-[17.5px]">
							<p className="text-[12.6px] font-medium leading-[21px] tracking-[0.25px] text-[#64748b]">
								{`Nachivel's Org`}
							</p>
						</div>
					</div>
					<div className="flex min-h-[49px] items-start p-[3.5px]">
						<LocationPin />
						<div className="flex flex-col justify-center pl-[17.5px]">
							<p className="text-[12.6px] font-normal leading-[21px] tracking-[0.25px] text-[#475569]">
								Seattle, WA, USA, Seattle,
								<br />
								Washington, United States
							</p>
						</div>
					</div>
				</div>
			</div>
			<div className="flex h-[51.5px] border-t border-[#e5e7eb]">
				<div className="flex flex-1 flex-col items-center pb-[7px] pt-[3.5px]">
					<span className="text-[14px] font-medium tracking-[0.25px] text-[#64748b]">
						Credits
					</span>
					<span className="text-[14px] font-normal tracking-[0.25px] text-[#334155]">
						$2,956.300
					</span>
				</div>
				<div className="flex flex-1 flex-col items-center border-l border-[#e5e7eb] pb-[7px] pt-[3.5px]">
					<span className="text-[14px] font-medium tracking-[0.25px] text-[#64748b]">
						Receivables
					</span>
					<span className="text-[14px] font-normal tracking-[0.25px] text-[#334155]">
						$26,282.762
					</span>
				</div>
			</div>
		</div>
	);
}

const SECTION_CONTENT: Partial<Record<SectionKey, () => React.ReactNode>> = {
	usersTeams: () => <UsersTeamsContent />,
	timelog: () => <TimelogContent />,
	organization: () => <OrganizationContent />,
	customer: () => <CustomerContent />,
};

/* ── Main component ── */

export function RightSidebar() {
	const [expandedSections, setExpandedSections] = useState<Set<number>>(
		() => new Set([0])
	);
	const [activeRail, setActiveRail] = useState(0);
	const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

	const setSectionRef = useCallback(
		(index: number, el: HTMLDivElement | null) => {
			sectionRefs.current[index] = el;
		},
		[]
	);

	const toggleSection = useCallback((index: number) => {
		setExpandedSections((prev) => {
			const next = new Set(prev);
			if (next.has(index)) {
				next.delete(index);
			} else {
				next.add(index);
			}
			return next;
		});
	}, []);

	const handleRailSelect = useCallback((index: number) => {
		setActiveRail(index);
		setExpandedSections((prev) => {
			const next = new Set(prev);
			next.add(index);
			return next;
		});
		requestAnimationFrame(() => {
			sectionRefs.current[index]?.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		});
	}, []);

	return (
		<div className="flex h-full min-h-0 w-full">
			{/* Section panels */}
			<div
				className="min-h-0 w-[calc(100%-49px)] min-w-0 overflow-y-auto"
				role="region"
				aria-label="Job sidebar sections"
			>
				{SECTIONS.map((section, index) => {
					const isOpen = expandedSections.has(index);
					const contentRenderer = SECTION_CONTENT[section.key];
					const IconComponent = SECTION_ICON_MAP[section.key];

					return (
						<div
							key={section.key}
							ref={(el) => {
								setSectionRef(index, el);
							}}
							className="scroll-mt-0"
						>
							{/* Header */}
							<button
								type="button"
								onClick={() => toggleSection(index)}
								className="flex h-[45.5px] w-full shrink-0 cursor-pointer items-center border-b-[0.5px] border-[#e5e7eb] bg-white px-[7px] transition-colors duration-150 hover:bg-[#f8fafc]"
							>
								<div className="mr-[7px] flex h-[21px] w-[24px] shrink-0 items-center justify-center">
									<IconComponent className="h-[20px] w-[20px] text-[#64748b]" />
								</div>

								<span className="truncate text-[13px] font-medium leading-[19.5px] text-[#1e293b]">
									{section.title}
								</span>
								{section.count !== null && (
									<span className="ml-[3.5px] shrink-0 text-[13px] font-medium leading-[19.5px] text-[#1e293b]">
										({section.count})
									</span>
								)}

								<div className="flex-1" />

								<span
									className="flex size-[24.5px] shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[#e2e8f0]"
									role="img"
									aria-label="View"
									onClick={(e) => e.stopPropagation()}
								>
									<EyeIcon />
								</span>
								<span
									className="flex size-[24.5px] shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[#e2e8f0]"
									role="img"
									aria-label="Edit"
									onClick={(e) => e.stopPropagation()}
								>
									<EditIcon />
								</span>
								<span className="ml-[2px] flex size-[24.5px] shrink-0 items-center justify-center">
									<ChevronIcon isOpen={isOpen} />
								</span>
							</button>

							{/* Content */}
							{isOpen && contentRenderer ? (
								<div className="border-b-[0.5px] border-[#e5e7eb]">
									{contentRenderer()}
								</div>
							) : null}
						</div>
					);
				})}
			</div>

			{/* Icon rail */}
			<nav
				className="flex h-full min-h-0 w-[49px] shrink-0 flex-col border-l border-[#e5e7eb] bg-white px-[5px] py-[4px]"
				aria-label="Section shortcuts"
			>
				{SECTIONS.map((section, index) => {
					const isActive = activeRail === index;
					const IconComponent = SECTION_ICON_MAP[section.key];
					return (
						<button
							key={section.key}
							type="button"
							onClick={() => handleRailSelect(index)}
							title={section.title}
							aria-label={section.title}
							aria-pressed={isActive}
							className={`mx-auto my-[2px] flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[7px] transition-colors duration-150 ${
								isActive
									? 'bg-[#fcede8]'
									: 'bg-transparent hover:bg-[#f1f5f9]'
							}`}
						>
							<IconComponent
								className={`h-[20px] w-[20px] transition-colors duration-150 ${
									isActive ? 'text-[#e44a19]' : 'text-[#9ca3af]'
								}`}
							/>
						</button>
					);
				})}
			</nav>
		</div>
	);
}
