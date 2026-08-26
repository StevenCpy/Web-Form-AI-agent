import './frameContainer.css'

function Base64Image( {base64ImageURL}: {base64ImageURL: string} ) {
	return (
		<div id="base64-img-container">
			<img src={`data:image/png;base64,${base64ImageURL}`} />
		</div>
	)
}

function NoScreenshotText() {
	return (
		<div id="no-screenshot-text">
			Form screenshots will appear here
		</div>
	)
}

function FrameContainer( {screenshot}: {screenshot: string|null} ) {
    return (
        <div id="text-and-screenshot-container">
            <p><b>Live stream of form completion via WebSockets:</b></p>
            <div id="screenshot-container">
                {screenshot ? <Base64Image base64ImageURL={screenshot} /> : <NoScreenshotText />}
            </div>
        </div>
    )
}

export default FrameContainer