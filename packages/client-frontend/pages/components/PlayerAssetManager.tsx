import { useState } from 'react';

const PlayerAssetManager = () => {
    const [activeTab, setActiveTab] = useState('wallet');

    const renderWalletTab = () => (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800">Wallet</h2>
            <p className="mt-2 text-gray-600">View and manage your NFTs. Burn NFTs to add to game, or transfer them.</p>
        </div>
    );

    const renderGameTab = () => (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800">Game</h2>
            <p className="mt-2 text-gray-600">Manage your in-game items and characters. Equip characters and select inventory items.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8 rounded-lg">
            <nav className="flex border-b border-gray-300">
                <button
                    className={`mr-4 py-2 px-4 text-lg ${activeTab === 'wallet' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('wallet')}
                >
                    Wallet
                </button>
                <button
                    className={`py-2 px-4 text-lg ${activeTab === 'game' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('game')}
                >
                    Game
                </button>
            </nav>
            <div className="mt-4">
                {activeTab === 'wallet' ? renderWalletTab() : renderGameTab()}
            </div>
        </div>
    );
};

export default PlayerAssetManager;
