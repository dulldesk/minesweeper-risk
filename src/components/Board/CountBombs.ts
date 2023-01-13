import { Direction, Square } from "../../types";
import { GridCoordinates } from "./Board";


export function get_row_size(n : number, r : number) {
	return r >= n ? 4*n - 2*r - 3 : 2*r + 1;
}

export function get_col_relative_to_grid(n : number, r : number, c : number) {
	return (r >= n ? r - n + 1 : n - 1 -r) + c;
}

export function get_col_size(n : number, r : number, c : number) {
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
export function* forward_diagonal(grid : Square[][], row : number, col : number, grid_coords : GridCoordinates) {
	let sz = (grid.length-1) / 2 + 1;
	let grid_col = get_col_relative_to_grid(sz, row, col);
	
	if (col === 0) {
		for (let r=row,c=grid_col; r>row-sz; r--, c++) {
			yield [r,grid_coords[r][c]];
		}
	} else {
		for (let r=row,c=grid_col; r<row+sz; r++, c--) {
			yield [r,grid_coords[r][c]];
		}
	}
}

/**
 * Gets the number of bombs at a given backwards diagonal (\ ; NW \ SE)
 * @param {Object[[]]} grid
 * @param {number} row - The row to start at
 * @param {number} col - The column of the row to start at
 * @param {Object[][]} grid_coords - A map of the squares' coordinates relative to the grid to those relative to the grid object
 * @returns {Object} the number of bombs and unknown fields in the diagonal
 */
export function* back_diagonal(grid : Square[][], row : number, col : number, grid_coords : GridCoordinates) {
	let sz = (grid.length-1) / 2 + 1;
	let grid_col = get_col_relative_to_grid(sz, row, col);

	if (row >= sz - 1) {
		for (let r=row,c=grid_col; r>row-sz; r--, c--) {
			yield [r,grid_coords[r][c]];
		}
	} else {
		for (let r=row,c=grid_col; r<row+sz; r++, c++) {
			yield [r,grid_coords[r][c]];
		}		
	}
}
export function* horizontal(grid : Square[][], row : number) {
	for (let c=0;c<grid[row].length;c++) {
		yield [row,c];
	}
}
export function* vertical(grid : Square[][], row : number, col : number, sz : number) {
	let grid_col = get_col_relative_to_grid(sz, row, col);
	let col_len = get_row_size(sz, grid_col);
	let r_start = Math.abs(sz-1-grid_col);
	let c_start = grid_col >= sz ? get_row_size(sz, r_start) - 1 : 0;

	for (let r=r_start, c=c_start, i=0; i < col_len; i++, r++) {
		yield [r,c];

		if (r >= sz - 1) c--;
		else c++;
	}
}

export function get_row_type(dir : Direction) {
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
