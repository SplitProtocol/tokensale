import "./ChooseButton.css"

export default function ChooseButton({buttonText, buttonImage, onClick}) {
    return (
        <button onClick={onClick} className="chooseButton">
            <center>
                <img className="chooseButtonImage" src={buttonImage}></img>
                <span className="chooseButtonText">{buttonText}</span>
            </center>
        </button>
    )
}