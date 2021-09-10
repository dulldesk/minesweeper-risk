import React from 'react';
import './Board.scss';
import Square from '../Square/Square';
import '../Square/Square.scss';
import clone from 'just-clone';
import { GAME_STATUS, SQUARE_STATUS, SQUARE_TYPES, TOOLS } from '../../utils';
import ToolBox from '../ToolBox/ToolBox';
import Clue from '../Clue/Clue';
import * as CountBombs from './CountBombs';

class GameEnd extends React.Component {
  refreshPage() {
    window.location.reload();
  }
  render() {
    return (
      <div style={{textAlign: 'center'}}>
        {this.props.result}
        <br />
        <button onClick={this.refreshPage}>Retry?</button>
      </div>
    )
  }
}

function determine_new_square_status(old_square, tool, remaining_state) {
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

function generate_grid_cols_from_squares(sz) {
  let grid_to_square = {};
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

class Board extends React.Component {
	constructor(props) {
		super(props);

    let sz = props.size || 4;
    this.size = sz;
    let len = 2 * sz - 1;
    let density = props.bomb_density || 0.3;
    let total_fields =  sz ** 2 + (sz-1) ** 2;
    this.total_fields = total_fields;
    
    let total_digs = props.digs || 2;

		this.state = {
      squares: Array(len).fill(null).map((_,i) => Array(CountBombs.get_row_size(sz, i)).fill(null).map(_ => ({
        type: Math.random() < density ? SQUARE_TYPES.BOMB : SQUARE_TYPES.EMPTY,
        status: SQUARE_STATUS.UNKNOWN,
      }))),
      current_game_status: GAME_STATUS.ONGOING,
      tool: TOOLS.CLEAR,
      remaining: {}
    };
    this.state.remaining[TOOLS.DIG] = total_digs
    this.state.remaining[TOOLS.FLAG] = this.state.squares.flat().filter(i => i.type === SQUARE_TYPES.BOMB).length;
    this.state.remaining[TOOLS.CLEAR] = total_fields - this.state.remaining[TOOLS.FLAG];

    this.grid_col_to_square_col = generate_grid_cols_from_squares(sz);
  }
  updateGameStatus(old_square, new_square) {
    if (new_square.status === old_square.status) {
      // no change
      return false;
    }

    let remaining_state = this.state.remaining;

    if (this.state.tool === TOOLS.DIG) {
      remaining_state[TOOLS.DIG]--;
    }
    if (new_square.status >= SQUARE_STATUS.REVEALED) {
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
    document.addEventListener("contextmenu", (e) => {
      if (e.target.closest(".square")) {
        e.preventDefault();
        let sq = e.target.closest(".square").dataset;
        this.handleSquareClick(parseInt(sq.row),parseInt(sq.col),true);
      }
    }, true);
  }
  handleSquareClick(row, col, is_rightclick=false) {
    if (this.state.current_game_status !== GAME_STATUS.ONGOING) return false;
    // e.stopPropagation();
    // e.nativeEvent.stopImmediatePropagation();
    // e.preventDefault();
    // e.nativeEvent.preventDefault();

    const was_dig_tool = this.state.tool === TOOLS.DIG; 
    if (this.state.tool !== TOOLS.DIG && is_rightclick) {
      this.setState({
        tool: TOOLS.FLAG
      });
    }

    this.updateSquare(row, col);

    if (this.state.tool === TOOLS.FLAG) {
      this.setState({
        tool: was_dig_tool ? TOOLS.DIG : TOOLS.CLEAR
      });
    }
  }
  updateSquare(row, col) {
    const squares_to_update = clone(this.state.squares);
  
    let old_square = squares_to_update[row][col];
    let new_square = clone(old_square);
    new_square.status = determine_new_square_status(old_square, this.state.tool, this.state.remaining);
    
    let new_game_status = this.updateGameStatus(old_square, new_square);
    if (new_game_status === false) return;
    
    squares_to_update[row][col] = new_square;
    this.setState({
      squares: squares_to_update,
      current_game_status: new_game_status
    });
  }
  toggleShovel() {
    this.setState({
      tool: (this.state.tool === TOOLS.DIG ? TOOLS.CLEAR : TOOLS.DIG)
    });
  }
  addClue(list, dir, row, col) {
    const row_type = CountBombs.get_row_type(dir);
    let extra_arg;
    if (row_type === "vertical") extra_arg = this.size;
    else if (row_type === "back_diagonal" || row_type === "forward_diagonal") extra_arg = this.grid_col_to_square_col;

  }
  display_clues(row, col) {
    let n = this.size;
    let squares = this.state.squares;
    let max_len = 2*n - 1;
    let row_len = CountBombs.get_row_size(n, row);
    let col_len = CountBombs.get_col_size(n, row, col);
    let half_n_floored = Math.floor(n / 2);
    let half_max_len_floored = Math.floor(max_len / 2);

    let clues = [];
    
    // NW / SE 
    if (row < half_n_floored && col === 0) {
      this.addClue(clues,"SE", row, col, this.grid_col_to_square_col);
    } 
    else if (row >= max_len - half_n_floored && col === row_len - 1) {
      this.addClue(clues,"NW", row, col, this.grid_col_to_square_col);
    }
    
    // NE / SW
    if (row > half_n_floored && row < max_len - half_n_floored && col === 0) {
      this.addClue(clues,"NE",row, col,this.grid_col_to_square_col);
    } 
    else if (row < n && row >= half_n_floored && col === row_len - 1) {
      this.addClue(clues,"SW",row, col,this.grid_col_to_square_col);
    }

    // N / S
    if (col_len >= Math.max(3, half_max_len_floored - max_len % 2)) {
      if (row > half_n_floored && col === 0 && row !== max_len-1) {
        this.addClue(clues,"N",row, col, n);
      } else if (row < max_len - half_n_floored-1 && col === row_len - 1) {
        this.addClue(clues,"S",row, col, n);
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
	render() {
    // this.state.squares.forEach((row, i) => row.forEach((square_data, j) => console.log(square_data.status)));
    let tools = [
      {
        type: "shovel",
        icon: "⛏️",
        value: this.state.remaining[TOOLS.DIG],
        active: this.state.tool === TOOLS.DIG,
        onClick: this.toggleShovel.bind(this)
      },
      {
        type: "flag",
        icon: "🚩",
        value: this.state.remaining[TOOLS.FLAG]
      }
    ];
	  return (
      <div className="board">
        <ToolBox tools={tools} />
        <div className="grid">
          {this.state.squares.map((row, i) => (
              <div className="row" key={i}>
                {row.map((square_data, j) => (
                  <Square key={i + "," + j} 
                    type={square_data.type} status={square_data.status} 
                    game_state={this.state.current_game_status}
                    row={i} col={j}
                    clues={this.display_clues(i,j)}
                    onClick={this.handleSquareClick.bind(this,i,j,false)} 
                    />
                ))}
              </div>
            ))}
        </div>
        {
          this.state.current_game_status === GAME_STATUS.LOSS ? <GameEnd result="loss" /> : ""
        }
        {
          this.state.current_game_status === GAME_STATUS.WIN ? <GameEnd result="win" /> : ""
        }
      </div>
	  );
	}
}

export default Board;
