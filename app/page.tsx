"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Background from "../components/Background";
import TerminalBtn from "../components/Terminal-btn";

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  display_name?: string;
  global_name?: string;
  avatar_decoration_data?: {
    asset: string;
    sku_id?: string;
  };
}

interface SpotifyData {
  song: string;
  artist: string;
  album?: string;
  album_art_url: string;
  track_id: string;
  timestamps: {
    start: number;
    end: number;
  };
}

async function getDiscordData() {
  const DISCORD_USER_ID = "853758524114993183";
  const res = await fetch(
    `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`
  );
  const data = await res.json();
  return data.data;
}

export default function Home() {
  const [discord, setDiscord] = useState<DiscordUser | null>(null);
  const [spotify, setSpotify] = useState<SpotifyData | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [discordStatus, setDiscordStatus] = useState<string>("offline");

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchDiscordPresence = async () => {
      try {
        const discordData = await getDiscordData();
        if (discordData) {
          setDiscord(discordData.discord_user);
          setSpotify(discordData.spotify);
          setDiscordStatus(discordData.discord_status || "offline");
        }
      } catch {}
    };
    fetchDiscordPresence();
    const interval = setInterval(fetchDiscordPresence, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <Background />
      <div className="w-full max-w-md">
        <div className="border border-zinc-800/50 rounded-lg overflow-hidden flex flex-col relative">
          <div className="h-32 bg-linear-to-r from-gray-600 to-black-600 relative"></div>
          <TerminalBtn />
          <div className="p-8 bg-black-200 flex flex-col gap-8">
            <div className="flex items-start -mt-20">
              <div className="flex flex-col items-start">
                {discord && (
                  <div className="relative w-24 h-24">
                    <Image
                      src={`https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png`}
                      alt="avatar"
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full relative z-10"
                    />
                    {discord?.avatar_decoration_data?.asset && (
                      <Image
                        src={`https://cdn.discordapp.com/avatar-decoration-presets/${discord.avatar_decoration_data.asset}.png`}
                        alt="decoration"
                        width={160}
                        height={160}
                        unoptimized
                        className="w-40 h-40 absolute top-1/2 left-1/2 -translate-x-[58%] -translate-y-[55.8%] z-40 pointer-events-none object-contain"
                      />
                    )}
                    <div
                      className="absolute bottom-1 right-1 w-4.5 h-4.5 -translate-x-[94%] -translate-y-[94%] rounded-full border-3 border-black z-40"
                      style={{
                        backgroundColor:
                          discordStatus === "online"
                            ? "#31a24c"
                            : discordStatus === "idle"
                            ? "#faa61a"
                            : discordStatus === "dnd"
                            ? "#f04747"
                            : "#747f8d",
                      }}
                    />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-xl text-white">
                    {discord?.display_name ||
                      discord?.global_name ||
                      discord?.username}
                  </h3>
                  <p className="text-gray-400 text-sm">@{discord?.username}</p>
                </div>
              </div>
            </div>

            {spotify && spotify.song && (
              <div className="border-t border-zinc-800/50" />
            )}

            {spotify && spotify.song && (
              <div>
                <div className="flex gap-4 items-center relative">
                  <Image
                    src={spotify.album_art_url}
                    alt="album"
                    width={80}
                    height={80}
                    className="w-15 h-15 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-base truncate">
                          {spotify.song}
                        </p>
                        <p className="text-gray-400 text-sm truncate">
                          {spotify.artist}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {spotify.album}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 w-10">
                          {Math.floor((now - spotify.timestamps.start) / 1000) <
                          0
                            ? "0:00"
                            : `${Math.floor(
                                (now - spotify.timestamps.start) / 60000
                              )}:${String(
                                Math.floor(
                                  ((now - spotify.timestamps.start) % 60000) /
                                    1000
                                )
                              ).padStart(2, "0")}`}
                        </span>
                        <div className="flex-1 bg-zinc-700 rounded-full h-1">
                          <div
                            className="bg-green-500 h-1 rounded-full transition-all"
                            style={{
                              width: `${
                                ((now - spotify.timestamps.start) /
                                  (spotify.timestamps.end -
                                    spotify.timestamps.start)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-12 text-right">
                          -{Math.floor((spotify.timestamps.end - now) / 60000)}:
                          {String(
                            Math.floor(
                              ((spotify.timestamps.end - now) % 60000) / 1000
                            )
                          ).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
