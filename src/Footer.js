const Footer = ({ moveNumber, whiteTurn, legalMovesCount, lastStatus, status }) => (
    <div class="ui segment">
        <div class="ui two column divided grid">
            <div class="column">
                <p>{`Move number: ${moveNumber}`}</p>
                <p>{whiteTurn}</p>
                <p>{`There are ${legalMovesCount} legal moves`}</p>
            </div>
            <div class="column">
                <p>{lastStatus && 'Last status: ' + lastStatus}</p>
                <p>{status && 'Status: ' + status}</p>
            </div>
        </div>
    </div>
);

export default Footer;
