import React from "react";
export default function NotFoundPage() {
  return (
    <>
      <main>
        <div className="relative isolate overflow-hidden min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <p className="text-base font-semibold leading-8">
                404
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight  sm:text-5xl">
                Page not found
              </h1>
              <p className="mt-4 text-base /70 sm:mt-6">
                Sorry, we couldn’t find the page you’re looking for.
              </p>
              <div className="mt-10 flex justify-center">
                <a
                  href="/"
                  className="text-sm font-semibold leading-7"
                >
                  <span aria-hidden="true">&larr;</span> Back to home
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

    </>
  );
}
