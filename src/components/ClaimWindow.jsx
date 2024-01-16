import { ethers } from "ethers"
import { BigNumber } from "bignumber.js"
import AmountInput from "./AmountInput"
import ChooseButton from "./ChooseButton"
import "./ClaimWindow.css"
import { useCallback, useEffect, useState } from "react"
import ClaimButton from "./ClaimButton"

export default function ClaimWindow({provider, addr, isMetamaskActive}) {
    const [payToken, setPayToken] = useState('USDT');
    const [balance, setBalance] = useState('0');
    const [balanceWEI, setBalanceWEI] = useState('0');
    const [allowanceWEI, setAllowanceWEI] = useState('0');
    const [tokenDecimals, setTokenDecimals] = useState('6');
    const [tokenAmount, setTokenAmount] = useState('0');
    const [usdAmount, setUsdAmount] = useState('0');
    const [approvalSuccess, setApprovalSuccess] = useState(false);

    const usdcLogo = 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=029';
    const usdtLogo = 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=029';
    const vesplxLogo = 'https://splitex.app/assets/images/favicon.png?v=4edd4552';

    const usdtAddr = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
    const usdcAddr = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
    const splxSaleAddr = '0xcE861C6360A061354D18668BEbC7aa2A76bBf5c7';

    async function getTokenBalance(tokenAddr) {
        if (!isMetamaskActive) {
            setBalanceWEI('0');
            setBalance('0');
            setAllowanceWEI('0');
            return;
        }
        try {
            const tokenContract = new ethers.Contract(tokenAddr, [
                'function balanceOf(address account) external view returns (uint256)',
                'function decimals() external view returns (uint8)',
                'function allowance(address account, address spender) external view returns (uint256)'
            ], provider);
            const balanceWeiRaw = await tokenContract.balanceOf(addr);
            const decimalsRaw = await tokenContract.decimals();
            const allowanceRaw = await tokenContract.allowance(addr, splxSaleAddr);
            const balanceWei = new BigNumber(balanceWeiRaw.toString());
            const decimals = new BigNumber(decimalsRaw.toString()).negated();
            const allowance = new BigNumber(allowanceRaw.toString());
            const balance = balanceWei.multipliedBy(new BigNumber(10).pow(decimals)).toNumber();
            setTokenDecimals(decimals.toString());
            setBalanceWEI(balanceWei.toFixed(0));
            setBalance(balance + '');
            setAllowanceWEI(allowance.toFixed(0));
        } catch(err) {
            setBalanceWEI('0');
            setBalance('0');
            setAllowanceWEI('0');
        }
    }

    async function loadData(tokenSym) {
        const tokenAddr = (tokenSym == 'USDT') ? usdtAddr : usdcAddr;
        setBalance('loading...');
        setPayToken(tokenSym);
        await getTokenBalance(tokenAddr);
    }

    function calculateSPLXfromUSD(amountUSD) {
        return new BigNumber(amountUSD).multipliedBy(20).toNumber();
    }

    function showReceive(amount) {
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum)) {
            setTokenAmount('0');
            setUsdAmount('0');
        } else {
            const splxAmount = calculateSPLXfromUSD(amountNum).toString();
            setTokenAmount(splxAmount);
            setUsdAmount(amountNum);
        }
    }

    const firstDataLoad = useCallback(async (tokenAddr) => {
        try {
            const tokenContract = new ethers.Contract(tokenAddr, [
                'function balanceOf(address account) external view returns (uint256)',
                'function decimals() external view returns (uint8)',
                'function allowance(address account, address spender) external view returns (uint256)'
            ], provider);
            const balanceWeiRaw = await tokenContract.balanceOf(addr);
            const decimalsRaw = await tokenContract.decimals();
            const allowanceRaw = await tokenContract.allowance(addr, splxSaleAddr);
            const balanceWei = new BigNumber(balanceWeiRaw.toString());
            const decimals = new BigNumber(decimalsRaw.toString()).negated();
            const allowance = new BigNumber(allowanceRaw.toString());
            const balance = balanceWei.multipliedBy(new BigNumber(10).pow(decimals)).toNumber();
            setTokenDecimals(decimals.toString());
            setBalanceWEI(balanceWei.toFixed(0));
            setBalance(balance + '');
            setAllowanceWEI(allowance.toFixed(0));
        } catch(err) {
            setBalanceWEI('0');
            setBalance('0');
            setAllowanceWEI('0');
        }
    }, [provider, addr]);

    useEffect(() => {
        firstDataLoad(usdtAddr);
    }, [firstDataLoad]);

    const claimButtonDisabledCondition = ((new BigNumber(usdAmount).gt(new BigNumber(10000))) || (new BigNumber(usdAmount).lt(new BigNumber(50))) || !isMetamaskActive || (new BigNumber(usdAmount).multipliedBy(new BigNumber(10).pow(new BigNumber(tokenDecimals).negated())).gt(new BigNumber(balanceWEI))));
    const claimButtonShowedCondition = new BigNumber(usdAmount).multipliedBy(new BigNumber(10).pow(new BigNumber(tokenDecimals).negated())).lte(new BigNumber(allowanceWEI)) || approvalSuccess;

    async function approveToken() {
        const usdAmountWEI = new BigNumber(usdAmount).multipliedBy(new BigNumber(10).pow(new BigNumber(tokenDecimals).negated()));
        const tokenAddr = (payToken == 'USDT') ? usdtAddr : usdcAddr;
        const tokenContract = new ethers.Contract(tokenAddr, [
            'function approve(address spender, uint256 amount) external returns (bool)'
        ], provider);
        try {
            const tx = await tokenContract.approve(splxSaleAddr, usdAmountWEI.toFixed(0));
            await tx.wait();
            setApprovalSuccess(true);
            alert('Approval transaction successful: ' + tx.hash);
        } catch (err) {
            alert(err);
        }
    }

    async function claimNFT() {
        const usdAmountWEI = new BigNumber(usdAmount).multipliedBy(new BigNumber(10).pow(new BigNumber(tokenDecimals).negated()));
        const tokenAddr = (payToken == 'USDT') ? usdtAddr : usdcAddr;
        const splxSaleContract = new ethers.Contract(splxSaleAddr, [
            'function buyLockedSPLX(address token, uint256 amount) external'
        ], provider);
        try {
            const tx = await splxSaleContract.buyLockedSPLX(tokenAddr, usdAmountWEI.toFixed(0));
            await tx.wait();
            setApprovalSuccess(false);
            alert('NFT claim transaction successful: ' + tx.hash);
        } catch (err) {
            alert(err);
        }
    }

    return (
        <div className="clWindow">
            <h3 className="clHead">Claim veSPLX NFT</h3>
            <AmountInput labelText="You pay:" tokenImage={(payToken == 'USDT') ? usdtLogo : usdcLogo} tokenSymbol={payToken} isReadOnly={false} extraFieldText={"Balance: " + balance + " " + payToken} onAmountValueChange={(event) => showReceive(event.target.value)} />
            <center>
                <ChooseButton onClick={async () => { await loadData('USDT') }} buttonText="USDT&nbsp;&nbsp;" buttonImage={usdtLogo} />
                <ChooseButton onClick={async () => { await loadData('USDC') }} buttonText="USDC&nbsp;&nbsp;" buttonImage={usdcLogo} />
            </center>
            <AmountInput labelText="You receive:" tokenImage={vesplxLogo} tokenSymbol="SPLX" isReadOnly={true} extraFieldText="Lock: 6 months" amountValue={tokenAmount} />
            <span className="clPriceLabel">1 SPLX is 0.05 USD</span><br></br>
            <span className="clPriceLabel">Min: 100 USD</span><br></br>
            <span className="clPriceLabel">Max: 10000 USD</span>
            <ClaimButton claimButtonShowedCondition={claimButtonShowedCondition} claimButtonDisabledCondition={claimButtonDisabledCondition} approveToken={approveToken} claimNFT={claimNFT} payToken={payToken} />
        </div>
    )
}