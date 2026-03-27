export type JobStatus = 'New' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Customer {
	name: string;
	email: string;
	phone: string;
}

export interface Address {
	line1: string;
	city: string;
	state: string;
	zip: string;
}

export interface JobStatusDetail {
	status_name: string;
	color: string;
}

export interface Job {
	job_number: string;
	prefix: string;
	work_order_number: string;
	job_title: string;
	title: string;
	status: JobStatus;
	current_job_status?: JobStatusDetail;
	job_total?: number;
	customer: Customer;
	property_address: Address;
	scheduled_start: string;
	scheduled_end: string;
	scheduled_start_time?: string;
	scheduled_end_time?: string;
	created_at: string;
	assigned_to: string[];
	tags: string[];
}

export type MeasurementStatus = 'Completed' | 'Pending' | 'In Progress' | 'Failed' | 'Split';
export type MeasurementProvider = 'EagleView' | 'GAF QuickMeasure' | 'Manual' | 'RoofSnap' | 'Split' | 'HOVER';

export interface MeasurementCard {
	id: string;
	provider: MeasurementProvider;
	report_name: string;
	status: MeasurementStatus;
	ordered_date: string;
	completed_date?: string;
	parent_id?: string;
	scope_name?: string;
	trade_type?: TradeType;
	split_child_ids?: string[];
	token_values: Record<string, number>;
}

export type TokenCategory = 'Roof Measurements' | 'Roof Pitch Measurements' | 'Roof Waste Factors' | 'Gutters' | 'Siding';

export type TokenClassification = 'splittable' | 'fixed' | 'independent';

export interface TokenDefinition {
	key: string;
	label: string;
	unit: string;
	category: TokenCategory;
	classification: TokenClassification;
}

export type TradeType =
	| 'Asphalt Shingle'
	| 'Metal'
	| 'Standing Seam'
	| 'TPO/Flat'
	| 'Tile'
	| 'Clay Tile'
	| 'Concrete Tile'
	| 'Slate'
	| 'Cedar Shake'
	| 'Wood Shake'
	| 'Synthetic'
	| 'EPDM'
	| 'PVC'
	| 'Modified Bitumen'
	| 'Built-Up (BUR)'
	| 'Copper'
	| 'Zinc'
	| 'Other';

export interface SplitScope {
	id: string;
	name: string;
	trade_type: TradeType;
	color: string;
	allocations: Record<string, number>;
}

export type SplitStep = 1 | 2 | 3;

export interface SplitState {
	parentCard: MeasurementCard;
	scopes: SplitScope[];
	currentStep: SplitStep;
	isComplete: boolean;
}

export type JobDetailTab = 'details' | 'line-items' | 'work-orders' | 'measurements' | 'gallery' | 'notes' | 'tasks' | 'activity' | 'messages';

export interface MeasurementRow {
	name: string;
	value: string | null;
	unit: string;
}

export interface MeasurementGroup {
	id: string;
	name: string;
	count: number;
	status?: 'Deleted';
	measurements: MeasurementRow[];
}
