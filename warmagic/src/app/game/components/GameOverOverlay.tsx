import { useRouter } from "next/navigation";

export default function GameOverOverlay() {
    const router = useRouter();

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/90 z-50 p-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-red-600 mb-4 sm:mb-6 lg:mb-8 animate-pulse text-center">
                GAME OVER
            </h1>
            <button
                onClick={() => router.push('/lobby')}
                className="bg-[var(--custom-yellow)] text-black font-bold p-3 sm:p-4 lg:p-5 px-6 sm:px-8 lg:px-12 text-base sm:text-xl lg:text-2xl rounded hover:scale-110 transition-transform"
            >
                Return to Lobby
            </button>
        </div>
    );
}
