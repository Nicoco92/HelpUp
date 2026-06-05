import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow py-20 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-6 drop-shadow-sm">
          L'entraide de proximité,<br/>
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            réinventée.
          </span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium">
          Besoin d'aide pour le quotidien ou envie de proposer vos services ?
          Rejoignez HELP'UP, la plateforme qui connecte les besoins et les talents locaux.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link
            href="/register?type=client"
            className="px-8 py-4 border border-transparent text-lg font-bold rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            Je cherche de l'aide
          </Link>
          <Link
            href="/register?type=provider"
            className="px-8 py-4 border-2 border-blue-100 text-lg font-bold rounded-full text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-200 transform hover:-translate-y-1 transition-all shadow-sm"
          >
            Je propose mes services
          </Link>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px]"></div>
      </div>
    </div>
  );
}
