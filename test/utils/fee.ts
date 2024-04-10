import { decimal } from "../../utils/decimal"

export function getFee(amount: number): bigint {
	const f = amount / 200

	if (f <= decimal(1)) {
		return decimal(1)
	}

	if (f >= decimal(5)) {
		return decimal(5)
	}

	return decimal(f)
}
