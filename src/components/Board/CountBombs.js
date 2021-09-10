import {SQUARE_STATUS} from "../../utils";

export function get_row_size(n, r) {
	return r >= n ? 4*n - 2*r - 3 : 2*r + 1;
}

export function get_col_relative_to_grid(n, r,c) {
	return (r >= n ? r - n + 1 : n - 1 -r) + c;
}

export function get_col_size(n, r, c) {
	return get_row_size(n, get_col_relative_to_grid(n, r,c));
}

/**
 * Gets the number of bombs at a given forward diagonal (/ ; NE / SW)
 * @param {Object[[]]} grid
 * @param {number} row - The row to start at
 * @param {number} col - The column of the row to start at
 * @param {Object[][]} grid_coords - A map of the squares' coordinates relative to the grid to those relative to the grid object
 * @returns {Object} the number of bombs and unknown fields in the diagonal
 */
// export function forward_diagonal(grid, row, col, grid_coords, covered_only=false) {
export function forward_diagonal(grid, row, col, grid_coords) {
	let sz = (grid.length-1) / 2 + 1;
	let grid_col = get_col_relative_to_grid(sz, row, col);
	let bombs_cnt = 0;
	let unknown_cnt = 0;
	// let cnt = 0;
	
	if (col === 0) {
		for (let r=row,c=grid_col; r>row-sz; r--, c++) {
			bombs_cnt += grid[r][grid_coords[r][c]].type;
			unknown_cnt += grid[r][grid_coords[r][c]].status === SQUARE_STATUS.REVEALED_EMPTY ? 0 : 1;
			// cnt += covered_only ? (grid[r][grid_coords[r][c]].status === SQUARE_STATUS.REVEALED_EMPTY ? 0 : 1) : grid[r][grid_coords[r][c]].type;
		}
	} else {
		for (let r=row,c=grid_col; r<row+sz; r++, c--) {
			bombs_cnt += grid[r][grid_coords[r][c]].type;
			unknown_cnt += grid[r][grid_coords[r][c]].status === SQUARE_STATUS.REVEALED_EMPTY ? 0 : 1;
			// cnt += covered_only ? (grid[r][grid_coords[r][c]].status === SQUARE_STATUS.REVEALED_EMPTY ? 0 : 1) : grid[r][grid_coords[r][c]].type;
		}		
	}

	return {
		bombs: bombs_cnt,
		unknown: unknown_cnt
	};
	// return cnt;
}

/**
 * Gets the number of bombs at a given backwards diagonal (\ ; NW \ SE)
 * @param {Object[[]]} grid
 * @param {number} row - The row to start at
 * @param {number} col - The column of the row to start at
 * @param {Object[][]} grid_coords - A map of the squares' coordinates relative to the grid to those relative to the grid object
 * @returns {Object} the number of bombs and unknown fields in the diagonal
 */
// export function back_diagonal(grid, row, col, grid_coords, covered_only=false) {
export function back_diagonal(grid, row, col, grid_coords) {
	let sz = (grid.length-1) / 2 + 1;
	let grid_col = get_col_relative_to_grid(sz, row, col);
	let bombs_cnt = 0;
	let unknown_cnt = 0;
	// let cnt = 0;

	if (row >= sz - 1) {
		for (let r=row,c=grid_col; r>row-sz; r--, c--) {
			bombs_cnt += grid[r][grid_coords[r][c]].type;
			unknown_cnt += grid[r][grid_coords[r][c]].status === SQUARE_STATUS.REVEALED_EMPTY ? 0 : 1;
			// cnt += covered_only ? (grid[r][grid_coords[r][c]].status === SQUARE_STATUS.REVEALED_EMPTY ? 0 : 1) : grid[r][grid_coords[r][c]].type;
		}
	} else {
		for (let r=row,c=grid_col; r<row+sz; r++, c++) {
			bombs_cnt += grid[r][grid_coords[r][c]].type;
			unknown_cnt += grid[r][grid_coords[r][c]].status === SQUARE_STATUS.REVEALED_EMPTY ? 0 : 1;
			// cnt += covered_only ? (grid[r][grid_coords[r][c]].status === SQUARE_STATUS.REVEALED_EMPTY ? 0 : 1) : grid[r][grid_coords[r][c]].type;
		}		
	}

	return {
		bombs: bombs_cnt,
		unknown: unknown_cnt
	};
	// return cnt;
}
// export function horizontal(grid, row, covered_only=false) {
export function horizontal(grid, row) {
	let bombs_cnt = 0;
	let unknown_cnt = 0;
	// let cnt = 0;
	for (let c=0;c<grid[row].length;c++) {
		// cnt += covered_only ? (grid[row][c].status === SQUARE_STATUS.REVEALED_EMPTY ? 0 : 1) : grid[row][c].type;
		bombs_cnt += grid[row][c].type;
		unknown_cnt += grid[row][c].status === SQUARE_STATUS.REVEALED_EMPTY ? 0 : 1;
	}
	return {
		bombs: bombs_cnt,
		unknown: unknown_cnt
	};
	// return bombs_cnt;
	// return grid[row].reduce((a, b) => (a.type + b.type), 0);
}
// export function vertical(grid, row, col, sz, covered_only=false) {
export function vertical(grid, row, col, sz) {
	let grid_col = get_col_relative_to_grid(sz, row, col);
	let col_len = get_row_size(sz, grid_col);
	let r_start = Math.abs(sz-1-grid_col);
	let c_start = grid_col >= sz ? get_row_size(sz, r_start) - 1 : 0;
	
	// let cnt = 0;
	let bombs_cnt = 0;
	let unknown_cnt = 0;

	for (let r=r_start, c=c_start, i=0; i < col_len; i++, r++) {
		// cnt += covered_only ? (grid[r][c].status === SQUARE_STATUS.REVEALED_EMPTY ? 0 : 1) : grid[r][c].type;
		bombs_cnt += grid[r][c].type;
		unknown_cnt += grid[r][c].status === SQUARE_STATUS.REVEALED_EMPTY ? 0 : 1;

		if (r >= sz - 1) c--;
		else c++;
	}
	return {
		bombs: bombs_cnt,
		unknown: unknown_cnt
	};
	// return cnt;
}

export function get_row_type(dir) {
    switch (dir) {
		case "SE":
		case "NW":
			return "back_diagonal";
		case "NE":
		case "SW":
			return "forward_diagonal";
		case "N":
		case "S":
			return "vertical";
		default:
			return "horizontal";
    }
}

// export function closest_odd(n) {
// 	let up = Math.floor(n + 0.5);
// 	let down = Math.ceil(n - 0.5);
// 	return up % 2 === 1 ? up : down;
// }
