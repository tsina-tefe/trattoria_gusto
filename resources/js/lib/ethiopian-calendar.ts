export const ETHIOPIAN_FISCAL_MONTHS = [
    { value: 1, am: 'መስከረም' },
    { value: 2, am: 'ጥቅምት' },
    { value: 3, am: 'ህዳር' },
    { value: 4, am: 'ታህሳስ' },
    { value: 5, am: 'ጥር' },
    { value: 6, am: 'የካቲት' },
    { value: 7, am: 'መጋቢት' },
    { value: 8, am: 'ሚያዝያ' },
    { value: 9, am: 'ግንቦት' },
    { value: 10, am: 'ሰኔ' },
    { value: 11, am: 'ሐምሌ' },
    { value: 12, am: 'ነሐሴ' },
];

const ETHIOPIAN_MONTHS = [
    'Meskerem',
    'Tikimt',
    'Hidar',
    'Tahsas',
    'Tir',
    'Yekatit',
    'Megabit',
    'Miazia',
    'Ginbot',
    'Sene',
    'Hamle',
    'Nehasse',
    'Pagumen',
];

export type EthiopianDate = {
    year: number;
    month: number;
    day: number;
    monthName: string;
};

export function getEthiopianMonthEnglishName(month: number): string {
    return ETHIOPIAN_MONTHS[month - 1] ?? String(month);
}

export function gregorianToEthiopian(date: Date = new Date()): EthiopianDate {
    const gregorianYear = date.getFullYear();
    const gregorianMonth = date.getMonth() + 1;
    const gregorianDay = date.getDate();

    const a = Math.floor((14 - gregorianMonth) / 12);
    const y = gregorianYear + 4800 - a;
    const m = gregorianMonth + 12 * a - 3;
    const jdn =
        gregorianDay +
        Math.floor((153 * m + 2) / 5) +
        365 * y +
        Math.floor(y / 4) -
        Math.floor(y / 100) +
        Math.floor(y / 400) -
        32045;

    const r = (jdn - 1723856) % 1461;
    const n = (r % 365) + Math.floor(r / 1460);
    const ethiopianYear =
        4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
    const ethiopianMonth = Math.floor(n / 30) + 1;
    const ethiopianDay = (n % 30) + 1;

    const monthIndex = Math.min(ethiopianMonth, ETHIOPIAN_MONTHS.length) - 1;

    return {
        year: ethiopianYear,
        month: ethiopianMonth,
        day: ethiopianDay,
        monthName: ETHIOPIAN_MONTHS[monthIndex] ?? ETHIOPIAN_MONTHS[0],
    };
}

export function formatEthiopianDate(date: Date = new Date()): string {
    const ethiopian = gregorianToEthiopian(date);
    const amharicMonth = ETHIOPIAN_FISCAL_MONTHS[ethiopian.month - 1]?.am ?? '';

    return `${amharicMonth} ${ethiopian.day} ${ethiopian.year}`;
}
