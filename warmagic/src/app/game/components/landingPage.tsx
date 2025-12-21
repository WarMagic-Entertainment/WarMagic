export default function LandingPage() {
    return(
        <section
        className="relative h-screen w-screen"
        style={{ fontFamily: "IsoCore" }}
        >
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-75"
                style={{ backgroundImage: "url('/assets/background/landingbgimage.png')" }}
            ></div>
            <div className="absolute top-[65px] left-[100px] text-white text-[27px] font-bold">
                WarMagic
            </div>
            <div className="absolute top-[65px] right-[100px] flex gap-4">
                <button className="px-10 py-4 text-[17px] text-white transition-all duration-300 bg-[var(--custom-yellow)] hover:bg-[#ebbc6c] backdrop-blur">
                    Sign in
                </button>
                <button className="px-10 py-4 text-[17px] text-white transition-all duration-300 bg-[var(--custom-yellow)] hover:bg-[#ebbc6c] backdrop-blur">
                    Sign Up
                </button>
            </div>

            <div className="absolute left-[150px] top-3/7 text-white">
                <h1 className="text-9xl font-bold">WarMagic</h1>
                <p className="text-3xl mt-2">Placeholder description</p>
                <button className="mt-8 px-10 py-4 text-[17px] text-white transition-all duration-300 bg-[var(--custom-yellow)] hover:bg-[#ebbc6c]">Play</button>
            </div>
        </section>
    )
}