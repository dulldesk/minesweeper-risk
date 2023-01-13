export type SquareType = number;//0 | 1;
export type Tool = number;//0 | 1 | 2;
export type SquareStatus = number;//0 | 1 | 2 | 3 | 4;
export type GameStatus = number;// 0 | 1 | 2;
export interface Square {
	status: SquareStatus;
	type: SquareType;
}
export type Direction = string;