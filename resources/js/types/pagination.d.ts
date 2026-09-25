interface Links {
	url: string | null | undefined;
	label: string;
	active: boolean;
}

export interface Pagination {
	links: Links[];
	from: number;
	to: number;
	total: number;
}
