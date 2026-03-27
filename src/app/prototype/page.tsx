'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DarkNav } from '@/components/app-shell/dark-nav';
import { TopBar } from '@/components/app-shell/top-bar';
import { JobTopbar } from '@/components/job-details/job-topbar';
import { JobSidebar } from '@/components/job-details/job-sidebar';
import { RightSidebar } from '@/components/job-details/right-sidebar';
import { MeasurementTab } from '@/components/measurements/measurement-tab';
import { FeatureOnboarding, useFeatureOnboarding } from '@/components/onboarding/feature-onboarding';
import { mockJob } from '@/lib/mock-data';
import type { JobDetailTab } from '@/lib/types';

export default function PrototypePage() {
	const [activeTab, setActiveTab] = useState<JobDetailTab>('measurements');
	const onboarding = useFeatureOnboarding();
	const [guidedStep, setGuidedStep] = useState(0);

	const handleOnboardingDismiss = useCallback(() => {
		onboarding.dismiss();
		setTimeout(() => setGuidedStep(1), 600);
	}, [onboarding]);

	const handleReplay = useCallback(() => {
		setGuidedStep(0);
		onboarding.reset();
	}, [onboarding]);

	return (
		<div className="flex h-screen overflow-hidden">
			<AnimatePresence>
				{onboarding.show && <FeatureOnboarding onDismiss={handleOnboardingDismiss} />}
			</AnimatePresence>

			{/* Replay onboarding FAB */}
			{!onboarding.show && (
				<button
					onClick={handleReplay}
					title="Replay onboarding"
					className="fixed bottom-4 right-4 z-[999] size-9 rounded-full bg-[#0f172a] border border-white/10 shadow-lg shadow-black/20 flex items-center justify-center hover:bg-[#1e293b] transition-colors cursor-pointer group"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-180 transition-transform duration-500">
						<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
					</svg>
				</button>
			)}

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
										<MeasurementTab guidedStep={guidedStep} onGuidedStepChange={setGuidedStep} />
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
