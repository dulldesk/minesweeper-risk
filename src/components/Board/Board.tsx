import React from 'react';
import './Board.scss';
import GridSquare from '../Square/Square';
// import '../Square/Square.scss';
import clone from 'just-clone';
import { GAME_STATUS, SQUARE_STATUS, SQUARE_TYPES, TOOLS } from '../../utils';
import { Tool, Square, GameStatus, SquareStatus, Direction } from '../../types';
import ToolBox, { ToolData } from '../ToolBox/ToolBox';
import { ToolProps } from '../ToolBox/Tool';
import Clue, { ClueArray } from '../Clue/Clue';
import Footer from '../Footer/Footer';
import * as CountBombs from './CountBombs';
import SHOVEL_ICON from "./pick.png";


interface Remaining {
  [key : number] : number;
}
interface BoardProps {
  size?: number;
  bomb_density?: number;
  digs?: number;
}
export interface BoardState {
  squares: Square[][];
  current_game_status: GameStatus;
  tool: Tool;
  remaining: Remaining;
}
export type GridCoordinates = {[key: number] : {[key: number] : number}};


function determine_new_square_status(old_square : Square, tool : Tool, remaining_state : Remaining) : SquareStatus {
  // square already revealed
  if (old_square.status >= SQUARE_STATUS.REVEALED) return old_square.status;
  
  switch (tool) {
    case TOOLS.FLAG:
      return old_square.status === SQUARE_STATUS.FLAGGED ? SQUARE_STATUS.UNKNOWN : (remaining_state[TOOLS.FLAG] > 0 ? SQUARE_STATUS.FLAGGED : old_square.status);
    case TOOLS.DIG:
      return remaining_state[TOOLS.DIG] > 0 ? SQUARE_STATUS.REVEALED + old_square.type : old_square.status;
    // case TOOLS.CLEAR:
    default:
      return old_square.type === SQUARE_TYPES.EMPTY ? SQUARE_STATUS.REVEALED_EMPTY : SQUARE_STATUS.REVEALED_BOMB_DANGER;
  }
}

function generate_grid_coords_from_squares(sz : number) : GridCoordinates {
  let grid_to_square : GridCoordinates = {};
  let num_of_rows = 2 * sz - 1;

  for (let r=0;r<num_of_rows;r++) {
    let row_len = CountBombs.get_row_size(sz, r);
    grid_to_square[r] = {};
    for (let c=0;c<row_len;c++) {
      grid_to_square[r][CountBombs.get_col_relative_to_grid(sz, r, c)] = c;
    }
  }
  return grid_to_square;
}


class Board extends React.Component<BoardProps, BoardState> {
  size: number;
  total_fields: number;
  grid_col_to_square_col : GridCoordinates;
  game_no: number;

	constructor(props : BoardProps) {
		super(props);

    this.game_no = 0;

    let sz = props.size || 4;
    this.size = sz;
    this.total_fields = sz ** 2 + (sz-1) ** 2;
    
    this.grid_col_to_square_col = generate_grid_coords_from_squares(sz);

    this.state = this.createState();
    this.toggleShovel = this.toggleShovel.bind(this);
    this.refreshPage = this.refreshPage.bind(this);
  }
  createState() {
    this.game_no++;
  
    let sz = this.size;
    let len = 2 * sz - 1;
    let density = this.props.bomb_density || 0.3;
    let total_digs = this.props.digs || 2;
  
    let state = {
      squares: Array(len).fill(null).map((_,i) => Array(CountBombs.get_row_size(sz, i)).fill(null).map(_ => ({
        type: Math.random() < density ? SQUARE_TYPES.BOMB : SQUARE_TYPES.EMPTY,
        status: SQUARE_STATUS.UNKNOWN,
      }))),
      current_game_status: GAME_STATUS.ONGOING,
      tool: TOOLS.CLEAR,
      remaining: {} as Remaining
    };
    state.remaining[TOOLS.DIG] = total_digs;
    state.remaining[TOOLS.FLAG] = state.squares.flat().filter(i => i.type === SQUARE_TYPES.BOMB).length;
    state.remaining[TOOLS.CLEAR] = this.total_fields - state.remaining[TOOLS.FLAG];

    return state;
  }
  updateGameStatus(old_square : Square, new_square : Square) : GameStatus|false {
    if (new_square.status === old_square.status) {
      // no change
      return false;
    }

    let remaining_state = this.state.remaining;

    if (this.state.tool === TOOLS.DIG) {
      remaining_state[TOOLS.DIG]--;
    }
    if (new_square.status === SQUARE_STATUS.REVEALED) {
      remaining_state[TOOLS.CLEAR]--;
    }
    this.setState({
      remaining: remaining_state
    });

    if (old_square.status === SQUARE_STATUS.FLAGGED && new_square.status === SQUARE_STATUS.UNKNOWN) {
      remaining_state[TOOLS.FLAG]++;
    }
    else if ((old_square.status === SQUARE_STATUS.UNKNOWN && new_square.status === SQUARE_STATUS.FLAGGED) || new_square.status >= SQUARE_STATUS.REVEALED_BOMB) {
      remaining_state[TOOLS.FLAG]--;
    }
    
    this.setState({
      remaining: remaining_state
    });
    if (new_square.status === SQUARE_STATUS.REVEALED_BOMB_DANGER) {
      // game over
      return GAME_STATUS.LOSS;
    }
    else if (remaining_state[TOOLS.CLEAR] === 0) {
      return GAME_STATUS.WIN;
    }
    return GAME_STATUS.ONGOING;
  }
  componentDidMount() {
    // @ts-ignore
    document.querySelector(".board").addEventListener("contextmenu", e => {
			e.preventDefault();
			return;
    }, true);
  }
  toggleShovel() {
    this.setState({
      tool: (this.state.tool === TOOLS.DIG ? TOOLS.CLEAR : TOOLS.DIG)
    });
  }
  handleSquareClick(row : number, col : number, e : React.MouseEvent) {
    if (this.state.current_game_status !== GAME_STATUS.ONGOING) return false;
		// console.log(e.buttons);
    // e.preventDefault();
    // e.stopPropagation();
    // e.nativeEvent.stopImmediatePropagation();
    // e.nativeEvent.preventDefault();
    let is_rightclick = e.button === 2;
    const was_dig_tool = this.state.tool === TOOLS.DIG; 
    if (/*this.state.tool !== TOOLS.DIG && */is_rightclick) {
      this.setState({
        tool: TOOLS.FLAG
      });
    }
    if (this.state.tool !== TOOLS.FLAG && !is_rightclick && this.state.squares[row][col].status === SQUARE_STATUS.FLAGGED) return false;

    this.updateSquare(row, col, is_rightclick ? TOOLS.FLAG : -1);

    if (is_rightclick) {
      this.setState({
        tool: was_dig_tool ? TOOLS.DIG : TOOLS.CLEAR
      });
    }
  }
  updateSquare(row : number, col : number, force_tool : number = -1, old_squares? : Square[][]) {
    const squares_to_update = (old_squares === undefined) ? clone(this.state.squares) : old_squares;
  
    let old_square = squares_to_update[row][col];
    let new_square = clone(old_square);
    new_square.status = determine_new_square_status(old_square, force_tool !== -1 ? force_tool : this.state.tool, this.state.remaining);
		// console.log(row, col, old_square.status, new_square.status)
    
    let new_game_status = this.updateGameStatus(old_square, new_square);
    if (new_game_status === false) return false;
    
    squares_to_update[row][col] = new_square;

		if (old_squares === undefined) {
			this.setState({
				squares: squares_to_update,
				current_game_status: new_game_status
			});
		}
		return new_game_status;
  }
  getBombCountGenerator(row : number, col : number, dir : Direction) {
    const row_type = CountBombs.get_row_type(dir);
    let extra_arg : any;
    if (row_type === "vertical") extra_arg = this.size;
    else if (row_type === "back_diagonal" || row_type === "forward_diagonal") extra_arg = this.grid_col_to_square_col;

    return CountBombs[row_type](this.state.squares, row, col, extra_arg);
  }
  handleClueClick(row : number, col : number, dir : Direction) {
    const squares_to_update = clone(this.state.squares);
    let itr = this.getBombCountGenerator(row, col, dir);
    
    let coords_to_clear : [number, number][] = [];
    for (let coords of itr) {
      let square = squares_to_update[coords[0]][coords[1]];
      if (square.type === SQUARE_TYPES.BOMB && square.status !== SQUARE_STATUS.FLAGGED && square.status < SQUARE_STATUS.REVEALED) {
        return;
      }
      if (square.status === SQUARE_STATUS.UNKNOWN) {
        coords_to_clear.push(coords as [number, number]);
      }
    }
		
    for (let coords of coords_to_clear) {
      this.updateSquare(...coords, TOOLS.CLEAR, squares_to_update);
    }
		this.setState({
			squares: squares_to_update,
		});
  }
  addClue(clue_list : ClueArray, dir : Direction, row : number, col : number) {
    let itr = this.getBombCountGenerator(row, col, dir);

    let bombs_cnt = 0; let unknown_cnt = 0;
    for (let coords of itr) {
      let square = this.state.squares[coords[0]][coords[1]];
      bombs_cnt += square.type;
      unknown_cnt += square.status === SQUARE_STATUS.REVEALED_EMPTY ? 0 : 1;
    }
    clue_list.push(<Clue dir={dir} value={bombs_cnt} total={unknown_cnt} key={[this.game_no, dir, row, col].join("-")} onClick={this.handleClueClick.bind(this, row, col, dir)} />);
  }
  generate_clues(row : number, col : number) {
    let n = this.size;
    let max_len = 2*n - 1;
    let row_len = CountBombs.get_row_size(n, row);
    let col_len = CountBombs.get_col_size(n, row, col);
    let half_n_floored = Math.floor(n / 2);
    let half_max_len_floored = Math.floor(max_len / 2);

    let clues : ClueArray = [];
    
    // NW / SE 
    if (row < half_n_floored && col === 0) {
      this.addClue(clues,"SE", row, col);
    } 
    else if (row >= max_len - half_n_floored && col === row_len - 1) {
      this.addClue(clues,"NW", row, col);
    }
    
    // NE / SW
    if (row > half_n_floored && row < max_len - half_n_floored && col === 0) {
      this.addClue(clues,"NE",row, col);
    } 
    else if (row < n && row >= half_n_floored && col === row_len - 1) {
      this.addClue(clues,"SW",row, col);
    }

    // N / S
    if (col_len >= Math.max(3, half_max_len_floored - max_len % 2)) {
      if (row > half_n_floored && col === 0 && row !== max_len-1) {
        this.addClue(clues,"N",row, col);
      } else if (row < max_len - half_n_floored-1 && col === row_len - 1) {
        this.addClue(clues,"S",row, col);
      }
    }

    // E / W
    if (row_len >= Math.max(3, half_max_len_floored - max_len % 2)) {
      if (row > half_n_floored + 1 && col === row_len - 1 && col !== 0) {
        this.addClue(clues,"W",row, col);
      } else if (row < max_len - half_n_floored-1 && col === 0) {
        this.addClue(clues,"E",row, col);
      }
    }

    return clues;
  }
	refreshPage() {
    this.setState(this.createState());
    // clues do not update?
	}
	render() {
    // this.state.squares.forEach((row, i) => row.forEach((square_data, j) => console.log(square_data.status)));
    const tools : ToolProps[] = [new ToolData("shovel", this.state, this.toggleShovel), new ToolData("flag", this.state)];
    const cursor = this.state.tool === TOOLS.DIG ? `url(${SHOVEL_ICON}), crosshair` : "auto";

	  return (
      <div className="board">
        <ToolBox tools={tools} />
        <div className="grid" style={{cursor: cursor}}>
          {this.state.squares.map((row, i) => (
              <div className="row" key={i}>
                {row.map((square_data, j) => (
                  <GridSquare key={this.game_no + "-" + i + "," + j} 
                    {...square_data}
                    // type={square_data.type} status={square_data.status} 
                    game_state={this.state.current_game_status}
                    row={i} col={j}
                    clues={this.generate_clues(i,j)}
                    onClick={this.handleSquareClick.bind(this,i,j)} 
                    />
                ))}
              </div>
            ))}
        </div>
        {
          this.state.current_game_status === GAME_STATUS.ONGOING
          ? <Footer />
          : <Footer result={this.state.current_game_status === GAME_STATUS.LOSS ? "loss" : "win"} refresh={this.refreshPage} />
        }
      </div>
	  );
	}
}

export default Board;
