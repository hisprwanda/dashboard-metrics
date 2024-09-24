import React, { useState } from 'react';
import { useDataEngine } from '@dhis2/app-runtime';
import { AlertBar } from '@dhis2/ui';
import Button from "../../../../components/Button" 
import { MdDelete } from "react-icons/md";

type DeleteProps = {
    id: string;
    refetch: any;
    setIsShowDeleteDataSource:any
};

const DeleteDataSourceCard: React.FC<DeleteProps> = ({ id, refetch,setIsShowDeleteDataSource }) => {

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    const [isLoading,setIsLoading] = useState(false)
    const [isSuccess,setIsSuccess] = useState(false)
    const engine = useDataEngine();
    const deleteDataSource = async () => {
        try {
            setIsLoading(true);
          const resp =  await engine.mutate({
                resource: `dataStore/r-data-source/${id}`,
                type: "delete",
            });
            console.log('Delete response:', resp);
            if(resp?.httpStatus)
            {
                setIsSuccess(true)
            }
          
            setIsLoading(false);
            setSuccessMessage('Data source deleted successfully!');
            // show success message
            await new Promise((resolve:any) => setTimeout(() => {
                console.log("");  // Your code here
                resolve();
            }, 2000));
            
            refetch();
            setIsShowDeleteDataSource(false)
         
        
        } catch (error) {
            console.error('Error deleting data source:', error);
            setIsSuccess(false)
        }
        finally{
            setIsLoading(false)
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
            {/* Success message */}
            {successMessage && (
                <AlertBar
                    duration={3000}
                    onHidden={() => setSuccessMessage(null)}
                    success
                >
                    {successMessage}
                </AlertBar>
            )}

{!isSuccess && <>
    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Are you sure you want to delete this data source?
            </h2>
            <div className="flex justify-end space-x-4 ">
                {/* <Button
                    onClick={deleteDataSource}
                   // className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-gray-400 transition"
                   
                    disabled={isLoading}
                    destructive
                >
                 {isLoading ? "Loading..." : "Confirm" }   
                </Button> */}

                <Button 
                 type='button'
       onClick={deleteDataSource}
      text={isLoading ? "Loading..." : "Confirm" }
      disabled={isLoading}
      backgroundColor="destructive"
      textColor="white"
      borderColor="slate-300"

    //   hoverBackgroundColor="white"
    //   hoverTextColor="primary"
    

      icon={<MdDelete />}  />

            </div>
</>}
          
        </div>
    );
};

export default DeleteDataSourceCard;
