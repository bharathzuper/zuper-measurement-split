'use client';

const LOGO_SRC =
	'https://www.figma.com/api/mcp/asset/8a4c253e-2c49-472b-9a92-8f2d57ca7ba9';

type NavItemConfig = {
	label: string;
	iconSrc: string;
	active?: boolean;
};

const MAIN_NAV_ITEMS: NavItemConfig[] = [
	{
		label: 'Dashboard',
		iconSrc:
			'https://www.figma.com/api/mcp/asset/f2f68a4e-9a42-40d4-82b6-a15ecfd66a74',
	},
	{
		label: 'Project',
		iconSrc:
			'https://www.figma.com/api/mcp/asset/f3578845-2985-41d1-a06f-fb0f1bff90e3',
	},
	{
		label: 'Request',
		iconSrc:
			'https://www.figma.com/api/mcp/asset/bbec01c3-4641-45a9-91e5-0b2b8071e6c7',
	},
	{
		label: 'Jobs',
		iconSrc:
			'https://www.figma.com/api/mcp/asset/132c3b3b-6651-4d0f-8646-0a92cc1b563f',
		active: true,
	},
	{
		label: 'Calendar',
		iconSrc:
			'https://www.figma.com/api/mcp/asset/7b6d0ad9-fd33-4cfb-a2c7-40c5cd0f4768',
	},
	{
		label: 'Customers',
		iconSrc:
			'https://www.figma.com/api/mcp/asset/70439be2-bee1-49f2-aaad-468d23bc90a7',
	},
	{
		label: 'Timesheets',
		iconSrc:
			'https://www.figma.com/api/mcp/asset/75967250-02d3-4f28-aad3-d8fab0405751',
	},
	{
		label: 'Purchasing',
		iconSrc:
			'https://www.figma.com/api/mcp/asset/796b8aec-7e51-4566-ba9d-038236b584f9',
	},
	{
		label: 'Products',
		iconSrc:
			'https://www.figma.com/api/mcp/asset/ec12ecf7-f020-4020-8f0e-5e00f8de83cb',
	},
	{
		label: 'Maps',
		iconSrc:
			'https://www.figma.com/api/mcp/asset/6f0b1e53-5e00-4c36-bedd-58411970e4f7',
	},
	{
		label: 'Quotations',
		iconSrc:
			'https://www.figma.com/api/mcp/asset/8dc3796f-8760-47c6-b330-f09166e4bd5b',
	},
	{
		label: 'Contracts',
		iconSrc:
			'https://www.figma.com/api/mcp/asset/34cb066c-43e1-42f8-ab84-623bbe66df66',
	},
	{
		label: 'Reports',
		iconSrc:
			'https://www.figma.com/api/mcp/asset/c36ff270-ac79-4d65-8ff7-2ca71135d417',
	},
	{
		label: 'Workflows',
		iconSrc:
			'https://www.figma.com/api/mcp/asset/03c8b9c2-b473-408d-a1c5-010c1ec273f5',
	},
];

const SETTINGS_ITEM: NavItemConfig = {
	label: 'Settings',
	iconSrc:
		'https://www.figma.com/api/mcp/asset/3dafbd89-4b5c-4196-9836-bf7480e6f5aa',
};

function NavIconRow({ label, iconSrc, active }: NavItemConfig) {
	return (
		<div className="flex h-[45px] items-center justify-center px-[13.5px]">
			<button
				type="button"
				title={label}
				aria-label={label}
				aria-current={active ? 'page' : undefined}
				className={`flex items-center justify-center p-[8px] rounded-[4px] ${active ? 'bg-[#e44a19]' : ''}`}
			>
				<img
					src={iconSrc}
					alt=""
					width={22}
					height={24}
					className={`h-[24px] w-[22px] ${active ? '' : 'opacity-60'}`}
				/>
			</button>
		</div>
	);
}

export function DarkNav() {
	return (
		<nav
			className="flex h-screen w-[65px] shrink-0 flex-col bg-[#12344d] print:hidden"
			aria-label="Primary"
		>
			<div className="flex h-[70px] shrink-0 items-center justify-center">
				<img
					src={LOGO_SRC}
					alt="Logo"
					width={35}
					height={35}
					className="h-[35px] w-[35px]"
				/>
			</div>

			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
				{MAIN_NAV_ITEMS.map((item) => (
					<NavIconRow key={item.label} {...item} />
				))}
			</div>

			<div className="shrink-0">
				<NavIconRow {...SETTINGS_ITEM} />
			</div>
		</nav>
	);
}
