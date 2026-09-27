import { useState, useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber"; // hO
import { TextureLoader } from "three"; // sG
import { proxyImageUrl } from "@/components/ascii/utils/utils";

export function ImagePlane({
  imageSrc,
  onLoad,
  alignX = "center",
  alignY = "bottom",
  fit = "cover",
  stretchX = 1,
  stretchY = 1,
  rotationY = 0,
  rotationX = 0,
}) {
  const [texture, setTexture] = useState(null);
  const { viewport } = useThree();
  const meshRef = useRef(null);

  useEffect(() => {
    const loader = new TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      proxyImageUrl(imageSrc),
      (tex) => {
        setTexture(tex);
        onLoad?.();
      },
      undefined,
      (err) => console.error("Failed to load texture:", err)
    );
  }, [imageSrc, onLoad]);

  if (!texture) return null;

  const img = texture.image;
  const aspect = img.width / img.height;
  const viewportAspect = viewport.width / viewport.height;

  let width, height;
  if (fit === "contain" && aspect > viewportAspect) {
    width = viewport.width;
    height = viewport.width / aspect;
  } else {
    height = viewport.height;
    width = viewport.height * aspect;
  }

  const finalW = width * stretchX;
  const finalH = height * stretchY;

  let posX = 0;
  const overflowX = finalW - viewport.width;
  if (alignX === "left") posX = overflowX / 2;
  else if (alignX === "right") posX = -overflowX / 2;

  let posY = 0;
  const overflowY = finalH - viewport.height;
  if (alignY === "bottom") posY = overflowY / 2;
  else if (alignY === "top") posY = -overflowY / 2;

  return (
    <mesh ref={meshRef} position={[posX, posY, 0]} rotation={[rotationX, rotationY, 0]}>
      <planeGeometry args={[finalW, finalH]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.01} />
    </mesh>
  );
}