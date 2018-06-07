import { FakeElement } from '../fake/element';
import { Container } from '../container';
import { isUndefined } from '../../utility/kit';

export class Selector {
	constructor(matrix, bag, factory) {
		this.matrix = matrix;
		this.bag = bag;
		this.factory = factory;
	}

	columnCount(rowIndex) {
		const row = this.matrix[rowIndex];
		return row ? row.length : 0;
	}

	columnCells(columnIndex) {
		const factory = this.factory;
		const matrix = this.matrix;
		const result = [];
		const set = new Set();
		for (let i = 0, length = matrix.length; i < length; i++) {
			const row = matrix[i];
			if (row.length > columnIndex) {
				const td = row[columnIndex];
				if (!set.has(td)) {
					set.add(td);
					result.push(factory.cell(td, i, columnIndex));
				}
			}
		}

		return result;
	}

	rowCount(columnIndex) {
		const matrix = this.matrix;
		const set = new Set();
		for (let i = 0, length = matrix.length; i < length; i++) {
			const row = matrix[i];
			if (row.length > columnIndex) {
				const td = row[columnIndex];
				set.add(td);
			}
		}

		return set.size;
	}

	rows(columnIndex) {
		const matrix = this.matrix;
		const factory = this.factory;
		const set = new Set();
		const result = [];
		if (isUndefined(columnIndex)) {
			const rows = this.bag.rows;
			let i = 0;
			for (let row of rows) {
				result.push(factory.row(row.element, i++));
			}
		} else {
			for (let i = 0, length = matrix.length; i < length; i++) {
				const row = matrix[i];
				if (row.length > columnIndex) {
					const tr = row[columnIndex].parentElement;
					if (!set.has(tr)) {
						set.add(tr);
						result.push(factory.row(tr, i));
					}
				}
			}
		}

		return result;
	}

	rowCells(rowIndex) {
		const matrix = this.matrix;
		const row = matrix[rowIndex];
		const result = [];
		if (row) {
			const set = new Set();
			const factory = this.factory;
			for (let i = 0, length = row.length; i < length; i++) {
				const td = row[i];
				if (!set.has(td)) {
					set.add(td);
					result.push(factory.cell(td, rowIndex, i));
				}
			}
		}

		return result;
	}

	row(rowIndex, columnIndex) {
		const factory = this.factory;
		const row = this.matrix[rowIndex];
		if (row && row.length) {
			if (isUndefined(columnIndex)) {
				const set = new Set();
				for (let td of row) {
					set.add(td.parentElement);
				}

				const trs = Array.from(set);
				return factory.row(trs.length > 1 ? new Container(trs) : trs[0], rowIndex);
			}
			else if(row.length > columnIndex) {
				const tr = row[columnIndex].parentElement;
				return factory.row(tr, rowIndex);
			}
		}

		return factory.row(new FakeElement(), rowIndex);
	}

	cell(rowIndex, columnIndex) {
		const row = this.matrix[rowIndex];
		const factory = this.factory;
		if (row && row.length > columnIndex) {
			return factory.cell(
				row[columnIndex],
				rowIndex,
				columnIndex
			);
		}

		return factory.cell(
			new FakeElement(),
			rowIndex,
			columnIndex
		);
	}
}