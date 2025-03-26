import { useState, useEffect, useRef } from 'react';
import { IconSettings24, IconUser24, IconQuestion24, IconInfo24, IconLogOut24, CircularLoader } from '@dhis2/ui';
import { Link } from 'react-router-dom';
import { useBaseUrl, useSystemInfo } from "./../../services/fetchSystemInfo";
import getNameValues from './../../lib/getNameValues';
const listFlex = 'flex gap-3 hover:bg-[#F3F5F7] px-5 py-3';

export default function UserProfile() {
    const { loading, error, data } = useSystemInfo();
    const baseUrl = useBaseUrl();
    const [isProfileVisible, setIsProfileVisible] = useState(false);
    const profileRef = useRef(null);

    const toggleProfile = () => {
        setIsProfileVisible(!isProfileVisible);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !(profileRef.current as HTMLElement).contains(event.target as Node)) {
                setIsProfileVisible(false);
            }
        };

        if (isProfileVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileVisible]);

    if (loading) {
        return <CircularLoader />;
    }

    if (error) {
        return <p className="text-red-500">Error: {error.message}</p>;
    }


    return (
        <div className='relative z-40'>
            <div
                className='p-[6px] cursor-pointer hover:bg-dhisDarkBlue'
                onClick={toggleProfile}
            >
                <div className='rounded-full bg-dhisGrey900 h-[36px] w-[36px] flex items-center justify-center'>DI</div>
            </div>

            {isProfileVisible && (
                <section ref={profileRef} className='bg-white text-[#212934] h-96 absolute top-12 right-0 w-80 shadow-md'>
                    <div className='border-b'>
                        <div className="flex gap-4 pl-6 py-5 border-b">
                            <div className="text-xl size-12 rounded-full bg-[#666F7B] flex items-center justify-center font-bold text-white cursor-pointer">
                                {getNameValues(data?.user?.name)}
                            </div>
                            <div>
                                <p className="text-base">{data?.user?.name}</p>
                                <p className="text-sm">{data?.user?.email}</p>
                                <a className="text-xs underline" href={`${baseUrl}/dhis-web-user-profile/#/profile`}>Edit profile</a>
                            </div>
                        </div>
                        <ul>
                            <a className={listFlex} href={`${baseUrl}/dhis-web-user-profile/#/settings`}><IconSettings24 /> Settings</a>
                            <a className={listFlex} href={`${baseUrl}/dhis-web-user-profile/#/account`}><IconUser24 /> Account</a>
                            <a className={listFlex} href={`${baseUrl}/dhis-web-commons-about/help.action`}><IconQuestion24 /> Help</a>
                            <a className={listFlex} href={`${baseUrl}/dhis-web-user-profile/#/aboutPage`}><IconInfo24 /> About</a>
                            <a className={listFlex} href={`${baseUrl}/dhis-web-commons-security/logout.action`}><IconLogOut24 /> Log Out</a>
                        </ul>
                    </div>
                </section>
            )}
        </div>
    );
}
