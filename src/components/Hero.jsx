export default function Hero( { scroll } ) {
    return (
        <section className="hero">
            <div className="head">
                <h1>€<span id="redX">X</span>₽€₦$€$</h1>
            </div>
            <div className="content">
                <div className="textbox">
                    <h1>track all your expenses easily</h1>
                    <button onClick={() => scroll()} id="start">start</button>
                </div>
                <img src="images/hero_img.png"/>
            </div>
        </section>
    )
}