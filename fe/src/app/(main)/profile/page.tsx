"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useState } from "react";

const topTabs = ["Profile", "Activity", "Saves", "Settings"];

const activitySubs = [
  { key: "Summary", tooltip: "" },
  { key: "Answers", tooltip: "Answers you have posted" },
  { key: "Questions", tooltip: "Questions you have asked" },
  { key: "Tags", tooltip: "Tags you have posts in" },
  { key: "Articles", tooltip: "Articles you have written" },
  { key: "Badges", tooltip: "Badges you have earned" },
  { key: "Following", tooltip: "Posts you are following" },
  { key: "Bounties", tooltip: "Bounties you have started" },
  { key: "Reputation", tooltip: "Reputation you have earned" },
  { key: "All actions", tooltip: "All your actions" },
  { key: "Responses", tooltip: "Responses to your posts" },
  { key: "Votes", tooltip: "Votes you have cast" },
];

export default function ProfilePage() {
  const [activeTopTab, setActiveTopTab] = useState("Activity");
  const [activeSub, setActiveSub] = useState("Summary");

  return (
    <MainLayout>
      <div className="px-6 py-6 max-w-6xl mx-auto">

        <div className="flex items-start justify-between mb-6">
          <div className="flex gap-5 items-start">
            <div className="w-32 h-32 rounded flex-6 overflow-hidden" style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gridTemplateRows: "repeat(8, 1fr)" }}>
              {Array.from({ length: 64 }).map((_, i) => {
                const row = Math.floor(i / 8);
                const col = i % 8;
                const pattern = [
                  [1,0,1,0,0,1,0,1],
                  [0,2,0,1,1,0,2,0],
                  [1,0,3,0,0,3,0,1],
                  [0,1,0,2,2,0,1,0],
                  [0,1,0,2,2,0,1,0],
                  [1,0,3,0,0,3,0,1],
                  [0,2,0,1,1,0,2,0],
                  [1,0,1,0,0,1,0,1],
                ];
                const colors = ["#ffffff", "#5ac8a0", "#3db888", "#2da070"];
                return <div key={i} style={{ backgroundColor: colors[pattern[row][col]] }} />;
              })}
            </div>

            <div className="pt-2">
              <h1 className="text-3xl font-normal text-[#232629] mb-3">silpii</h1>
              <div className="flex flex-wrap gap-5 text-sm text-[#6a737c]">
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 1a4 4 0 100 8A4 4 0 009 1zM3 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#6a737c" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Member for 9 days
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="#6a737c" strokeWidth="1.5"/><path d="M9 5v4l2.5 2.5" stroke="#6a737c" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Last seen this week
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><rect x="1" y="3" width="16" height="13" rx="1.5" stroke="#6a737c" strokeWidth="1.5"/><path d="M1 7h16M6 1v4M12 1v4" stroke="#6a737c" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Visited 5 days, 3 consecutive
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#525960] border border-[#babfc4] rounded hover:bg-[#f1f2f3]">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M13 2l3 3-9 9H4v-3L13 2z" stroke="#525960" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              Edit profile
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#525960] border border-[#babfc4] rounded hover:bg-[#f1f2f3]">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><rect x="1" y="3" width="16" height="11" rx="1.5" stroke="#525960" strokeWidth="1.5"/><path d="M6 14l-2 3M12 14l2 3M4 17h10" stroke="#525960" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Network profile
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-[#e3e6e8] mb-5">
          {topTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTopTab(tab)}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                activeTopTab === tab
                  ? "bg-[#f48225] text-white font-medium"
                  : "text-[#525960] hover:bg-[#f1f2f3]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTopTab === "Activity" && (
          <div className="flex gap-6">

            <div className="w-36 flex-6">
              {activitySubs.map((sub) => (
                <div key={sub.key} className="relative group">
                  <button
                    onClick={() => setActiveSub(sub.key)}
                    className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${
                      activeSub === sub.key
                        ? "bg-[#e3e6e8] text-[#232629] font-bold"
                        : "text-[#525960] hover:bg-[#f1f2f3]"
                    }`}
                  >
                    {sub.key}
                  </button>

                  {sub.tooltip && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-10 hidden group-hover:block">
                      <div className="bg-[#3b4045] text-white text-xs rounded px-2.5 py-1.5 whitespace-nowrap">
                        {sub.tooltip}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex-1 min-w-0">

              {activeSub === "Summary" && (
                <div>
                  <h2 className="text-xl font-normal text-[#232629] mb-4">Summary</h2>

                  <div className="grid grid-cols-3 gap-4 mb-6">

                    <div className="border border-[#e3e6e8] rounded-md p-5 flex flex-col items-center justify-center text-center gap-3">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M8 36l8-8 6 6 10-14 8 10" stroke="#babfc4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M40 20V8H28" stroke="#babfc4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-[#232629]">Reputation is how the community thanks you</p>
                        <p className="text-xs text-[#6a737c] mt-1">When users upvote your helpful posts, you'll earn reputation and unlock new privileges.</p>
                      </div>
                      <p className="text-xs text-[#6a737c]">
                        Learn more about <span className="text-[#0074cc] cursor-pointer hover:underline">reputation</span> and <span className="text-[#0074cc] cursor-pointer hover:underline">privileges</span>
                      </p>
                    </div>

                    <div className="border border-[#e3e6e8] rounded-md p-4 flex flex-col justify-between">
                      <div className="text-xs font-medium text-[#6a737c] tracking-wide mb-3">BADGES</div>
                      <div className="border border-[#e3e6e8] bg-[#fdf7e3] rounded px-3 py-2 flex items-center gap-2 mb-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#cc7722] inline-block"></span>
                        <span className="text-sm font-medium">2</span>
                      </div>
                      <div className="mt-auto">
                        <div className="flex justify-between items-center text-xs text-[#6a737c] mb-2">
                          <span>Newest</span>
                          <span>Next badge ⚙ <span className="ml-2">0/1</span></span>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1.5 border border-[#e3e6e8] rounded px-2 py-1 text-xs">
                            <span className="w-2 h-2 rounded-full bg-[#f48225] inline-block"></span>
                            Critic
                          </div>
                          <div className="flex items-center gap-1.5 border border-[#e3e6e8] rounded px-2 py-1 text-xs flex-1 justify-center">
                            <span className="w-2 h-2 rounded-full bg-[#cc7722] inline-block"></span>
                            Informed
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-[#e3e6e8] rounded-md p-4">
                      <div className="text-xs font-medium text-[#6a737c] tracking-wide mb-3">IMPACT</div>
                      <div className="flex gap-6 mb-4">
                        <div>
                          <div className="text-2xl font-normal text-[#232629]">0</div>
                          <div className="text-xs text-[#6a737c]">people reached</div>
                        </div>
                        <div>
                          <div className="text-2xl font-normal text-[#232629]">0</div>
                          <div className="text-xs text-[#6a737c]">posts edited</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#6a737c] mb-2">
                        <span>🔒</span>
                        <span>1/15 - unlock flags</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#6a737c]">
                        <span>🔒</span>
                        <span>1/15 - unlock voting</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-[#e3e6e8] rounded-md overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e6e8]">
                        <h3 className="text-base font-normal text-[#232629]">Answers</h3>
                        <div className="flex gap-1">
                          {["Score", "Activity", "Newest"].map((f) => (
                            <button key={f} className={`px-2 py-0.5 text-xs rounded border ${f === "Newest" ? "border-[#babfc4] bg-[#e3e6e8] font-medium" : "border-transparent text-[#525960] hover:border-[#babfc4]"}`}>{f}</button>
                          ))}
                        </div>
                      </div>
                      <div className="px-4 py-8 text-center text-sm text-[#6a737c]">
                        You have not <span className="text-[#0074cc] cursor-pointer hover:underline">answered</span> any questions
                      </div>
                    </div>
                    <div className="border border-[#e3e6e8] rounded-md overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e6e8]">
                        <h3 className="text-base font-normal text-[#232629]">Questions</h3>
                        <div className="flex gap-1">
                          {["Score", "Activity", "Newest", "Views"].map((f) => (
                            <button key={f} className={`px-2 py-0.5 text-xs rounded border ${f === "Score" ? "border-[#babfc4] bg-[#e3e6e8] font-medium" : "border-transparent text-[#525960] hover:border-[#babfc4]"}`}>{f}</button>
                          ))}
                        </div>
                      </div>
                      <div className="px-4 py-8 text-center text-sm text-[#6a737c]">
                        You have not <span className="text-[#0074cc] cursor-pointer hover:underline">asked</span> any questions
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSub === "Reputation" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-normal text-[#232629]">1 Reputation</h2>
                    <div className="flex border border-[#babfc4] rounded overflow-hidden">
                      {["Post", "Time", "Graph"].map((f, i) => (
                        <button key={f} className={`px-3 py-1 text-sm border-r border-[#babfc4] last:border-r-0 ${i === 0 ? "bg-[#e3e6e8] font-semibold" : "bg-white text-[#525960] hover:bg-[#f1f2f3]"}`}>{f}</button>
                      ))}
                    </div>
                  </div>
                  <div className="border border-[#e3e6e8] rounded-md p-14 text-center text-sm text-[#6a737c] mb-3">
                    You have no <span className="text-[#0074cc] cursor-pointer hover:underline">reputation changes</span>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[#525960] cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5" />
                    show removed posts
                  </label>
                </div>
              )}

              {!["Summary", "Reputation"].includes(activeSub) && (
                <div className="border border-[#e3e6e8] rounded-md px-4 py-10 text-center text-sm text-[#6a737c]">
                  No {activeSub.toLowerCase()} yet.
                </div>
              )}

            </div>
          </div>
        )}

        {activeTopTab === "Profile" && (
          <div className="border border-[#e3e6e8] rounded-md px-4 py-10 text-center text-sm text-[#6a737c]">
            Belum ada informasi profil.
          </div>
        )}

        {activeTopTab === "Saves" && (
          <div className="border border-[#e3e6e8] rounded-md px-4 py-10 text-center text-sm text-[#6a737c]">
            No saved items yet.
          </div>
        )}

        {activeTopTab === "Settings" && (
          <div>
            <div className="border border-[#e3e6e8] rounded-md overflow-hidden mb-4">
              <div className="px-4 py-3 bg-[#f8f9f9] border-b border-[#e3e6e8] font-semibold text-sm">Public information</div>
              <div className="flex justify-between items-center px-4 py-3 border-b border-[#f1f2f3]">
                <div>
                  <div className="text-sm font-medium">Display name</div>
                  <div className="text-xs text-[#6a737c]">This is how others will see your name.</div>
                </div>
                <input defaultValue="silpii" className="border border-[#babfc4] rounded px-3 py-1.5 text-sm w-60 outline-none focus:border-[#0a95ff]" />
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <div>
                  <div className="text-sm font-medium">Location</div>
                  <div className="text-xs text-[#6a737c]">Enter your location.</div>
                </div>
                <input placeholder="e.g. Indonesia" className="border border-[#babfc4] rounded px-3 py-1.5 text-sm w-60 outline-none focus:border-[#0a95ff]" />
              </div>
            </div>
            <button className="bg-[#0a95ff] text-white px-4 py-2 rounded text-sm hover:bg-[#0074cc]">
              Save profile
            </button>
          </div>
        )}

      </div>
    </MainLayout>
  );
}