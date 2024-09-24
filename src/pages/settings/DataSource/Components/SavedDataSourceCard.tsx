import React from 'react';
import { encryptCredentials, decryptCredentials } from '../../../lib/utils';

type SavedDataProps = {
    data: {
        id: string;
        type: string;
        description: string;
        instanceName: string;
        authentication: {
            url: string;
            username: string;
            password: string;
        };
        isCurrentDHIS2: boolean;
    };
};

const SavedDataSourceCard: React.FC<SavedDataProps> = ({ data }) => {
    return (
        <div className="flex justify-center items-center  p-4">
            <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8 max-w-lg w-full">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Instance Name</h3>
                    <p className="text-lg text-gray-700 mb-2">{data.instanceName}</p>
                    <p className="text-sm text-gray-500 mb-4">Data Source Type: {data.type}</p>
                    {data.isCurrentDHIS2 && (
                        <span className="inline-block px-4 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">
                            Current DHIS2
                        </span>
                    )}
                </div>
                <div className="mb-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-1">Description</h4>
                    <p className="text-base text-gray-700">{data.description || 'No description provided'}</p>
                </div>
                <div className="border-t border-gray-300 pt-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">Authentication Details</h4>
                    <p className="text-base text-gray-700 mb-2">
                        <strong className="font-medium">URL:</strong> {data.authentication.url}
                    </p>
                    {/* Uncomment when needed
                    <p className="text-base text-gray-700 mb-2">
                        <strong className="font-medium">Username:</strong> {decryptCredentials(data.authentication.username)}
                    </p>
                    <p className="text-base text-gray-700 mb-2">
                        <strong className="font-medium">Password:</strong> {decryptCredentials(data.authentication.password)}
                    </p>
                    */}
                </div>
            </div>
        </div>
    );
};

export default SavedDataSourceCard;
