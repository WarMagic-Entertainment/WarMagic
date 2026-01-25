import Image from "next/image";
import {
  getEnemyAsset,
  getEnemySizeClass,
  getEnemyPositionClass,
  isVideoAsset,
} from "../constants";

interface EnemySpriteProps {
  currentEnemy: { name: string } | null;
  enemyState: "idle" | "attack" | "hit" | "dead";
}

export default function EnemySprite({
  currentEnemy,
  enemyState,
}: EnemySpriteProps) {

  if (!currentEnemy) return null;

  const src = getEnemyAsset(currentEnemy.name, enemyState);
  const isVideo = isVideoAsset(src);

  const sizeClass = getEnemySizeClass(currentEnemy.name);
  const positionClass = getEnemyPositionClass(
    currentEnemy.name,
    isVideo
  );

  return (
    <div
      className={`absolute ${sizeClass} ${positionClass} transition-all duration-200 ${
        enemyState === "hit" ? "brightness-150" : ""
      }`}
    >
      {isVideo ? (
        <video
          key={`${currentEnemy.name}-${enemyState}`}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-contain object-bottom"
        >
          <source src={src} type="video/webm" />
        </video>
      ) : (
        <Image
          key={`${currentEnemy.name}-${enemyState}`}
          src={src}
          alt={currentEnemy.name}
          fill
          className="object-contain object-bottom"
          unoptimized
        />
      )}
    </div>
  );
}
