import { useState, useEffect, useRef } from 'react'
import Chessboard from 'chessboardjsx';
import Footer from '../Footer';
import Header from '../Header';

const ModelVsStockfish = props => {
    const [fen, setFen] = useState(null);
    const [result, setResult] = useState(null);
    const [lastStatus, setLastStatus] = useState(null)
    const [status, setStatus] = useState(null);
    const [moveNumber, setMoveNumber] = useState(0);
    const [whiteTurn, setWhiteTurn] = useState(true);
    const [legalMovesCount, setLegalMoves] = useState(20); // initial legal moves count is 20
    const [searchDepth, setSearchDepth] = useState(2)

    const isInitialMount = useRef(true);

    // get board from backend
    useEffect(() => {
        getBoard();
    }, [])

    useEffect(() => {
        // Do not run on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {  
            if (!result && whiteTurn) {
                getModelMove();
            } else if (!result) {
                getStockfishMove();
            }
        }
    }, [fen]);

    const switchToUser = () => {
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

    const getModelMove = async () => {
        setLastStatus(status);
        setStatus(`Calculating with depth ${searchDepth}...`);

        const response = await fetch(`/model-move/${true}/${searchDepth}`); // true means model is white
        const { move, move_time, fen: updatedFen, white_turn, legal_moves_count, result: updatedResult, move_number } = await response.json();

        if (updatedFen) {
            setFen(updatedFen);
        }
        setWhiteTurn(white_turn);
        setLegalMoves(legal_moves_count)
        setResult(updatedResult);
        setLastStatus(status);
        setStatus(`Move found ${move} in ${move_time}s`);
        setMoveNumber(move_number);
    }

    const getStockfishMove = async () => {
        const response = await fetch(`/stockfish-move`);
        const { move, fen: updatedFen, white_turn, legal_moves_count, result: updatedResult, move_number } = await response.json();

        if (updatedFen) {
            setFen(updatedFen);
        }
        setWhiteTurn(white_turn);
        setLegalMoves(legal_moves_count)
        setResult(updatedResult);
        setLastStatus(status);
        // setStatus(`Stockfish move found ${move}`);
        setMoveNumber(move_number);
    }

    return (
        <div>
            <Header
                {...{
                    restart,
                    setSearchDepth,
                    searchDepth,
                    result
                }}
                switchOpponent={switchToUser}
                stockfish={props.stockfish}
            />
            <div className={`chessboard ${result ? 'result' : ''}`}>
                <Chessboard
                    id="model-vs-stockfish"
                    position={fen}
                    orientation="white"
                    calcWidth={props.getScreenWidth}
                    draggable={false}
                />
            </div>
            <Footer
                {...{
                    moveNumber,
                    legalMovesCount,
                    lastStatus,
                    status
                }}
                whiteTurn={`White turn: ${whiteTurn}`}
            />
        </div>
    );
};

export default ModelVsStockfish;
