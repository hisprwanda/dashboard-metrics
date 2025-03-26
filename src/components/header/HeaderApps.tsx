import { useState, useEffect, useRef } from 'react';
import { CircularLoader, IconApps24, InputChangeHandler } from '@dhis2/ui';
import { IconSettings24, Input } from '@dhis2/ui';
import { useSystemInfo, useBaseUrl } from '../../services/fetchSystemInfo';
import { Link } from 'react-router-dom';
import { ModuleApps } from '@/types/moduleApp';
import formatImagePath from './../../lib/imagePath';
import joinPath from './../../lib/joinPath';

function escapeRegExpCharacters(text: string): string {
    return text.replace(/[/.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function HeaderApps() {
    const { loading, error, data } = useSystemInfo();
    const baseUrl = useBaseUrl();

    const [isAppsVisible, setIsAppsVisible] = useState(false);
    const appsRef = useRef(null);
    const iconRef = useRef(null);

    const toggleApps = () => {
        setIsAppsVisible(!isAppsVisible);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                appsRef.current &&
                !(appsRef.current as HTMLElement).contains(event.target as Node) &&
                iconRef.current &&
                !(iconRef.current as HTMLElement).contains(event.target as Node)
            ) {
                setIsAppsVisible(false);
            }
        };

        if (isAppsVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAppsVisible]);

    const [filter, setFilter] = useState<string>('');

    const handleFilterChange: InputChangeHandler = (payload, event) => {
        const newValue = payload.value || '';
        setFilter(newValue);
    };


    const filteredModules = data?.apps?.modules?.filter((module: ModuleApps) => {
        const appName = module.displayName || module.name;
        const formattedAppName = appName.toLowerCase();
        const formattedFilter = escapeRegExpCharacters(filter).toLowerCase();
        return filter.length > 0 ? formattedAppName.match(formattedFilter) : true;
    }) || [];

    if (loading) {
        return <CircularLoader />;
    }

    if (error) {
        return <p className="text-red-500">Error: {error.message}</p>;
    }
    return (
        <div className='relative z-40 ' >
            <div
                ref={iconRef}
                className='p-[12px] cursor-pointer hover:bg-dhisDarkBlue'
                onClick={toggleApps}
            >
                <IconApps24 />
            </div>
            {isAppsVisible && (
                <section ref={appsRef} className='bg-white text-[#212934] absolute top-12 right-0 shadow-md'>
                    <div className="w-[30vw] min-w-[300px] max-w-[560px]">
                        <div className='flex gap-2 items-center p-4'>
                            <Input
                                type="text"
                                value={filter}
                                onChange={handleFilterChange}
                                placeholder="Search apps"
                                className="border border-transparent rounded-lg w-full p-2 text-xs"
                            />
                            <a href={`${baseUrl}/dhis-web-menu-management`}>
                                <IconSettings24 />
                            </a>
                        </div>

                        <div className="flex flex-wrap items-start justify-start  m-2 min-h-[200px] max-h-[465px] overflow-auto">
                            {filteredModules.length > 0 ? (
                                filteredModules.map((module: ModuleApps) => {
                                    const linkToGo = joinPath(baseUrl, module.defaultAction);
                                    const imgSrc = joinPath(baseUrl, module.icon);

                                    return (
                                        <a
                                            href={linkToGo}
                                            key={module.namespace}
                                            className='flex flex-col text-center gap-2 items-center m-2 text-xs border border-transparent rounded-[12px] w-24 hover:bg-[#f5fbff]'
                                        >
                                            <img src={imgSrc} alt={`${module.displayName} icon`} className='size-12 m-2' />
                                            <p className='mt-3'>{module.displayName}</p>
                                        </a>
                                    );
                                })
                            ) : (
                                <p>No App available, Search again</p>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
