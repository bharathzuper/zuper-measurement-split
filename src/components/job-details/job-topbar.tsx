'use client';

import type { Job } from '@/lib/types';

interface JobTopbarProps {
	job: Job;
}

export function JobTopbar({ job }: JobTopbarProps) {
	return (
		<div className="flex h-[49px] w-full items-center border-b border-[#e5e7eb] bg-white pb-px">
			<nav className="flex min-w-0 flex-1 items-center py-[14px]" aria-label="Breadcrumb">
				<ol className="flex min-w-0 items-center gap-0 px-4 sm:px-6 lg:px-6">
					<li className="flex shrink-0">
						<span className="cursor-pointer font-['Inter'] text-[15.8px] font-normal leading-[23.63px] text-[#334155]">
							Jobs
						</span>
					</li>
					<li className="flex min-w-0 items-center">
						<img
							src="https://www.figma.com/api/mcp/asset/6a36f6dc-7288-403b-808c-2624374863b5"
							alt=""
							width={21}
							height={21}
							className="mx-1 shrink-0"
						/>
						<span
							className="max-w-[420px] truncate font-['Inter'] text-[15.8px] font-medium leading-[23.63px] text-[#334155]"
							title={job.job_title}
						>
							{job.job_title}
						</span>
					</li>
				</ol>
			</nav>

			<div className="flex shrink-0 items-center gap-2 pr-4 sm:pr-6">
				<button
					type="button"
					className="inline-flex items-center rounded-[5.25px] border border-[#cbd5e1] bg-white px-[15px] py-[11.5px] font-['Inter'] text-[12.6px] font-medium text-[#334155]"
				>
					Print/Share
				</button>
				<button
					type="button"
					className="inline-flex items-center gap-1 rounded-[5.25px] border border-[#cbd5e1] bg-white px-[15px] py-[11.5px] font-['Inter'] text-[12.6px] font-medium text-[#334155]"
				>
					More Actions
					<img
						src="https://www.figma.com/api/mcp/asset/0f64ac32-05cb-4a6c-9bbf-9b4b0b4e5c09"
						alt=""
						width={13}
						height={12.73}
						className="-scale-y-100"
					/>
				</button>
			</div>
		</div>
	);
}
