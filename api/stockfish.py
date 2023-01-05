import chess
import chess.engine

class Stockfish():
    def __init__(self):
        self.engine = chess.engine.SimpleEngine.popen_uci('/opt/homebrew/Cellar/stockfish/15/bin/stockfish')

    def get_move(self, board):
        # add time constraint to Stockfish (second argument 'chess.engine.Limit(time=1)'))
        move = self.engine.play(board, chess.engine.Limit(time=0.1)).move 
        board.push(move)

        return {
            'move': str(move),
            'fen': board.fen(),
            'white_turn': board.turn,
            'legal_moves_count': len(list(board.legal_moves)),
            'result': board.outcome().result() if board.outcome() else None,
            'move_number': board.fullmove_number
        }
