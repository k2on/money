const FORMAT = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export const formatMoney = FORMAT.format;
