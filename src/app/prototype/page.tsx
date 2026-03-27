'use client';

import { useState } from 'react';
import { DarkNav } from '@/components/app-shell/dark-nav';
import { TopBar } from '@/components/app-shell/top-bar';
import { JobTopbar } from '@/components/job-details/job-topbar';
import { JobSidebar } from '@/components/job-details/job-sidebar';
import { RightSidebar } from '@/components/job-details/right-sidebar';
import { MeasurementTab } from '@/components/measurements/measurement-tab';
import { mockJob } from '@/lib/mock-data';
import type { JobDetailTab } from '@/lib/types';

export default function PrototypePage() {
	const [activeTab, setActiveTab] = useState<JobDetailTab>('measurements');

	return (
		<div className="flex h-screen overflow-hidden">
			<DarkNav />

			<div className="flex flex-col flex-auto w-full min-w-0 overflow-hidden">
				<TopBar job={mockJob} />

				<div>
					<JobTopbar job={mockJob} />
				</div>

				<div className="flex flex-col flex-auto min-h-0">
					<div className="overflow-hidden h-full relative flex-1 min-h-0">
						<div className="flex h-full min-h-0">
							<div
								className="overflow-hidden"
								style={{ width: '75%', minWidth: '70%' }}
							>
								<div className="w-full flex items-stretch h-full min-h-0">
									<JobSidebar job={mockJob} activeTab={activeTab} onTabChange={setActiveTab} />
									<div className="details-center-panel-container overflow-hidden bg-detail-page h-full min-h-0 flex flex-col">
										{activeTab === 'measurements' ? (
											<MeasurementTab />
										) : (
											<PlaceholderTab />
										)}
									</div>
								</div>
							</div>
							<div
								className="w-full overflow-y-auto zuper-sidebar-scroller bg-white border-l"
								style={{ width: '25%', minWidth: '20%' }}
							>
								<RightSidebar />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function PlaceholderTab() {
	return (
		<div className="flex flex-1 items-center justify-center min-h-0">
			<p className="text-sm text-gray-500">Not part of this prototype</p>
		</div>
	);
}
