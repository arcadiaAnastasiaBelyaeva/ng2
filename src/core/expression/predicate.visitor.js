import { AppError } from '../infrastructure/error';
import { parseFactory, getType } from '../services/convert';
import { Visitor } from './expression.visitor';
import { isArray, identity } from '../utility/kit';

export class PredicateVisitor extends Visitor {
	constructor(valueFactory, assertFactory) {
		super();

		this.valueFactory = valueFactory;
		this.assertFactory = assertFactory;
	}

	visitGroup(group) {
		if (group.right) {
			const lp = this.visit(group.left);
			const rp = this.visit(group.right);

			switch (group.op) {
				case 'and':
					return value => lp(value) && rp(value);
				case 'or':
					return value => lp(value) || rp(value);

				default:
					throw AppError(
						'predicate.visitor',
						`Invalid operation ${group.op}`
					);
			}
		}

		return this.visit(group.left);
	}

	visitCondition(condition) {
		const r = condition.right;
		const name = condition.left;
		const getValue = this.valueFactory(name);
		const assert = this.assertFactory(name);
		const map = new Set();

		let parse, rt;
		if (isArray(r)) {
			if (r.length) {
				rt = getType(r[0]);
				parse = parseFactory(rt);
				r.forEach(x => map.add('' + x));
			} else {
				parse = identity;
			}
		} else {
			rt = getType(r);
			parse = parseFactory(rt);
		}

		const equals = assert.equals;
		const isNull = assert.isNull;
		const lessThan = assert.lessThan;
		const lessThanOrEquals = (x, y) => equals(parse(x), parse(y)) || lessThan(x, y);
		const greaterThan = (x, y) => !lessThanOrEquals(x, y);
		const greaterThanOrEquals = (x, y) => !lessThan(x, y);

		let predicate;
		switch (condition.op) {
			case 'isNotNull':
			case 'isNotEmpty':
				predicate = l => !isNull(l);
				break;
			case 'isNull':
			case 'isEmpty':
				predicate = l => isNull(l);
				break;
			case 'equals':
				predicate = l => equals(parse(l), r);
				break;
			case 'notEquals':
				predicate = l => !equals(parse(l), r);
				break;
			case 'greaterThanOrEquals':
				predicate = l => greaterThanOrEquals(parse(l), r);
				break;
			case 'greaterThan':
				predicate = l => greaterThan(parse(l), r);
				break;
			case 'lessThanOrEquals':
				predicate = l => lessThanOrEquals(parse(l), r);
				break;
			case 'lessThan':
				predicate = l => lessThan(parse(l), r);
				break;
			case 'between':
				predicate = l => lessThanOrEquals(parse(l), r[1]) && greaterThanOrEquals(parse(l), r[0]);
				break;
			case 'in':
				predicate = l => {
					const v = !l && l !== 0 ? 'null' : '' + l;
					return map.has(v);
				};
				break;
			case 'like':
				predicate = l => l && ('' + l).toLowerCase().includes(('' + r).toLowerCase());
				break;
			case 'notLike':
				predicate = l => l && !('' + l).toLowerCase().includes(('' + r).toLowerCase());
				break;
			case 'startsWith':
				predicate = l => l && (('' + l).toLowerCase().indexOf(('' + r).toLowerCase()) === 0);
				break;
			case 'endsWith':
				predicate = l => {
					const substr = ('' + l).slice(-('' + r).length).toLowerCase();
					return ('' + r).toLowerCase() === substr;
				};
				break;
			default:
				throw new AppError(
					'predicate.visitor',
					`Invalid operation ${condition.op}`
				);
		}

		return l => {
			const v = getValue(l);
			return predicate(v);
		};
	}
}