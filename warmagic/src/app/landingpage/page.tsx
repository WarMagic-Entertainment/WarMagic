import Link from "next/link"

export default function LandingPage() {
    return (
        <section
            className="relative min-h-screen w-screen overflow-hidden"
            style={{ fontFamily: "IsoCore" }}
        >
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-75"
                style={{ backgroundImage: "url('/assets/background/main-pages-background/castle.png')" }}
            ></div>
            <div className="absolute top-4 sm:top-[65px] left-4 sm:left-[100px] text-white text-base sm:text-[20px] font-bold z-10">
                <a href="./landingpage">WarMagic</a>
            </div>
            <div className="absolute top-4 sm:top-[65px] right-4 sm:right-[100px] flex gap-2 sm:gap-4 z-10">
                <a href="../login"><button className="px-4 sm:px-10 py-2 sm:py-4 text-sm sm:text-[17px] text-white transition-all duration-300 bg-[var(--custom-yellow)] hover:bg-[#ebbc6c] backdrop-blur">
                    Sign in
                </button></a>
                <a href="../register"><button className="px-4 sm:px-10 py-2 sm:py-4 text-sm sm:text-[17px] text-white transition-all duration-300 bg-[var(--custom-yellow)] hover:bg-[#ebbc6c] backdrop-blur ">
                    Sign Up
                </button></a>
            </div>

            <div className="absolute left-4 sm:left-[150px] top-1/2 -translate-y-1/2 sm:top-3/7 sm:translate-y-0 text-white z-10">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold">WarMagic</h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mt-2">Placeholder description</p>
                <Link href="/lobby"><button className="mt-4 sm:mt-8 px-6 sm:px-10 py-2 sm:py-4 text-sm sm:text-[17px] text-white transition-all duration-300 bg-[var(--custom-yellow)] hover:bg-[#ebbc6c]">Play</button></Link>
            </div>
        </section>
    )
}