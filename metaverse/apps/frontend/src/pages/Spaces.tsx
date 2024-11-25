import { useParams } from 'react-router-dom';
import Space from '../components/space';

const Spaces = () => {
    const {id} = useParams<{id: string}>()
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="mb-8 pb-4 border-b-2 border-gray-200">
                <h1 className="text-4xl font-semibold text-gray-800">
                    Space {id}
                </h1>
            </header>
            <Space spaceId={id || ''} />
        </div>
    );
};

export default Spaces;