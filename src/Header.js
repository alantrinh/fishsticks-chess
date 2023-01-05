const resultText = {
    '1-0': "Checkmate! White wins!",
    '0-1': "Checkmate! Black wins!",
    '1/2-1/2': "Draw"
};

const Header = ({switchOpponent, stockfish, restart, setSearchDepth, searchDepth, result}) => (
    <div class="ui segment">
        <div class="ui two column divided grid">
            <div class="column">
                <button onClick={switchOpponent} class="ui button">
                    {stockfish ? 'Switch opponent to User ' : 'Switch opponent to Stockfish'}
                </button>
                <button onClick={restart} class="ui button">Restart</button>
            </div>
            <div class="column">
                <p>
                    <label>Search Depth: </label>
                    <input onChange={e => setSearchDepth(e.target.value)} value={searchDepth} class="ui focus input" />
                </p>
                {result && <p class="ui yellow message">{resultText[result]}</p>}
           </div>
        </div>
    </div>
);

export default Header;
