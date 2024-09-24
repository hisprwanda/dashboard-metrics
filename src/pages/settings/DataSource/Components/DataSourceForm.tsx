import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateUid } from '../../../../lib/uid';
import { useDataEngine } from '@dhis2/app-runtime';
import { AlertBar } from '@dhis2/ui';
import { useDataSourceData } from '../../../../services/DataSourceHooks';
//import {  Button } from '@dhis2/ui'; 
import Button from "../../../../components/Button"
import { DataSourceFormFields, DataSourceSchema} from '../../../../types/DataSource';
import { encryptCredentials,decryptCredentials } from '../../../../lib/utils';
import { IoSaveOutline } from "react-icons/io5";



const dataSourceOptions = [
    { name: 'DHIS2' },
    { name: 'Other' }
];

type DataSourceFormProps = {
    title: string;
    action?: 'create' | 'update';
    refetch?: any;
    data?: any;
   setIsShowDataSourceForm?:any;
   setIsShowDataSourceFormEdit:any
};

const DataSourceForm: React.FC<DataSourceFormProps> = ({ title, action, refetch, data, setIsShowDataSourceForm, setIsShowDataSourceFormEdit }) => {
    const { data: allSavedDataSources } = useDataSourceData();



    
    const savedDataSource = data?.value;

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<DataSourceFormFields>({
        defaultValues: {
            isCurrentDHIS2: false,
            id: generateUid(),
            authentication: {
                url: '',
                username: '',
                password: '',
            },
            instanceName: '',
            description: '',
        },
        resolver: zodResolver(DataSourceSchema),
    });

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const engine = useDataEngine();

    // Auto-populate form fields if action is "update"
    useEffect(() => {
        if (action === 'update' && savedDataSource) {
            // Decrypt the username and password before setting the form values
            const decryptedUsername = decryptCredentials(savedDataSource.authentication.username);
            const decryptedPassword = decryptCredentials(savedDataSource.authentication.password);
    
            // Populate the form with decrypted credentials
            reset({
                ...savedDataSource,
                authentication: {
                    ...savedDataSource.authentication,
                    username: decryptedUsername,
                    password: decryptedPassword,
                }
            });
        }
    }, [action, savedDataSource, reset]);
    

// Handle form submission
const onSubmit: SubmitHandler<DataSourceFormFields> = async (formData) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    // Determine if we're updating an existing entry
    const isUpdate = action === 'update' && data?.key;
    const currentUrl = isUpdate ? savedDataSource?.authentication?.url : '';

    // Check for duplicate URL, excluding the current item's URL if we're updating
    const existingUrl = allSavedDataSources?.dataStore?.entries?.some(
        (entry: any) =>
            entry.value.authentication.url === formData.authentication.url &&
            entry.key !== data?.key // Ensure we exclude the current entry being edited
    );
  // Show error if URL already exists
    if (existingUrl) {
        setErrorMessage('The URL already exists. Please use a different URL.');
        return;
    }

    try {
        // Encrypt username and password before saving to the DB
        const encryptedUsername = encryptCredentials(formData.authentication.username);
        const encryptedPassword = encryptCredentials(formData.authentication.password);

        // Create a copy of formData with the encrypted username and password
        const encryptedFormData = {
            ...formData,
            authentication: {
                ...formData.authentication,
                username: encryptedUsername,
                password: encryptedPassword,
            },
        };

        const uid = isUpdate ? data.key : generateUid();
        await engine.mutate({
            resource: `dataStore/r-data-source/${uid}`,
            type: isUpdate ? 'update' : 'create',
            data: { ...encryptedFormData }, // Save the encrypted form data
        });

        refetch();
        setSuccessMessage('Data source saved successfully!');

        // Delay a bit to show success message
        await new Promise((resolve) => setTimeout(() => resolve(), 2000));

        // Hide form after saving
        if (!isUpdate) {
            setIsShowDataSourceForm(false);
        } else {
            setIsShowDataSourceFormEdit(false);
        }

        // Reset form after saving if it's a create action
        if (!isUpdate) {
            reset({
                id: generateUid(),
                type: 'DHIS2',
                isCurrentDHIS2: false,
                authentication: { url: '', username: '', password: '' },
                instanceName: '',
                description: '',
            });
        }

    } catch (error) {
        console.error('Error saving data source:', error);
        setErrorMessage('Failed to save data source. Please try again.');
    }
};


    return (
        <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-md">
            <h1 className="text-2xl font-bold mb-4">{title}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Success and Error AlertBars */}
                {successMessage && (
                    <AlertBar duration={3000} onHidden={() => setSuccessMessage(null)} success>
                        {successMessage}
                    </AlertBar>
                )}
                {errorMessage && (
                    <AlertBar duration={4000} onHidden={() => setErrorMessage(null)} critical>
                        {errorMessage}
                    </AlertBar>
                )}

                {/* Data Source Type */}
                <div className="flex flex-col">
                    <label className="text-gray-700">Data Source Type</label>
                    <select
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        {...register('type')}
                    >
                        {dataSourceOptions.map((option) => (
                            <option key={option.name} value={option.name}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                    {errors.type && <span className="text-red-500">{errors.type.message}</span>}
                </div>

                {/* Instance Name */}
                <div className="flex flex-col">
                    <label className="text-gray-700">Instance Name</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        type="text"
                        {...register('instanceName', {
                            required: 'Instance name is required',
                            maxLength: { value: 50, message: 'Maximum length is 50 characters' },
                        })}
                    />
                    {errors.instanceName && <span className="text-red-500">{errors.instanceName.message}</span>}
                </div>

                {/* URL */}
                <div className="flex flex-col">
                    <label className="text-gray-700">URL</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        type="text"
                        {...register('authentication.url', { required: 'URL is required' })}
                    />
                    {errors.authentication?.url && (
                        <span className="text-red-500">{errors.authentication.url.message}</span>
                    )}
                </div>

                {/* Username */}
                <div className="flex flex-col">
                    <label className="text-gray-700">Username</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        type="text"
                        {...register('authentication.username', { required: 'Username is required' })}
                    />
                    {errors.authentication?.username && (
                        <span className="text-red-500">{errors.authentication.username.message}</span>
                    )}
                </div>

                {/* Password */}
                <div className="flex flex-col">
                    <label className="text-gray-700">Password</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        type="password"
                        {...register('authentication.password', { required: 'Password is required' })}
                    />
                    {errors.authentication?.password && (
                        <span className="text-red-500">{errors.authentication.password.message}</span>
                    )}
                </div>

                {/* Instance Description */}
                <div className="flex flex-col">
                    <label className="text-gray-700">Instance Description</label>
                    <input
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                        type="text"
                        {...register('description')}
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end mt-4">
                  
                    <Button 
                    
                    type='submit'
      text= {isSubmitting ? 'Loading...' : action === 'update' ? 'Update' : 'Save'}
      backgroundColor="primary"
      textColor="white"
      borderColor="slate-300"
      hoverBackgroundColor="white"
      hoverTextColor="primary"
      icon={<IoSaveOutline />} 
      disabled={isSubmitting}
                               />
                </div>
            </form>
        </div>
    );
};

export default DataSourceForm;
