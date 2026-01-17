import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="text-white bg-black/90 border-b border-white/10 overflow-hidden">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 via-pink-500/10 to-transparent blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              READY <br />
              SET <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-500">SWEAT</span>
            </h1>

            <p className="mt-6 text-gray-300 max-w-lg">
              Train smarter, track your progress, and achieve your fitness goals
              with personalized workouts and real-time insights.
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                to="/signup"
                className="px-6 py-3 rounded-full bg-linear-to-r from-purple-500 to-pink-500 font-semibold hover:opacity-90 transition"
              >
                Get Started
              </Link>

              <Link
                to="/programs"
                className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition"
              >
                View Programs
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Today’s Activity</h3>

              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>🔥 Calories</span>
                  <span className="text-white font-medium">620 kcal</span>
                </div>
                <div className="flex justify-between">
                  <span>🚶 Steps</span>
                  <span className="text-white font-medium">9,842</span>
                </div>
                <div className="flex justify-between">
                  <span>⏱ Workout</span>
                  <span className="text-white font-medium">45 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat value="10M+" label="Workouts Completed" />
          <Stat value="500K+" label="Active Users" />
          <Stat value="120+" label="Fitness Programs" />
          <Stat value="4.9★" label="App Store Rating" />
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-10">Popular Programs</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Program title="Fat Burn" desc="High intensity workouts to torch calories fast." />
          <Program title="Strength Training" desc="Build muscle with guided strength routines." />
          <Program title="Yoga & Mobility" desc="Improve flexibility and recover faster." />
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-extrabold">
          Start Your Fitness Journey Today
        </h2>
        <p className="mt-4 text-gray-300 max-w-xl mx-auto">
          Join thousands transforming their lives with SWEAT.
        </p>

        <Link
          to="/signup"
          className="inline-block mt-8 px-10 py-4 rounded-full bg-linear-to-r from-purple-500 to-pink-500 font-semibold text-lg hover:opacity-90"
        >
          Get Started Free
        </Link>
      </section>

    </main>
  );
}
function Stat({ value, label }) {
  return (
    <div>
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="mt-2 text-sm text-gray-400">{label}</div>
    </div>
  );
}

function Program({ title, desc }) {
  return (
    <div className="bg-black/60 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-gray-300 text-sm">{desc}</p>
      <button className="mt-6 text-sm text-purple-400 hover:text-purple-300">
        View Program →
      </button>
    </div>
  );
}
