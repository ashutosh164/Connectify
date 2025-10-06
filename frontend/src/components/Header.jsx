
export default function Header() {


  

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow-md flex items-center px-6 z-50">
      <h1 className="text-xl font-bold text-green-500">Connectify</h1>

      <input type="text" placeholder="Search..." className="ml-6 px-3 py-1 border rounded-2xl flex-1 max-w-md"/>
    </header>
  );
}
