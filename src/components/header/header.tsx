import { CircularLoader, IconMail24, IconMessages24, LogoIconWhite } from '@dhis2/ui';
import { Link, NavLink } from 'react-router-dom';
import { menuItems } from '../../data/menuLinks';
import './header.css';
import UserProfile from './UserProfile';
import HeaderApps from './HeaderApps';
import { useBaseUrl, useSystemInfo } from './../../services/fetchSystemInfo';

export default function Header() {
  const { loading, error, data } = useSystemInfo();
  const baseUrl = useBaseUrl();

  if (loading) {
    return <CircularLoader />;
  }

  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  return (
    <nav className='bg-dhisMainBlue text-white flex items-center justify-between '>
      <div className='flex items-center justify-center'>
        <div className='flex items-center justify-center'>
          <a href={baseUrl}>
            <div className='cursor-pointer hover:bg-[#1A557F] flex items-center justify-center mr-[12px] border-r-[1px] border-dhisGrey50 p-[10px]'>
              <LogoIconWhite className='h-[26px] w-[27px]' />
            </div>
          </a>
          <Link to={'/'} className='text-[14px] font-[500] border-r-[1px] border-dhisGrey50 p-[12px] min-w-[30vw]'>
            <p>{data?.title?.applicationTitle} - Visualizer Studio</p>
          </Link>
        </div>
        <menu>
          {menuItems.map((menuItem, index) => (
            <NavLink
              to={`/${menuItem.link}`}
              key={index}
              className={({ isActive }) =>
                `p-[12px] ${isActive ? 'bg-[#1A557F]' : 'hover:bg-[#1A557F]'}`
              }
            >
              {menuItem.name}
            </NavLink>
          ))}
        </menu>
      </div>
      <div>
        <div className='flex items-center'>
          <div className='relative p-[12px] cursor-pointer hover:bg-dhisDarkBlue'>
            <a href={`${baseUrl}/dhis-web-interpretation`}>
              <IconMessages24 />
              {data?.notifications?.unreadInterpretations > 0 && (
                <span className='bg-dhisMainGreen rounded-full w-[18px] h-[18px] px-[4px] text-[13px] font-[600] top-[3px] absolute ml-4'>
                </span>
              )}
            </a>
          </div>
          <div className='relative p-[12px] cursor-pointer hover:bg-dhisDarkBlue'>
            <a href={`${baseUrl}/dhis-web-messaging`}>
              <IconMail24 />
              {data?.notifications?.unreadMessageConversations > 0 && (
                <span className='bg-dhisMainGreen rounded-full w-[18px] h-[18px] px-[4px] text-[13px] font-[600] top-[3px] absolute ml-4'>
                  {data?.notifications?.unreadMessageConversations}
                </span>
              )}
            </a>
          </div>
          <HeaderApps />
          <UserProfile />
        </div>
      </div>
    </nav>
  );
}
