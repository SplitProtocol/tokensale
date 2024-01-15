import "./AmountInput.css"

export default function AmountInput({labelText, tokenImage, tokenSymbol, isReadOnly, extraFieldText, amountValue, onAmountValueChange}) {
    return (
        <div className="aInputDiv">
            <label className="aLabel" htmlFor="aInput">{labelText}</label><br />
            <input className="aInput" type="text" placeholder="0" readOnly={isReadOnly ? true : undefined} value={amountValue} onChange={onAmountValueChange}></input>
            <img className="aTokenImage" src={tokenImage}></img>
            <span className="aTokenSymbol">{tokenSymbol}</span>
            <span className="aExtraField">{extraFieldText}</span>
        </div>
    )
}