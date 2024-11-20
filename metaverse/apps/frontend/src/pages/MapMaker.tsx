import MapEditor from '../components/MapEdittor';

const App = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="mb-8 pb-4 border-b-2 border-gray-200">
                <h1 className="text-4xl font-semibold text-gray-800">
                    Map Editor
                </h1>
            </header>
            <MapEditor />
        </div>
    );
};

export default App;
