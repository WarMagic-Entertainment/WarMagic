import Image from "next/image";

type PlayerState = "idle" | "attack" | "hit" | "dead" | "deadAnim";

interface PlayerSpriteProps {
  playerState: PlayerState;
  setPlayerState: (s: PlayerState) => void;
}

export default function PlayerSprite({
  playerState,
  setPlayerState,
}: PlayerSpriteProps) {
  // mapowanie zamiast ifów
  const sources: Record<PlayerState, string> = {
    idle: "/assets/player/player1/gelorbi_ready.gif",
    attack: "/assets/player/player1/gelorbi_attack.webm",
    hit: "/assets/player/player1/gelorbi_hit.webm",
    deadAnim: "/assets/player/player1/gelorbi_dead.webm",
    dead: "/assets/player/player1/gelorbi_dead.png",
  };

  const isVideo =
    playerState === "attack" ||
    playerState === "hit" ||
    playerState === "deadAnim";

  if (isVideo) {
    return (
      <video
        key={playerState}
        autoPlay
        muted
        playsInline
        className="absolute bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 left-4 sm:left-8 md:left-16 lg:left-30 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] xl:w-[700px] xl:h-[700px] object-contain object-bottom"
        onEnded={() => {
          if (playerState === "deadAnim") setPlayerState("dead");
          else setPlayerState("idle");
        }}
      >
        <source src={sources[playerState]} type="video/webm" />
      </video>
    );
  }

  return (
    <Image
      src={sources[playerState]}
      alt="player"
      width={700}
      height={700}
      className="absolute bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 left-4 sm:left-8 md:left-16 lg:left-30 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] xl:w-[700px] xl:h-[700px] object-contain object-bottom"
    />
  );
}
