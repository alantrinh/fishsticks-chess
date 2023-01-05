import numpy as np
import chess
import tensorflow.keras.models as models

class Engine():
    def __init__(self):
        self.model = models.load_model('../models/model_128_filters_1_conv_layers_128_dense_units_16000_batch_size_1_depth_500_batches.h5')

    def make_bitboard(self, board):
        bitboard = np.empty(shape=(12, 8, 8))

        for piece in chess.PIECE_TYPES:
            index = piece - 1 # arrays are zero indexed
            white_layer = np.reshape(board.pieces(piece, chess.BLACK).tolist(), (8, 8)).astype(int)
            bitboard[index] = white_layer
            black_layer = np.reshape(board.pieces(piece, chess.WHITE).tolist(), (8, 8)).astype(int)
            bitboard[index + len(chess.PIECE_TYPES)] = black_layer # shift index up amount of pieces for black

        return bitboard

    # minimax algorithm with alpha-beta pruning (found javascript implementation here https://www.youtube.com/watch?v=l-hh51ncgDI)
    def evaluate_board(self, board):
        # As per model.summary() shape needs to be (None, 12, 8, 8)
        bitboard = np.expand_dims(self.make_bitboard(board), axis=0)
        return self.model(bitboard)[0][0]

    def minimax(self, board, depth, alpha, beta, maximising_player):
        if depth == 0 or board.is_game_over():
            return self.evaluate_board(board)
        
        if maximising_player:
            max_eval = -np.inf
            for move in board.legal_moves:
                board.push(move)
                eval = self.minimax(board, depth - 1, alpha, beta, False)
                board.pop()
                max_eval = max(max_eval, eval)
                alpha = max(alpha, eval)
                if beta <= alpha:
                    break
            return max_eval
        else:
            min_eval = np.inf
            for move in board.legal_moves:
                board.push(move)
                eval = self.minimax(board, depth - 1, alpha, beta, True)
                board.pop()
                min_eval = min(min_eval, eval)
                beta = min(beta, eval)
                if beta <= alpha:
                    break
            return min_eval

    def get_move(self, board, depth, is_white):
        best_move = None
        max_eval = -np.inf
        min_eval = np.inf

        for move in board.legal_moves:
            board.push(move)
            eval = self.minimax(board, depth - 1, -np.inf, np.inf, not is_white)
            board.pop()

            if is_white and eval > max_eval:
                max_eval = eval
                best_move = move
            elif not is_white and eval < min_eval:
                min_eval = eval
                best_move = move
        board.push(best_move)

        return {
            'move': str(best_move),
            'fen': board.fen(),
            'white_turn': board.turn,
            'legal_moves_count': len(list(board.legal_moves)),
            'result': board.outcome().result() if board.outcome() else None,
            'move_number': board.fullmove_number
        }
