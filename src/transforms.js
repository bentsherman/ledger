
export function date(value) {
	let date = new Date(value)
	let yyyy = date.getUTCFullYear()
	let MM = date.getUTCMonth() + 1
	let dd = date.getUTCDate()

	return `${MM}/${dd}/${yyyy}`
}

export function number(value, fractionSize) {
	return Number.parseFloat(value).toFixed(fractionSize)
}
