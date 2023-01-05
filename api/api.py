from timeit import default_timer as timer
from flask import Flask, jsonify
from engine import Engine
from stockfish import Stockfish
import chess

app = Flask(__name__)
engine = Engine()
stockfish = Stockfish()

board = chess.Board()
isProcessing = False

@app.route('/restart')
def restart():
    global isProcessing
    isProcessing = False
    board.reset()
    return jsonify({
        'fen': board.fen(),
        'white_turn': board.turn,
        'result': board.outcome().result() if board.outcome() else None,
        'move_number': board.fullmove_number
    })

@app.route('/board')
def get_board():
    # wait for any outstanding processing before retrieving the current board
    global isProcessing
    while isProcessing:
        print('Is processing, waiting...')
    return jsonify({
        'fen': board.fen(),
        'white_turn': board.turn,
        'legal_moves_count': len(list(board.legal_moves)),
        'result': board.outcome().result() if board.outcome() else None,
        'move_number': board.fullmove_number
    })

@app.route('/move/<string:move>')
def move(move):
    board.push_uci(move)
    return jsonify({
        'fen': board.fen(),
        'white_turn': board.turn,
        'legal_moves_count': len(list(board.legal_moves)),
        'result': board.outcome().result() if board.outcome() else None,
        'move_number': board.fullmove_number
    })

@app.route('/model-move/<string:is_white_string>/<int:depth>')
def get_move(depth, is_white_string):
    global isProcessing
    is_white = True if is_white_string == 'true' else False
    # return if isProcessing or it is not the model's turn
    if isProcessing or is_white != board.turn:
        return jsonify({
            'white_turn': board.turn,
            'legal_moves_count': len(list(board.legal_moves)),
            'result': board.outcome().result() if board.outcome() else None,
            'move_number': board.fullmove_number
        })
    
    start_time = timer() # time how long the engine takes to move
    isProcessing = True
    move = engine.get_move(board, depth, is_white)
    isProcessing = False
    move_time = round(timer() - start_time, 2)
    move['move_time'] = move_time
    return jsonify(move)

@app.route('/stockfish-move')
def get_stockfish_move():
    global isProcessing
    if isProcessing:
        return jsonify({
            'white_turn': board.turn,
            'legal_moves_count': len(list(board.legal_moves)),
            'result': board.outcome().result() if board.outcome() else None,
            'move_number': board.fullmove_number
        })

    isProcessing = True
    move = stockfish.get_move(board)
    isProcessing = False
    return jsonify(move)

if __name__ == '__main__':
    app.run(debug=True)
