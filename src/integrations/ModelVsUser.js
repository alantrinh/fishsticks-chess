import { useEffect, useState } from 'react';
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx';
import Header from '../Header';
import Footer from '../Footer';

const ModelVsUser = props => {
    const [fen, setFen] = useState(null);
    const [result, setResult] = useState(null);
    const [lastStatus, setLastStatus] = useState(null)
    const [status, setStatus] = useState(null);
    const [moveNumber, setMoveNumber] = useState(0);
    const [whiteTurn, setWhiteTurn] = useState(true);
    const [legalMovesCount, setLegalMoves] = useState(20); // initial legal moves count is 20
    const [searchDepth, setSearchDepth] = useState(2)

    // get board from backend
    useEffect(() => {
        getBoard();
    }, [])

    useEffect(() => {
        if (!whiteTurn) {
            getModelMove();
        }
    }, [whiteTurn])

    const switchToStockfish = () => {
        props.switchOpponent();
        restart();
    }

    const restart = async () => {
        const response = await fetch('/restart');
        const { fen: updatedFen, white_turn, result: updatedResult, move_number } = await response.json();

        setFen(updatedFen);
        setWhiteTurn(white_turn);
        setResult(updatedResult);
        setMoveNumber(move_number);
    }

    const getBoard = async () => {
        setStatus('Getting board...');
        const response = await fetch(`/board`);
        const { fen: updatedFen, white_turn, legal_moves_count, result: updatedResult, move_number } = await response.json();
        setStatus('Board retrieved');

        setFen(updatedFen);
        setWhiteTurn(white_turn);
        setLegalMoves(legal_moves_count);
        setResult(updatedResult);
        setMoveNumber(move_number);
    }

    const onDrop = async ({ sourceSquare, targetSquare }) => {
        // see if the move is legal
        const move = new Chess(fen).move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q"
        });
    
        // illegal move
        if (move === null) return;
    
        const response = await fetch(`/move/${move['from']+move['to']}`);
        const { fen: updatedFen, white_turn, legal_moves_count, result: updatedResult, move_number } = await response.json();

        setFen(updatedFen);
        setWhiteTurn(white_turn);
        setLegalMoves(legal_moves_count);
        setResult(updatedResult);
        setMoveNumber(move_number);
    };

    const getModelMove = async () => {
        setLastStatus(status);
        setStatus(`Calculating with depth ${searchDepth}...`);

        const response = await fetch(`/model-move/${false}/${searchDepth}`); // false means model is black
        const { move, move_time, fen: updatedFen, white_turn, legal_moves_count, result: updatedResult, move_number } = await response.json();

        if (updatedFen) {
            setFen(updatedFen);
        }
        setWhiteTurn(white_turn);
        setLegalMoves(legal_moves_count);
        setResult(updatedResult);
        setLastStatus(status);
        setStatus(`Move found ${move} in ${move_time}s`);
        setMoveNumber(move_number);
    }

    return (
        <div className="chessboard">
            <Header
                {...{
                    restart,
                    setSearchDepth,
                    searchDepth,
                    result
                }}
                switchOpponent={switchToStockfish}
                stockfish={props.stockfish}
            />
            <Chessboard
                id="model-vs-stockfish"
                position={fen}
                orientation="white"
                calcWidth={props.getScreenWidth}
                onDrop={onDrop}
                draggable={whiteTurn}
            />
            <Footer
                {...{
                    moveNumber,
                    legalMovesCount,
                    lastStatus,
                    status
                }}
                whiteTurn={`Your turn: ${whiteTurn}`}
            />
        </div>
    );
}

export default ModelVsUser;
