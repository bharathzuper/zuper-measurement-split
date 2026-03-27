'use client';

import type { Job } from '@/lib/types';

interface TopBarProps {
	job: Job;
}

export function TopBar({ job }: TopBarProps) {
	return (
		<header
			className="flex h-[49px] w-full items-center justify-center border-b border-[#e5e7eb] bg-white px-[21px]"
			aria-label={`Global header for ${job.job_title}`}
		>
			<div className="flex h-full w-full min-w-0 items-center gap-0">
				{/* Company logo */}
				<div className="flex h-[49px] w-[62.63px] shrink-0 items-center justify-center py-[7px]">
					<img
						src="https://www.figma.com/api/mcp/asset/465fe297-4c64-48bd-a152-7f37252f488f"
						alt="Company logo"
						className="h-[30px] w-auto object-contain"
					/>
				</div>

				{/* New */}
				<div className="flex h-full shrink-0 items-stretch">
					<button
						type="button"
						className="flex h-full items-center rounded-[5.25px] bg-white px-[14px] font-['Inter'] text-[12.6px] font-medium text-[#334155]"
					>
						<span>New</span>
						<img
							src="https://www.figma.com/api/mcp/asset/c0fe7bea-5c8b-47df-83cd-0546938e4e8a"
							alt=""
							width={13}
							height={12.73}
							className="ml-1 -scale-y-100"
						/>
					</button>
				</div>

				{/* Search */}
				<div className="flex min-w-0 flex-1 items-center justify-center px-2">
					<div className="relative w-full max-w-[392px]">
						<img
							src="https://www.figma.com/api/mcp/asset/0849a077-b6cd-4a57-8946-90dd448e21ee"
							alt=""
							width={17.5}
							height={17.5}
							className="pointer-events-none absolute left-[10px] top-1/2 -translate-y-1/2"
						/>
						<label htmlFor="top-bar-search" className="sr-only">
							Search
						</label>
						<input
							id="top-bar-search"
							type="search"
							name="search"
							placeholder="Search"
							autoComplete="off"
							className="w-full rounded-[5.25px] border border-[#cbd5e1] py-[8px] pl-[36px] pr-[72px] text-[14px] text-[#64748b] placeholder:text-[#64748b] focus:outline-none"
						/>
						<div className="pointer-events-none absolute right-[8px] top-1/2 flex -translate-y-1/2 items-center gap-[3.5px]">
							<kbd className="inline-flex h-[21px] min-w-[21px] items-center justify-center rounded-[3.5px] border border-[#cbd5e1] bg-white px-[4px] font-['Menlo'] text-[8.8px] text-[#64748b]">
								⌘
							</kbd>
							<kbd className="inline-flex h-[21px] min-w-[21px] items-center justify-center rounded-[3.5px] border border-[#cbd5e1] bg-white px-[4px] font-['Menlo'] text-[8.8px] text-[#64748b]">
								K
							</kbd>
						</div>
					</div>
				</div>

				{/* Right actions */}
				<div className="flex shrink-0 items-center gap-1">
					<button
						type="button"
						className="relative flex h-[49px] w-10 items-center justify-center rounded-md hover:bg-slate-50"
						aria-label="Tasking"
					>
						<img
							src="https://www.figma.com/api/mcp/asset/5515188c-d711-4512-8d86-6fad237e87c9"
							alt=""
							width={24}
							height={24}
						/>
						<span className="absolute right-0 top-2 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#4f46e5] px-[4px] text-[10px] font-medium leading-none text-[#eef2ff]">
							26
						</span>
					</button>
					<button
						type="button"
						className="flex h-[49px] w-10 items-center justify-center rounded-md hover:bg-slate-50"
						aria-label="Broadcast"
					>
						<img
							src="https://www.figma.com/api/mcp/asset/2e1e0e0c-0a1c-45de-866d-164deb2d6737"
							alt=""
							width={24}
							height={24}
						/>
					</button>
					<button
						type="button"
						className="relative flex h-[49px] w-10 items-center justify-center rounded-md hover:bg-slate-50"
						aria-label="Messages"
					>
						<img
							src="https://www.figma.com/api/mcp/asset/17ff5cde-c3fb-4358-bc9a-75743b8dc718"
							alt=""
							width={24}
							height={24}
						/>
						<span className="absolute right-0 top-2 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#4f46e5] px-[4px] text-[10px] font-medium leading-none text-[#eef2ff]">
							105
						</span>
					</button>
					<button
						type="button"
						className="relative flex h-[49px] w-10 items-center justify-center rounded-md hover:bg-slate-50"
						aria-label="Notifications"
					>
						<img
							src="https://www.figma.com/api/mcp/asset/83f32ba2-ad37-476e-a307-612de800cecf"
							alt=""
							width={24}
							height={24}
						/>
						<span className="absolute right-0 top-2 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#4f46e5] px-[4px] text-[10px] font-medium leading-none text-[#eef2ff]">
							8
						</span>
					</button>
					<button
						type="button"
						className="ml-1 flex size-[35px] shrink-0 items-center justify-center rounded-full bg-[#e2e8f0] text-[28px] font-normal uppercase leading-none text-[#475569]"
						aria-label="Account"
					>
						B
					</button>
				</div>
			</div>
		</header>
	);
}
