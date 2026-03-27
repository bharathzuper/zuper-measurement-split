'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const fadeUp = {
	hidden: { opacity: 0, y: 16 },
	visible: (i: number) => ({
		opacity: 1,
		y: 0,
		transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
	}),
};

function SectionLabel({ children, color = '#64748b' }: { children: React.ReactNode; color?: string }) {
	return (
		<span className="text-[11px] font-bold tracking-[0.15em] uppercase mb-2 block" style={{ color }}>
			{children}
		</span>
	);
}

function StepNumber({ n, color = '#3b82f6' }: { n: number; color?: string }) {
	return (
		<span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white tabular-nums" style={{ backgroundColor: color }}>
			{n}
		</span>
	);
}

function Arrow() {
	return (
		<div className="flex flex-col items-center py-1">
			<div className="w-px h-5 bg-[#cbd5e1]" />
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M12 5v14M5 12l7 7 7-7" />
			</svg>
		</div>
	);
}

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-[#FAFBFC]">
			{/* ─── HERO ─── */}
			<header className="relative overflow-hidden border-b border-[#e2e8f0]">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_#dbeafe40,_transparent)]" />
				<div className="relative mx-auto max-w-3xl px-8 pt-20 pb-14 text-center">
					<motion.div initial="hidden" animate="visible" className="flex flex-col items-center gap-4">
						<motion.div variants={fadeUp} custom={0} className="flex items-center gap-2">
							<span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[#3b82f6] bg-[#eff6ff] border border-[#bfdbfe] rounded-full px-3 py-1">
								PROD-766
							</span>
						</motion.div>

						<motion.h1 variants={fadeUp} custom={1}
							className="text-[36px] md:text-[44px] font-extrabold tracking-[-0.03em] text-[#0f172a] leading-[1.1]">
							Split Measurement
						</motion.h1>

						<motion.p variants={fadeUp} custom={2}
							className="text-[16px] text-[#64748b] max-w-[480px] leading-[1.7]">
							A roofer gets one aerial report for a roof with two materials.
							Today there&apos;s no way to split the numbers. Here&apos;s how we solve it.
						</motion.p>

						<motion.div variants={fadeUp} custom={3} className="flex gap-3 pt-2">
							<Link href="/prototype">
								<Button size="lg" className="bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold px-8 rounded-xl shadow-lg shadow-[#1e293b]/10 h-11 text-[14px]">
									Try the Prototype →
								</Button>
							</Link>
							<a href="https://linear.app/zuperinc/issue/PROD-766/split-measurement" target="_blank" rel="noopener noreferrer">
								<Button variant="outline" size="lg" className="border-[#e2e8f0] text-[#64748b] hover:bg-white rounded-xl h-11 text-[14px]">
									Linear ↗
								</Button>
							</a>
						</motion.div>
					</motion.div>
				</div>
			</header>

			<div className="mx-auto max-w-3xl px-8 pb-32 pt-16">

				{/* ─── PERSONA ─── */}
				<motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="mb-20">
					<motion.div variants={fadeUp} custom={0}
						className="bg-white rounded-2xl border border-[#e2e8f0] p-6 md:p-8">
						<SectionLabel color="#f59e0b">The Scenario</SectionLabel>
						<p className="text-[15px] text-[#334155] leading-[1.75] mt-3">
							<strong>Angela</strong> is a roofing contractor. She ordered an EagleView aerial report for a property.
							The report came back: <strong>3,200 sq ft total area, 32 squares, 6/12 pitch</strong>.
						</p>
						<p className="text-[15px] text-[#334155] leading-[1.75] mt-3">
							But Angela&apos;s job has <strong>two materials</strong> — the main house is <span className="font-semibold text-[#3b82f6]">Asphalt Shingles</span> and
							the detached garage is <span className="font-semibold text-[#f59e0b]">Standing Seam Metal</span>.
							She needs separate measurement cards for each so they flow into <strong>separate quotes and work orders</strong>.
						</p>
						<p className="text-[15px] text-[#64748b] leading-[1.75] mt-3">
							Today, she&apos;d duplicate the report, manually edit 30+ values in each copy, and pray the math adds up.
							That takes 30+ minutes and has no audit trail.
						</p>
					</motion.div>
				</motion.section>

				{/* ─── THE WALKTHROUGH ─── */}
				<motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="mb-20">
					<motion.div variants={fadeUp} custom={0} className="mb-8">
						<SectionLabel color="#3b82f6">Angela&apos;s Workflow</SectionLabel>
						<h2 className="text-[24px] font-bold text-[#0f172a] tracking-tight">
							Step-by-step: how she splits
						</h2>
					</motion.div>

					<div className="space-y-0">
						{/* Step 1 */}
						<motion.div variants={fadeUp} custom={1} className="flex gap-4">
							<div className="flex flex-col items-center">
								<StepNumber n={1} />
								<div className="w-px flex-1 bg-[#e2e8f0] mt-2" />
							</div>
							<div className="pb-10 flex-1 min-w-0">
								<h3 className="text-[15px] font-bold text-[#0f172a] mb-1">Opens the measurement card</h3>
								<p className="text-[14px] text-[#64748b] leading-[1.65]">
									Angela navigates to the job, clicks the Measurements tab, and selects the EagleView report card.
									She sees 5 accordion groups: Roof Measurements (21), Roof Pitch (19), Waste Factors (6), Gutters (12), Siding (18).
								</p>
							</div>
						</motion.div>

						{/* Step 2 */}
						<motion.div variants={fadeUp} custom={2} className="flex gap-4">
							<div className="flex flex-col items-center">
								<StepNumber n={2} />
								<div className="w-px flex-1 bg-[#e2e8f0] mt-2" />
							</div>
							<div className="pb-10 flex-1 min-w-0">
								<h3 className="text-[15px] font-bold text-[#0f172a] mb-1">Clicks &quot;Split Measurement&quot;</h3>
								<p className="text-[14px] text-[#64748b] leading-[1.65]">
									From the three-dot menu (⋮), she picks <strong>Split Measurement</strong>.
									A wide drawer slides open from the right, keeping the measurement tab visible for reference.
								</p>
							</div>
						</motion.div>

						{/* Step 3 */}
						<motion.div variants={fadeUp} custom={3} className="flex gap-4">
							<div className="flex flex-col items-center">
								<StepNumber n={3} />
								<div className="w-px flex-1 bg-[#e2e8f0] mt-2" />
							</div>
							<div className="pb-10 flex-1 min-w-0">
								<h3 className="text-[15px] font-bold text-[#0f172a] mb-1">Picks her materials</h3>
								<p className="text-[14px] text-[#64748b] leading-[1.65]">
									She adds two materials from the dropdown: <strong>Asphalt Shingles</strong> and <strong>Standing Seam Metal</strong>.
									Up to 4 materials are supported. She can pick from 10+ roofing material types.
								</p>
							</div>
						</motion.div>

						{/* Step 4 */}
						<motion.div variants={fadeUp} custom={4} className="flex gap-4">
							<div className="flex flex-col items-center">
								<StepNumber n={4} color="#f59e0b" />
								<div className="w-px flex-1 bg-[#e2e8f0] mt-2" />
							</div>
							<div className="pb-10 flex-1 min-w-0">
								<h3 className="text-[15px] font-bold text-[#0f172a] mb-1">Sets Asphalt Shingles as &quot;Primary&quot;</h3>
								<p className="text-[14px] text-[#64748b] leading-[1.65] mb-3">
									This is the key interaction. She tags the main material as <strong>Primary</strong>. This means:
								</p>
								<div className="bg-[#fffbeb] border border-[#fde68a] rounded-lg px-4 py-3 text-[13px] text-[#92400e] leading-[1.65]">
									The primary material&apos;s values are <strong>auto-calculated</strong> — always <code className="bg-[#fef3c7] px-1 rounded text-[12px]">Total − Σ(all other materials)</code>.
									Angela only types values for the smaller/secondary materials. The primary absorbs the remainder.
								</div>
							</div>
						</motion.div>

						{/* Step 5 */}
						<motion.div variants={fadeUp} custom={5} className="flex gap-4">
							<div className="flex flex-col items-center">
								<StepNumber n={5} color="#f59e0b" />
								<div className="w-px flex-1 bg-[#e2e8f0] mt-2" />
							</div>
							<div className="pb-10 flex-1 min-w-0">
								<h3 className="text-[15px] font-bold text-[#0f172a] mb-1">Enters Metal values</h3>
								<p className="text-[14px] text-[#64748b] leading-[1.65]">
									A single table shows all materials as columns, with every measurement row visible.
									Angela types <strong>800</strong> for Metal&apos;s total area. Instantly, Asphalt Shingles updates to <strong>2,400</strong> (3,200 − 800).
									She fills in ridge length, eave length, etc. for Metal. Each time, Primary auto-adjusts.
								</p>
								<p className="text-[14px] text-[#64748b] leading-[1.65] mt-2">
									Every row shows a status: <span className="text-[#16a34a] font-medium">✓</span> when balanced, <span className="text-[#d97706] font-medium">⚠</span> if over-allocated.
								</p>
							</div>
						</motion.div>

						{/* Step 6 */}
						<motion.div variants={fadeUp} custom={6} className="flex gap-4">
							<div className="flex flex-col items-center">
								<StepNumber n={6} color="#16a34a" />
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="text-[15px] font-bold text-[#0f172a] mb-1">Saves → child cards appear</h3>
								<p className="text-[14px] text-[#64748b] leading-[1.65]">
									She clicks <strong>Create Split</strong> (only enabled when all values balance).
									The drawer closes. The original card locks with a &quot;Split · 2&quot; badge.
									Two new child cards appear grouped next to it in the carousel — one per material.
									A toast confirms: &quot;Split into 2 materials.&quot;
								</p>
							</div>
						</motion.div>
					</div>
				</motion.section>

				{/* ─── AFTER SPLIT ─── */}
				<motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="mb-20">
					<motion.div variants={fadeUp} custom={0} className="mb-8">
						<SectionLabel color="#16a34a">After Split</SectionLabel>
						<h2 className="text-[24px] font-bold text-[#0f172a] tracking-tight">
							What Angela sees now
						</h2>
					</motion.div>

					<motion.div variants={fadeUp} custom={1}
						className="bg-white rounded-2xl border border-[#e2e8f0] p-6 md:p-8 space-y-6">

						<div>
							<h3 className="text-[14px] font-bold text-[#0f172a] mb-2">Card carousel</h3>
							<p className="text-[14px] text-[#64748b] leading-[1.65]">
								Parent and child cards are visually grouped in a dashed container. The parent shows &quot;Split · 2&quot;
								next to its status badge. Child cards show their material name, area, percentage, and
								a breadcrumb back to the parent (&quot;↳ EagleView Report&quot;).
							</p>
						</div>

						<div className="border-t border-[#f1f5f9] pt-5">
							<h3 className="text-[14px] font-bold text-[#0f172a] mb-2">Clicking the parent card</h3>
							<p className="text-[14px] text-[#64748b] leading-[1.65]">
								Shows a <strong>comparison table</strong> — same accordion groups, but with columns for
								Total, Asphalt Shingles, and Metal side-by-side. If a child was edited and values don&apos;t add up,
								a yellow mismatch banner appears with a per-row breakdown.
							</p>
						</div>

						<div className="border-t border-[#f1f5f9] pt-5">
							<h3 className="text-[14px] font-bold text-[#0f172a] mb-2">Clicking a child card</h3>
							<p className="text-[14px] text-[#64748b] leading-[1.65]">
								Shows that material&apos;s measurements in the same grouped accordion format.
								Values are editable — click the pencil at the group header level to modify.
								Each child card flows independently into quotes and work orders.
							</p>
						</div>

						<div className="border-t border-[#f1f5f9] pt-5">
							<h3 className="text-[14px] font-bold text-[#0f172a] mb-2">Undo Split</h3>
							<p className="text-[14px] text-[#64748b] leading-[1.65]">
								Available from the parent card&apos;s three-dot menu (⋮). A confirmation dialog warns that
								child cards and any downstream quotes/WOs will be deleted. On confirm, children disappear and the parent unlocks.
							</p>
						</div>
					</motion.div>
				</motion.section>

				{/* ─── EDGE CASES ─── */}
				<motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="mb-20">
					<motion.div variants={fadeUp} custom={0} className="mb-8">
						<SectionLabel color="#ef4444">Edge Cases & Guard Rails</SectionLabel>
						<h2 className="text-[24px] font-bold text-[#0f172a] tracking-tight">
							What if something goes wrong?
						</h2>
					</motion.div>

					<motion.div variants={fadeUp} custom={1} className="space-y-3">
						{[
							{
								q: 'Angela enters 2,000 for Metal but total is only 3,200 with two other materials?',
								a: 'Per-row status indicators turn amber immediately. The primary material would go negative — this is flagged. "Create Split" stays disabled until everything balances. She can see exactly which rows are over-allocated.',
							},
							{
								q: 'She saves the split, then realizes Metal should be 900 not 800. Can she edit?',
								a: 'Yes. She clicks the Metal child card, clicks the pencil icon at the group header, and edits the value. The parent\'s comparison table will show a yellow mismatch banner if the child sums no longer equal the original total.',
							},
							{
								q: 'What if she tries to split a card that\'s already been split?',
								a: '"Split Measurement" is disabled for cards that already have the "Split" status. Same for child cards — you can\'t split a child.',
							},
							{
								q: 'She adds a third material later. Can she re-split?',
								a: 'She\'d undo the current split first (which restores the original), then split again with 3 materials. We cap at 4 materials per split.',
							},
							{
								q: 'A "Pending" card has no data yet. Can she split it?',
								a: 'No. Split is only available on cards with actual measurement data (status: Completed, In Progress, or Failed).',
							},
							{
								q: 'What happens downstream when child cards exist?',
								a: 'Each child card is a first-class measurement card. It can be attached to its own quote, work order, and invoice — completely independent from siblings.',
							},
						].map((item, i) => (
							<div key={i} className="bg-white rounded-xl border border-[#e2e8f0] p-5">
								<p className="text-[14px] font-semibold text-[#0f172a] leading-snug mb-2">{item.q}</p>
								<p className="text-[13px] text-[#64748b] leading-[1.65]">{item.a}</p>
							</div>
						))}
					</motion.div>
				</motion.section>

				{/* ─── MARKET CONTEXT ─── */}
				<motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="mb-20">
					<motion.div variants={fadeUp} custom={0} className="mb-8">
						<SectionLabel color="#0ea5e9">How Others Handle This Today</SectionLabel>
						<h2 className="text-[24px] font-bold text-[#0f172a] tracking-tight">
							Everyone pushes the problem downstream
						</h2>
						<p className="text-[14px] text-[#64748b] mt-2 leading-[1.65] max-w-xl">
							No platform solves this at the measurement layer. They all force the roofer to figure out
							&quot;which sq ft belongs to which material&quot; in their head — then manually enter it during estimating.
						</p>
					</motion.div>

					<motion.div variants={fadeUp} custom={1} className="space-y-3">
						{[
							{
								name: 'JobNimbus',
								approach: 'Breaks jobs into multiple work orders (mini-jobs) — different materials per WO. Measurement tokens feed into calculations.',
								gap: 'The measurement report itself is never split. Roofer manually calculates per-material values when creating each work order.',
								closest: true,
							},
							{
								name: 'Roofr',
								approach: 'Adds material calculations (waste factor, quantities) to a measurement report. Auto-calculates ordering lists.',
								gap: 'Works for one material type at a time. No concept of splitting the same report across multiple materials.',
							},
							{
								name: 'AccuLynx',
								approach: 'Syncs EagleView/RoofSnap reports into estimates. Multi-material happens at the estimate builder level.',
								gap: 'The measurement data stays as one blob. Material assignment is manual during estimating.',
							},
							{
								name: 'EagleView / HOVER',
								approach: 'Reports include per-facet data (each roof plane\'s area, pitch, lengths). Detailed geometric data.',
								gap: 'They don\'t label facets by material type — that\'s the roofer\'s job. Raw data, no material assignment.',
							},
							{
								name: 'ServiceTitan / Jobber / Housecall Pro',
								approach: 'General field service platforms. No roofing-specific measurement features.',
								gap: 'No measurement integration at all. Roofers use external tools and manually enter data.',
							},
						].map((item, i) => (
							<div key={i} className="bg-white rounded-xl border border-[#e2e8f0] p-5">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-[14px] font-bold text-[#0f172a]">{item.name}</span>
									{item.closest && (
										<span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#3b82f6] border border-[#bfdbfe]">
											Closest
										</span>
									)}
								</div>
								<p className="text-[13px] text-[#334155] leading-[1.6] mb-2">{item.approach}</p>
								<p className="text-[13px] text-[#94a3b8] leading-[1.6]">
									<span className="font-medium text-[#d97706]">Gap:</span> {item.gap}
								</p>
							</div>
						))}
					</motion.div>

					<motion.div variants={fadeUp} custom={2}
						className="mt-6 bg-[#f0f9ff] rounded-xl border border-[#bae6fd] p-5">
						<p className="text-[14px] font-semibold text-[#0c4a6e] mb-1">Where Zuper is different</p>
						<p className="text-[13px] text-[#0369a1] leading-[1.65]">
							We solve it at the <strong>measurement layer</strong> — before it ever reaches quotes or work orders.
							The split happens once, at the source. Each child card is a first-class measurement that flows
							downstream automatically. No manual re-entry, no spreadsheet math, no &quot;I hope these add up.&quot;
						</p>
					</motion.div>
				</motion.section>

				{/* ─── OPEN QUESTIONS ─── */}
				<motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="mb-20">
					<motion.div variants={fadeUp} custom={0} className="mb-8">
						<SectionLabel color="#7c3aed">Open Questions</SectionLabel>
						<h2 className="text-[24px] font-bold text-[#0f172a] tracking-tight">
							Things to discuss
						</h2>
					</motion.div>

					<motion.div variants={fadeUp} custom={1} className="space-y-3">
						{[
							{
								q: 'Should child card edits auto-update the parent comparison, or require a manual "recalculate"?',
								context: 'Currently: edits are live, mismatch banner appears instantly. Risk: accidental edits show warnings immediately.',
							},
							{
								q: 'Do we need permissions? Can any team member split, or only the job owner?',
								context: 'Currently: anyone who can view the measurement tab can split. No permission model designed yet.',
							},
							{
								q: 'What about partial splits? e.g., only split area but keep ridge/eave as shared?',
								context: 'Currently: all splittable measurements are split. Some tokens (like pitch, stories) are marked non-splittable and copied to all children.',
							},
							{
								q: 'If a quote is already created from the parent, what happens after split?',
								context: 'This needs backend design. Options: orphan the quote, auto-link to first child, or block split if downstream data exists.',
							},
							{
								q: 'Should we support more than 4 materials?',
								context: 'Capped at 4 for table readability. Real-world roofs rarely have more than 3 materials, but commercial jobs might.',
							},
						].map((item, i) => (
							<div key={i} className="bg-[#faf5ff] rounded-xl border border-[#e9d5ff] p-5">
								<p className="text-[14px] font-semibold text-[#0f172a] leading-snug mb-1.5">{item.q}</p>
								<p className="text-[13px] text-[#7c3aed]/70 leading-[1.6]">{item.context}</p>
							</div>
						))}
					</motion.div>
				</motion.section>

				{/* ─── CTA ─── */}
				<motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
					<motion.div variants={fadeUp} custom={0}
						className="bg-[#0f172a] rounded-2xl p-10 md:p-14 text-center relative overflow-hidden">
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_120%,_#3b82f620,_transparent)]" />
						<div className="relative">
							<h2 className="text-[22px] md:text-[28px] font-bold text-white tracking-tight mb-3">
								Walk through Angela&apos;s flow yourself
							</h2>
							<p className="text-[14px] text-[#94a3b8] mb-7 max-w-sm mx-auto leading-relaxed">
								Interactive prototype — split a measurement, see child cards generate, edit values, and undo.
							</p>
							<Link href="/prototype">
								<Button size="lg" className="bg-white hover:bg-[#f8fafc] text-[#0f172a] font-bold px-10 h-12 text-[15px] rounded-xl shadow-xl transition-all hover:shadow-2xl">
									Launch Prototype →
								</Button>
							</Link>
						</div>
					</motion.div>
				</motion.section>
			</div>
		</div>
	);
}
