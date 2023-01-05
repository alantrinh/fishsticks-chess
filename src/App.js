import React, { useState } from 'react';
import './App.css';

import ModelVsStockfish from './integrations/ModelVsStockfish'
import ModelVsUser from './integrations/ModelVsUser'

const App = () => {
    const [stockfish, setStockfish] = useState(true);

    const getScreenWidth = () => Math.min(window.innerWidth * 0.7, window.innerHeight * 0.7);  

    const switchOpponent = () => setStockfish(!stockfish)

    return (
        <div className="container">
            {stockfish ?
            (<ModelVsStockfish
                getScreenWidth={getScreenWidth}
                stockfish={stockfish}
                switchOpponent={switchOpponent}
            />) :
            (<ModelVsUser
                getScreenWidth={getScreenWidth}
                stockfish={stockfish}
                switchOpponent={switchOpponent}
            />)}
        </div>
    );
}

export default App;
