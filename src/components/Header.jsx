import './Header.css'

export default function Header({userAddress, connectWallet, printAddress}) {
    return (
        <header>
            <img className="logo" src="https://splitex.app/assets/images/image15.png?v=4edd4552"></img>
            { (userAddress === '') ? (
                <button className="walletConnectButton" onClick={connectWallet}>Connect wallet</button>
            ) : (
                <div className="walletConnected">
                    <img className="chainConnected" src="https://cryptologos.cc/logos/polygon-matic-logo.png?v=029"></img>
                    <span className="userConnected">Polygon: {printAddress(userAddress)}</span>
                </div>
            ) }
        </header>
    )
}