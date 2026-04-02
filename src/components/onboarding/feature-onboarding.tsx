'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';

const STORAGE_KEY = 'zuper_split_onboarding_seen';

const SPARKLE_PATH = 'M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z';

/* ────────── Animated Illustrations ────────── */

function SplitCardAnimation() {
	return (
		<div className="relative w-full h-[200px] flex items-center justify-center">
			{/* Soft dot grid */}
			<svg className="absolute inset-0 w-full h-full opacity-[0.35]" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
						<circle cx="2" cy="2" r="0.6" fill="#cbd5e1" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#grid)" />
			</svg>

			{/* Central parent card */}
			<motion.div
				className="absolute"
				initial={{ scale: 1, x: 0, opacity: 1 }}
				animate={{ scale: 0.85, x: 0, y: -22, opacity: 0.35 }}
				transition={{ delay: 1.2, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
			>
				<div className="w-[140px] h-[88px] rounded-xl bg-white border border-[#e2e8f0] shadow-md flex flex-col items-center justify-center gap-1.5">
					<div className="flex items-center gap-1.5">
						<div className="size-2 rounded-full bg-[#f59e0b]" />
						<span className="text-[10px] font-semibold text-[#64748b] tracking-wide uppercase">Full Report</span>
					</div>
					<div className="text-[18px] font-bold text-[#0f172a] tabular-nums">2,847 SQ</div>
					<div className="flex gap-1">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="w-6 h-[3px] rounded-full bg-[#e2e8f0]" />
						))}
					</div>
				</div>
			</motion.div>

			{/* Split burst ring */}
			<motion.div
				className="absolute"
				initial={{ opacity: 0, scale: 0 }}
				animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.5, 2] }}
				transition={{ delay: 1.0, duration: 0.6, ease: 'easeOut' }}
			>
				<div className="size-[80px] rounded-full border-2 border-[#f59e0b]/30" />
			</motion.div>

			{/* Child card 1 — Split 1 */}
			<motion.div
				className="absolute"
				initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
				animate={{ opacity: 1, scale: 1, x: -100, y: 30 }}
				transition={{ delay: 1.6, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
			>
				<div className="w-[120px] h-[78px] rounded-xl bg-white border border-[#e2e8f0] shadow-lg shadow-[#4F46E5]/[0.06] flex flex-col items-center justify-center gap-1 relative overflow-hidden">
					<div className="absolute top-0 left-0 w-full h-[3px] bg-[#4F46E5]" />
					<div className="flex items-center gap-1 mt-0.5">
						<div className="size-1.5 rounded-full bg-[#4F46E5]" />
						<span className="text-[9px] font-semibold text-[#64748b] tracking-wide uppercase">Split 1</span>
					</div>
					<motion.div
						className="text-[16px] font-bold text-[#0f172a] tabular-nums"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 2.2, duration: 0.3 }}
					>
						1,923 SQ
					</motion.div>
					<motion.div
						className="h-[3px] w-12 rounded-full bg-[#f1f5f9] overflow-hidden"
						initial={{ width: 0 }}
						animate={{ width: 48 }}
						transition={{ delay: 2.4, duration: 0.5 }}
					>
						<motion.div
							className="h-full bg-[#4F46E5]/40 rounded-full"
							initial={{ width: '0%' }}
							animate={{ width: '68%' }}
							transition={{ delay: 2.6, duration: 0.6, ease: 'easeOut' }}
						/>
					</motion.div>
				</div>
			</motion.div>

			{/* Child card 2 — Split 2 */}
			<motion.div
				className="absolute"
				initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
				animate={{ opacity: 1, scale: 1, x: 80, y: 50 }}
				transition={{ delay: 1.8, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
			>
				<div className="w-[120px] h-[78px] rounded-xl bg-white border border-[#e2e8f0] shadow-lg shadow-[#E18026]/[0.06] flex flex-col items-center justify-center gap-1 relative overflow-hidden">
					<div className="absolute top-0 left-0 w-full h-[3px] bg-[#E18026]" />
					<div className="flex items-center gap-1 mt-0.5">
						<div className="size-1.5 rounded-full bg-[#E18026]" />
						<span className="text-[9px] font-semibold text-[#64748b] tracking-wide uppercase">Split 2</span>
					</div>
					<motion.div
						className="text-[16px] font-bold text-[#0f172a] tabular-nums"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 2.4, duration: 0.3 }}
					>
						924 SQ
					</motion.div>
					<motion.div
						className="h-[3px] w-12 rounded-full bg-[#f1f5f9] overflow-hidden"
						initial={{ width: 0 }}
						animate={{ width: 48 }}
						transition={{ delay: 2.6, duration: 0.5 }}
					>
						<motion.div
							className="h-full bg-[#E18026]/40 rounded-full"
							initial={{ width: '0%' }}
							animate={{ width: '32%' }}
							transition={{ delay: 2.8, duration: 0.6, ease: 'easeOut' }}
						/>
					</motion.div>
				</div>
			</motion.div>

			{/* Connecting dashed lines */}
			<svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
				<motion.line
					x1="50%" y1="38%" x2="32%" y2="65%"
					stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 0.35 }}
					transition={{ delay: 1.5, duration: 0.6 }}
				/>
				<motion.line
					x1="50%" y1="38%" x2="65%" y2="72%"
					stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 0.35 }}
					transition={{ delay: 1.7, duration: 0.6 }}
				/>
			</svg>
		</div>
	);
}

function PrimarySplitAnimation() {
	return (
		<div className="relative w-full h-[200px] flex items-center justify-center">
			<svg className="absolute inset-0 w-full h-full opacity-[0.3]" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<pattern id="grid2" width="20" height="20" patternUnits="userSpaceOnUse">
						<circle cx="2" cy="2" r="0.6" fill="#cbd5e1" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#grid2)" />
			</svg>

			{/* Table representation */}
			<div className="flex flex-col gap-0 w-[280px] rounded-lg overflow-hidden shadow-md border border-[#e2e8f0]">
				{/* Header row */}
				<motion.div
					className="flex items-center"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.5 }}
				>
					<div className="flex-1 px-3 py-2 bg-[#f8fafc] text-[9px] font-semibold text-[#64748b] uppercase tracking-wider border-b border-[#e2e8f0]">Token</div>
					<div className="w-[72px] px-2 py-2 bg-[#f8fafc] text-[9px] font-semibold text-[#64748b] uppercase tracking-wider text-center border-b border-[#e2e8f0]">Total</div>
					<div className="w-[72px] px-2 py-2 bg-[#eef2ff] text-[9px] font-semibold text-[#4F46E5] uppercase tracking-wider text-center flex items-center justify-center gap-1 border-b border-[#c7d2fe]">
						Split 1
					</div>
					<div className="w-[72px] px-2 py-2 bg-[#fff7ed] text-[9px] font-semibold text-[#E18026] uppercase tracking-wider text-center border-b border-[#fed7aa]">Split 2</div>
				</motion.div>

				{/* Row data */}
				{[
					{ label: 'Total Roof Area', total: '21.97', secondary: '8.42' },
					{ label: 'Total Ridges', total: '138.00', secondary: '52.00' },
					{ label: 'Total Eaves', total: '267.00', secondary: '89.00' },
				].map((row, i) => (
					<motion.div
						key={row.label}
						className="flex items-center border-b border-[#f1f5f9] last:border-b-0"
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }}
					>
						<div className="flex-1 px-3 py-2 bg-white text-[10px] text-[#475569] truncate">{row.label}</div>
						<div className="w-[72px] px-2 py-2 bg-white text-[10px] text-[#94a3b8] text-center tabular-nums">{row.total}</div>
						<div className="w-[72px] px-2 py-2 bg-[#eef2ff]/40 text-center">
							<motion.span
								className="text-[10px] text-[#4F46E5] font-semibold tabular-nums"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 1.8 + i * 0.2, duration: 0.3 }}
							>
								{(parseFloat(row.total) - parseFloat(row.secondary)).toFixed(2)}
							</motion.span>
						</div>
						<div className="w-[72px] px-2 py-2 bg-[#fff7ed]/40 text-center">
							<motion.span
								className="text-[10px] text-[#E18026] tabular-nums"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 1.2 + i * 0.15, duration: 0.3 }}
							>
								{row.secondary}
							</motion.span>
						</div>
					</motion.div>
				))}
			</div>

			{/* Auto-calculate flash */}
			<motion.div
				className="absolute left-[calc(50%-20px)] top-[58%] -translate-x-1/2"
				initial={{ opacity: 0, scale: 0 }}
				animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.8] }}
				transition={{ delay: 1.6, duration: 1.2, ease: 'easeOut' }}
			>
				<div className="flex items-center gap-1 bg-[#fffbeb] border border-[#fde68a] rounded-full px-2.5 py-1 shadow-sm">
					<svg width="10" height="10" viewBox="0 0 24 24" fill="none">
						<path d={SPARKLE_PATH} fill="#f59e0b" />
					</svg>
					<span className="text-[9px] font-semibold text-[#b45309]">Auto-filled</span>
				</div>
			</motion.div>
		</div>
	);
}

function ConnectedCardsAnimation() {
	return (
		<div className="relative w-full h-[200px] flex items-center justify-center">
			<svg className="absolute inset-0 w-full h-full opacity-[0.3]" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<pattern id="grid3" width="20" height="20" patternUnits="userSpaceOnUse">
						<circle cx="2" cy="2" r="0.6" fill="#cbd5e1" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#grid3)" />
			</svg>

			{/* Parent card */}
			<motion.div
				className="absolute"
				style={{ top: '8%', left: '50%', x: '-50%' }}
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
			>
				<div className="w-[160px] h-[52px] rounded-lg bg-white border border-[#e2e8f0] shadow-md flex items-center justify-between px-3">
					<div className="flex flex-col">
						<span className="text-[8px] text-[#94a3b8] uppercase tracking-wider">Parent</span>
						<span className="text-[12px] font-bold text-[#0f172a]">HOVER Report</span>
					</div>
					<motion.div
						className="flex items-center gap-1 bg-[#fffbeb] border border-[#fde68a] rounded-md px-1.5 py-0.5"
						initial={{ opacity: 0, scale: 0 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 1.0, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
					>
						<svg width="8" height="8" viewBox="0 0 24 24" fill="none">
							<path d={SPARKLE_PATH} fill="#f59e0b" />
						</svg>
						<span className="text-[8px] font-bold text-[#b45309]">Split&nbsp;2</span>
					</motion.div>
				</div>
			</motion.div>

			{/* Dashed group container */}
			<motion.div
				className="absolute"
				style={{ top: '48%', left: '50%', x: '-50%' }}
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 1.2, duration: 0.5 }}
			>
				<div className="flex gap-3 border-2 border-dashed border-[#f59e0b]/25 rounded-xl p-2.5 bg-[#fffbeb]/30">
					{/* Child 1 */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 1.5, duration: 0.5 }}
					>
						<div className="w-[120px] h-[60px] rounded-lg bg-white border border-[#e2e8f0] shadow-sm flex flex-col items-center justify-center gap-0.5 relative overflow-hidden">
							<div className="absolute top-0 left-0 w-full h-[2px] bg-[#4F46E5]" />
							<span className="text-[8px] text-[#64748b] uppercase font-semibold mt-0.5">Split 1</span>
							<span className="text-[13px] font-bold text-[#0f172a] tabular-nums">13.55 SQ</span>
						</div>
					</motion.div>

					{/* Child 2 */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 1.7, duration: 0.5 }}
					>
						<div className="w-[120px] h-[60px] rounded-lg bg-white border border-[#e2e8f0] shadow-sm flex flex-col items-center justify-center gap-0.5 relative overflow-hidden">
							<div className="absolute top-0 left-0 w-full h-[2px] bg-[#E18026]" />
							<span className="text-[8px] text-[#64748b] uppercase font-semibold mt-0.5">Split 2</span>
							<span className="text-[13px] font-bold text-[#0f172a] tabular-nums">8.42 SQ</span>
						</div>
					</motion.div>
				</div>
			</motion.div>

			{/* Connecting dashed lines */}
			<svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
				<motion.line
					x1="50%" y1="38%" x2="40%" y2="50%"
					stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 0.3 }}
					transition={{ delay: 1.3, duration: 0.4 }}
				/>
				<motion.line
					x1="50%" y1="38%" x2="60%" y2="50%"
					stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 0.3 }}
					transition={{ delay: 1.4, duration: 0.4 }}
				/>
			</svg>
		</div>
	);
}

/* ────────── Step Data ────────── */

const STEPS = [
	{
		id: 'split',
		badge: 'New Feature',
		title: 'Measurement Split',
		subtitle: 'Divide one report into many',
		description: 'Split your aerial measurement report across multiple structures. Each split gets its own dedicated measurement card — ready for independent quoting.',
		illustration: SplitCardAnimation,
	},
	{
		id: 'auto-remainder',
		badge: 'Smart Workflow',
		title: 'Auto Remainder',
		subtitle: 'Enter less, calculate more',
		description: 'Enter values for your splits — the first split auto-calculates the remainder. No manual math needed.',
		illustration: PrimarySplitAnimation,
	},
	{
		id: 'connected',
		badge: 'Organized',
		title: 'Connected Cards',
		subtitle: 'Parent stays as source of truth',
		description: 'After splitting, the parent card locks with a comparison view. Child cards are grouped visually and can be edited independently.',
		illustration: ConnectedCardsAnimation,
	},
];

/* ────────── Onboarding Overlay ────────── */

const backdropVariants: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1 },
	exit: { opacity: 0, transition: { delay: 0.1, duration: 0.3 } },
};

const cardVariants: Variants = {
	hidden: { opacity: 0, y: 30, scale: 0.96 },
	visible: { opacity: 1, y: 0, scale: 1, transition: { delay: 0.15, duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
	exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.25 } },
};

const stepContentVariants: Variants = {
	enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
	center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
	exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.2 } }),
};

export function FeatureOnboarding({ onDismiss }: { onDismiss: () => void }) {
	const [step, setStep] = useState(0);
	const [direction, setDirection] = useState(1);
	const current = STEPS[step];

	const next = useCallback(() => {
		if (step < STEPS.length - 1) {
			setDirection(1);
			setStep(s => s + 1);
		} else {
			localStorage.setItem(STORAGE_KEY, 'true');
			onDismiss();
		}
	}, [step, onDismiss]);

	const skip = useCallback(() => {
		localStorage.setItem(STORAGE_KEY, 'true');
		onDismiss();
	}, [onDismiss]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') skip();
			if (e.key === 'ArrowRight' || e.key === 'Enter') next();
			if (e.key === 'ArrowLeft' && step > 0) {
				setDirection(-1);
				setStep(s => s - 1);
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [next, skip, step]);

	const Illustration = current.illustration;

	return (
		<motion.div
			className="fixed inset-0 z-[9999] flex items-center justify-center"
			variants={backdropVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
		>
			{/* Backdrop: light frosted glass */}
			<div
				className="absolute inset-0"
				style={{ background: 'rgba(15,23,42,0.35)' }}
				onClick={skip}
			/>

			{/* Soft ambient glow */}
			<motion.div
				className="absolute pointer-events-none"
				style={{ width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' }}
				animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
				transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
			/>

			{/* Card */}
			<motion.div
				className="relative w-[480px] max-w-[92vw] overflow-hidden"
				variants={cardVariants}
				initial="hidden"
				animate="visible"
				exit="exit"
			>
				<div className="relative rounded-2xl bg-white shadow-xl shadow-black/[0.08] border border-[#e2e8f0] overflow-hidden">
					{/* Top accent bar */}
					<div className="h-[3px] w-full bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#f59e0b]" />

					{/* Illustration area */}
					<div className="relative overflow-hidden bg-[#fafbfc]" style={{ minHeight: 220 }}>
						<AnimatePresence mode="wait" custom={direction}>
							<motion.div
								key={current.id}
								custom={direction}
								variants={stepContentVariants}
								initial="enter"
								animate="center"
								exit="exit"
								className="px-6 pt-5"
							>
								<Illustration />
							</motion.div>
						</AnimatePresence>

						{/* Bottom fade into content */}
						<div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
					</div>

					{/* Content area */}
					<div className="px-8 pb-7 pt-3">
						<AnimatePresence mode="wait" custom={direction}>
							<motion.div
								key={current.id + '-text'}
								custom={direction}
								variants={stepContentVariants}
								initial="enter"
								animate="center"
								exit="exit"
							>
								<div className="flex items-center gap-2.5 mb-3">
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fffbeb] border border-[#fde68a]">
										<svg width="10" height="10" viewBox="0 0 24 24" fill="none">
											<path d={SPARKLE_PATH} fill="#f59e0b" />
										</svg>
										<span className="text-[10px] font-semibold text-[#b45309] uppercase tracking-wider">{current.badge}</span>
									</span>
									<span className="text-[11px] text-[#94a3b8] font-medium">{step + 1} of {STEPS.length}</span>
								</div>

								<h2 className="text-[22px] font-bold text-[#0f172a] tracking-tight leading-tight mb-1">
									{current.title}
								</h2>
								<p className="text-[13px] text-[#475569] font-medium mb-1.5">{current.subtitle}</p>
								<p className="text-[13px] text-[#94a3b8] leading-relaxed">{current.description}</p>
							</motion.div>
						</AnimatePresence>

						{/* Progress + Actions */}
						<div className="flex items-center justify-between mt-6">
							{/* Dots */}
							<div className="flex gap-1.5">
								{STEPS.map((_, i) => (
									<motion.button
										key={i}
										onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
										className="relative h-[6px] rounded-full overflow-hidden cursor-pointer"
										animate={{ width: i === step ? 24 : 6, backgroundColor: i === step ? '#f59e0b' : '#e2e8f0' }}
										transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
									>
										{i === step && (
											<motion.div
												className="absolute inset-0 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] rounded-full"
												layoutId="activeDot"
											/>
										)}
									</motion.button>
								))}
							</div>

							{/* Buttons */}
							<div className="flex items-center gap-2">
								<button
									onClick={skip}
									className="h-[34px] px-3.5 rounded-lg text-[12px] font-medium text-[#94a3b8] hover:text-[#64748b] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
								>
									Skip
								</button>
								<motion.button
									onClick={next}
									className="h-[34px] px-5 rounded-lg text-[12px] font-semibold text-white cursor-pointer shadow-sm"
									style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
									whileHover={{ scale: 1.03, boxShadow: '0 4px 16px rgba(245,158,11,0.25)' }}
									whileTap={{ scale: 0.97 }}
								>
									{step < STEPS.length - 1 ? 'Next' : 'Get Started'}
								</motion.button>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}

export function useFeatureOnboarding() {
	const [show, setShow] = useState(false);

	useEffect(() => {
		const seen = localStorage.getItem(STORAGE_KEY);
		if (!seen) setShow(true);
	}, []);

	const dismiss = useCallback(() => setShow(false), []);
	const reset = useCallback(() => {
		localStorage.removeItem(STORAGE_KEY);
		setShow(true);
	}, []);

	return { show, dismiss, reset };
}
