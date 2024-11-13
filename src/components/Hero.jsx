export default function Hero( { scroll } ) {
    return (
        <section className="hero">
            <div className="head">
                <h2>€<span id="redX">X</span>₽€₦$€$</h2>
            </div>
            <div className="content">
                <div className="textbox">
                    <h2>track all your expenses easily</h2>
                    <button onClick={() => scroll()} id="start">start</button>
                </div>
                <img src="images/hero_img.png" alt=""/>
            </div>
        </section>
    )
}