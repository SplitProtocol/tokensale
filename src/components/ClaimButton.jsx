import "./ClaimButton.css"

export default function ClaimButton({claimButtonShowedCondition, claimButtonDisabledCondition, approveToken, claimNFT, payToken}) {
    return (
        <>
            { (claimButtonShowedCondition) ? (
                <button className={ (claimButtonDisabledCondition) ? "claimButtonDisabled" : "claimButton" } disabled={claimButtonDisabledCondition} onClick={claimNFT}>Claim</button>
            ) : (
                <button className={ (claimButtonDisabledCondition) ? "claimButtonDisabled" : "claimButton" } disabled={claimButtonDisabledCondition} onClick={approveToken}>Approve {payToken}</button>
            ) }
        </>
    )
}