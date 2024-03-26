import Image from "next/image";
import { Inter } from "next/font/google";
import PlayerAssetManager from "./components/PlayerAssetManager"

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <PlayerAssetManager />

  );
}



